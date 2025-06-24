<template>
  <div ref="mapEl" class="w-100" style="height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* -------- props -------- */
const props = defineProps({
  points:    { type: Array,  required: true },           // [[lat,lon],…]
  arriveMin: { type: Number, default: 1 },               // toplam süre (dk)
  orderTime: { type: String, required: true }            // ISO 8601
});

/* -------- refs / let -------- */
const mapEl = ref(null);
let map, line, courier, timer;

/* -------- lifecycle -------- */
onMounted(init);
onBeforeUnmount(destroy);
watch(() => props.points, () => { destroy(); init(); }, { deep: true });

/* -------- init -------- */
function init () {
  if (!props.points?.length) return;

  /* 1) harita */
  map = L.map(mapEl.value);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19, attribution: '© OpenStreetMap' }
  ).addTo(map);

  /* 2) rota */
  line = L.polyline(props.points, { color: 'steelblue', weight: 4 }).addTo(map);
  map.fitBounds(line.getBounds(), { maxZoom: 14 });

  /* 3) ikonlar */
  const pinIcon = L.icon({
    iconUrl:  'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
    iconSize:  [25, 41],
    iconAnchor:[12, 41],
    shadowUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png'
  });
  const helmetIcon = L.icon({
    iconUrl:   'https://img.icons8.com/?size=100&id=lSPYEpFCElvV&format=png&color=000000',
    iconSize:  [36, 36],
    iconAnchor:[18, 18],
    className: 'courier-icon'
  });

  L.marker(props.points[0],   { icon: pinIcon }).addTo(map).bindPopup('Başlangıç');
  L.marker(props.points.at(-1), { icon: pinIcon }).addTo(map).bindPopup('Teslimat');

  /* 4) mesafe dizileri */
  const seg = [], cum = [0];
  for (let i = 1; i < props.points.length; i++) {
    seg[i] = dist(props.points[i-1], props.points[i]);
    cum[i] = cum[i-1] + seg[i];
  }
  const totalDist = cum.at(-1);

  /* 5) zaman hesabı */
  const totalMs   = props.arriveMin * 60_000;
  const elapsedMs = Date.now() - new Date(props.orderTime).getTime();
  const pctDone   = Math.min(elapsedMs / totalMs, 1);        // 0-1
  const travelled = totalDist * pctDone;                     // m

  /* 6) o ana dek kat edilen noktayı bul */
  let k = 1;
  while (k < cum.length && cum[k] < travelled) k++;
  const p1 = props.points[k-1], p2 = props.points[k];
  const localPct = seg[k] ? (travelled - cum[k-1]) / seg[k] : 0;
  const curLat = p1[0] + (p2[0]-p1[0])*localPct;
  const curLon = p1[1] + (p2[1]-p1[1])*localPct;

  /* 7) kurye marker’ı */
  courier = L.marker([curLat, curLon], { icon: helmetIcon }).addTo(map);

  /* sipariş zaten teslimse animasyon yok  */
  if (pctDone >= 1) return;

  /* 8) animasyon */
  const remainMs   = totalMs   - elapsedMs;
  const remainDist = totalDist - travelled;
  let start, prev = [curLat, curLon];

  function step (ts) {
    if (!start) start = ts;
    const pct = Math.min((ts - start) / remainMs, 1);          // 0-1
    const prog = travelled + remainDist * pct;                 // m → toplam yol

    /* hangi segmentteyiz? */
    let j = 1;
    while (j < cum.length && cum[j] < prog) j++;
    const q1 = props.points[j-1], q2 = props.points[j];
    const loc = seg[j] ? (prog - cum[j-1]) / seg[j] : 0;
    const lat = q1[0] + (q2[0]-q1[0])*loc;
    const lon = q1[1] + (q2[1]-q1[1])*loc;

    courier.setLatLng([lat, lon]);

    /* ↺ ikon döndür – translate3d’i bozma! */
    const img = courier.getElement();
    if (img) {
   //const base = img.style.transform.replace(/rotate\([^)]*\)/, '').trim();
   img.style.transform = `{${img}} rotate(${bearing(prev, [lat, lon])}deg)`;




    }
    prev = [lat, lon];

    line.setLatLngs([[lat, lon], ...props.points.slice(j)]);

    if (pct < 1) timer = requestAnimationFrame(step);
  }
  timer = requestAnimationFrame(step);
}

/* -------- helpers -------- */
function destroy() {
  if (timer) cancelAnimationFrame(timer);
  map?.remove();
  map = line = courier = null;
}

function dist([la1,lo1],[la2,lo2]) {
  const R=6371e3, rad=d=>d*Math.PI/180;
  const dφ=rad(la2-la1), dλ=rad(lo2-lo1);
  const φ1=rad(la1), φ2=rad(la2);
  const a=Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function bearing([la1,lo1],[la2,lo2]) {
  const rad=d=>d*Math.PI/180, dλ=rad(lo2-lo1);
  const y=Math.sin(dλ)*Math.cos(rad(la2));
  const x=Math.cos(rad(la1))*Math.sin(rad(la2))-
          Math.sin(rad(la1))*Math.cos(rad(la2))*Math.cos(dλ);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
</script>

<style scoped>
.courier-icon { transform-origin: center; }
</style>
