<template>
  <!-- Harita “container”ı. Yüksekliği dilediğin gibi ayarla -->
  <div ref="mapEl" class="w-100" style="height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ------------- Props ------------- */
const props = defineProps({
  points:      { type: Array, required: true },      // [[lat,lon], …]
  arriveMin:   { type: Number, default: 1 }         // toplam süre (dk)
});

/* ------------- Refs & let’ler ------------- */
const mapEl  = ref(null);   // DOM düğümü
let   map, line, courier, timer;   // Leaflet objeleri / setInterval

/* ------------- Hayat döngüsü ------------- */
onMounted(() => init());

onBeforeUnmount(() => destroy());

/* ------------- Prop değişince haritayı sıfırla ------------- */
watch(
  () => props.points,
  () => { destroy(); init(); },
  { deep: true }
);

/* ------------- Fonksiyonlar ------------- */
function init() {
  if (!props.points?.length) return;

  /* 1) Harita */
  map = L.map(mapEl.value);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  /* 2) Rota çizgisi + fitBounds */
  line = L.polyline(props.points, { color: 'steelblue', weight: 4 }).addTo(map);
  map.fitBounds(line.getBounds(), { maxZoom: 14 });

  const startIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
  iconSize:  [25, 41],
  iconAnchor:[12, 41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png'
});

  /* 3) Sabit Başlangıç / Bitiş */
  L.marker(props.points[0],  { icon: startIcon }).addTo(map).bindPopup('Başlangıç');
  L.marker(props.points.at(-1), { icon: startIcon  }).addTo(map).bindPopup('Bitiş');

  /* 4) Kask ikonlu kurye */
  const helmetIcon = L.icon({
    iconUrl:  'https://img.icons8.com/?size=100&id=lSPYEpFCElvV&format=png&color=000000',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: 'courier-icon'
  });
  courier = L.marker(props.points[0], { icon: helmetIcon }).addTo(map);

  /* 5) Animasyon */
   const totalMs = props.arriveMin * 60_000;
   console.log(totalMs);

 /* Noktalar arası mesafeler + kümülatif dizi */
 const segLen = [];               // [m,m,…]
 const cumLen = [0];              // [0, m1, m1+m2, …]
 for (let k = 1; k < props.points.length; k++) {
   segLen[k] = distance(props.points[k - 1], props.points[k]);
   cumLen[k] = cumLen[k - 1] + segLen[k];
 }
 const total = cumLen.at(-1);     // tüm rota (m)

 let start;                       // rAF başlangıç zaman damgası
 let prev = props.points[0];
 function step(ts) {
   if (!start) start = ts;
   const elapsed = ts - start;            // ms
   const pct     = Math.min(elapsed / totalMs, 1);   // 0-1
   const target  = pct * total;            // m

   /* Hangi segment? */
   let idx = 1;
   while (idx < cumLen.length && cumLen[idx] < target) idx++;

   /* p1-p2 üzerinde ara nokta */
   const p1 = props.points[idx - 1];
   const p2 = props.points[idx];
   const segStart = cumLen[idx - 1];
   const localPct = (target - segStart) / segLen[idx];

   const lat = p1[0] + (p2[0] - p1[0]) * localPct;
   const lon = p1[1] + (p2[1] - p1[1]) * localPct;

   courier.setLatLng([lat, lon]);
   //const angle = bearing(prev, [lat, lon]);
   const img   = courier.getElement();
   //const base = img.style.transform.replace(/rotate\([^)]*\)/, '').trim();
   img.style.transform = `{${img}} rotate(${bearing(prev, [lat, lon])}deg)`;
   prev = [lat, lon];
   line.setLatLngs([[lat, lon], ...props.points.slice(idx)]);

   if (pct < 1) {
     timer = requestAnimationFrame(step);
   }
 }
 timer = requestAnimationFrame(step);
}

/* Bearing (derece) */
function bearing([la1, lo1], [la2, lo2]) {
  const toRad = d => d * Math.PI / 180;
  const dLon  = toRad(lo2 - lo1);
  const y = Math.sin(dLon) * Math.cos(toRad(la2));
  const x = Math.cos(toRad(la1)) * Math.sin(toRad(la2)) -
            Math.sin(toRad(la1)) * Math.cos(toRad(la2)) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/* Her yeniden başlatmada temizle */
function destroy() {
  if (timer) cancelAnimationFrame(timer);
  if (map)   map.remove();     // polyline / marker’lar da gider
  map = line = courier = null;
}

function distance([la1, lo1], [la2, lo2]) {
  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const dφ = toRad(la2 - la1);
  const dλ = toRad(lo2 - lo1);
  const φ1 = toRad(la1), φ2 = toRad(la2);
  const a = Math.sin(dφ/2)**2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
</script>

<style scoped>
.courier-icon { transform-origin: center; }
</style>
