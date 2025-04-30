<template>
    <div class="container py-4">
        <ToastNotification v-if="showStatusToast" :message="statusToastMessage" />

      <h1 class="h3 fw-bold text-warning mb-4">🛒 Siparişlerim</h1>
  
      <div v-if="orders.length === 0" class="alert alert-info text-center">
        Henüz bir siparişiniz bulunmamaktadır.
      </div>
  
      <div v-else class="row g-4">
        <div v-for="order in orders" :key="order.id" class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm order-card h-100"
          style="cursor: pointer;"
          @click="goToOrderDetails(order.id)">
            <div class="card-body d-flex flex-column justify-content-between">
  
              <div>
                <h5 class="fw-bold text-warning">Sipariş ID: #{{ order.id }}</h5>
                <p class="mb-2"><strong>Toplam Fiyat:</strong> {{ order.totalPrice.toFixed(2) }} ₺</p>
                <p class="mb-2"><strong>Restoran:</strong> {{ order.restaurant.name }}</p>
  
                <p class="mb-2"><strong>Durum:</strong> 
                  <span class="badge bg-primary">{{ statusText(order.status) }}</span>
                </p>

                <div v-if="order.status === 'ON_THE_WAY'" class="progress my-3" style="height: 20px;">
                <div 
                    class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                    role="progressbar"
                    :style="{ width: order.progress + '%' }"
                    :aria-valuenow="order.progress" aria-valuemin="0" aria-valuemax="100">
                    {{ order.progress }}%
                </div>
                </div>

                <div v-if="order.status === 'ON_THE_WAY'" class="alert alert-primary p-2 text-center fw-bold">
                  <template v-if="getLiveRemainingTime(order) > 0">
                    🚚 Yolda! Tahmini Teslim: {{ getLiveRemainingTime(order) }} dk kaldı
                  </template>
                  <template v-else>
                    {{ getDelayMessage(order) }}
                  </template>
                </div>

                <div v-else-if="order.status === 'PREPARING'" class="alert alert-warning p-2 text-center fw-bold">
                  <template v-if="getLiveRemainingTime(order) > 0">
                    👨‍🍳 Hazırlanıyor! Tahmini Teslim: {{ getLiveRemainingTime(order) }} dk kaldı
                  </template>
                  <template v-else>
                    {{ getDelayMessage(order) }}
                  </template>
                </div>

  
                <div v-else-if="order.status === 'DELIVERED'" class="alert alert-success p-2 text-center fw-bold">
                  ✅ Teslim Edildi!
                </div>
  
                <div v-else-if="order.status === 'CANCELLED'" class="alert alert-danger p-2 text-center fw-bold">
                  ❌ Sipariş İptal Edildi!
                </div>
  
                <div v-else class="alert alert-info p-2 text-center fw-bold">
                  🛒 Sipariş Alındı!
                </div>
  
              </div>
  
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import axios from 'axios';
  import { connectWebSocket, disconnectWebSocket } from '@/webSocketClient';
  import { useRouter } from 'vue-router';
  import ToastNotification from '@/components/ToastNotification.vue';

  const showStatusToast = ref(false);
  const statusToastMessage = ref('');


const router = useRouter();
  
  const orders = ref([]);
  const userLocation = ref(null);
  const weatherInfo = ref(null);
  
  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/myOrders', { withCredentials: true });
      if (response.data.success) {
        orders.value = response.data.data;
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    }
  };

  const fetchUserLocation = async () => {
  try {
    const response = await axios.get('/api/customer/location', { withCredentials: true });
    if (response.data) {
      userLocation.value = response.data.data;
      fetchWeather();
    }
  } catch (error) {
    console.error('Konum alınamadı:', error);
  }
};

const fetchWeather = async () => {
  if (!userLocation.value) return;

  const apiKey = process.env.VUE_APP_OPENWEATHERMAP_API_KEY;
  const lat = userLocation.value.latitude;
  const lon = userLocation.value.longitude;
  
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    weatherInfo.value = response.data;
  } catch (error) {
    console.error('Hava durumu alınamadı:', error);
  }
};



const calculateEstimatedDeliveryTime = (distanceKm) => {
  if (!distanceKm) return 0;

  let averageSpeedKmH = 30;
  let travelMinutes = Math.round((distanceKm / averageSpeedKmH) * 60);

  if (weatherInfo.value && weatherInfo.value.weather) {
    const weatherMain = weatherInfo.value.weather[0].main;

    if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain)) {
      travelMinutes += 10;
    }
  }

  if (weatherInfo.value && weatherInfo.value.wind && weatherInfo.value.wind.speed > 5) {
    travelMinutes += 5;
  }


   let trafficFactor = 1.0;

    if (weatherInfo.value) {
    if (weatherInfo.value.wind && weatherInfo.value.wind.speed > 7) {
        trafficFactor = 1.5;
    } else if (weatherInfo.value.visibility && weatherInfo.value.visibility < 5000) {
        trafficFactor = 1.4;
    } else if (weatherInfo.value.clouds && weatherInfo.value.clouds.all > 80) {
        trafficFactor = 1.2;
    }
    }

  travelMinutes = Math.round(travelMinutes * trafficFactor);

  return travelMinutes;
};


const goToOrderDetails = (orderId) => {
  router.push({ name: 'order-details', params: { orderId } });
};


  
  const statusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Sipariş Alındı';
      case 'PREPARING': return 'Hazırlanıyor';
      case 'ON_THE_WAY': return 'Yolda';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };
  
  const onOrderUpdateReceived = (update) => {
  if (!update || !update.orderId) return;

  const idx = orders.value.findIndex(o => o.id === update.orderId);

  if (idx !== -1) {
    if (update.newStatus) {
      orders.value[idx].status = update.newStatus;

      // ✅ HER DURUM DEĞİŞİMİNDE TOAST GÖSTER
      switch (update.newStatus) {
        case 'PREPARING':
          statusToastMessage.value = '👨‍🍳 Sipariş Hazırlanıyor!';
          break;
        case 'ON_THE_WAY':
          statusToastMessage.value = '🚚 Sipariş Yola Çıktı!';
          break;
        case 'DELIVERED':
          statusToastMessage.value = '✅ Sipariş Teslim Edildi!';
          break;
        case 'CANCELLED':
          statusToastMessage.value = '❌ Sipariş İptal Edildi!';
          break;
        default:
          statusToastMessage.value = '📦 Sipariş Durumu Güncellendi!';
      }

      showStatusToast.value = true;
      setTimeout(() => {
        showStatusToast.value = false;
      }, 3000);
    }

    if (update.progress !== undefined) {
      orders.value[idx].progress = update.progress;
    }
  } else if (update.totalPrice) {
    orders.value.push(update);
  }
};

const getLiveRemainingTime = (order) => {
  const createdAt = new Date(order.date); // Sipariş oluşturulma zamanı
  const now = new Date();

  const diffMs = now - createdAt;
  const elapsedMinutes = Math.floor(diffMs / 60000); // milisaniyeyi dakikaya çevir

  let estimatedMinutes = 0;

  if (order.status === 'ON_THE_WAY') {
    estimatedMinutes = calculateEstimatedDeliveryTime(order.restaurant.distance);
  } else if (order.status === 'PREPARING') {
    estimatedMinutes = calculateEstimatedDeliveryTime(order.restaurant.distance) + 5;
  } else {
    return null; // bu statüler için süre gösterme
  }

  const remaining = estimatedMinutes - elapsedMinutes;
  return remaining;
};

const getDelayMessage = (order) => {
  const createdAt = new Date(order.date);
  const now = new Date();

  const elapsedMinutes = Math.floor((now - createdAt) / 60000);
  let estimated = 0;

  if (order.status === 'ON_THE_WAY') {
    estimated = calculateEstimatedDeliveryTime(order.restaurant.distance);
  } else if (order.status === 'PREPARING') {
    estimated = calculateEstimatedDeliveryTime(order.restaurant.distance) + 5;
  } else {
    return null;
  }

  const delay = elapsedMinutes - estimated;

  if (delay <= 0) return null; // gecikme yok

  if (delay < 5) {
    return `Tahmini süreyi azıcık aştık 🙏 Siparişiniz çok yakında!`;
  } else if (delay < 10) {
    return `Tahmini süreyi geçtik 😅 Lütfen 5-10 dakika içinde kapınızda olacak!`;
  } else if (delay < 20) {
    return `Gecikme için özür dileriz 😔 Kurye yolda, en kısa sürede orada olacak.`;
  } else {
    return `⚠️ Sipariş ciddi şekilde gecikti, destek ekibimizle iletişime geçebilirsiniz.`;
  }
};



onMounted(() => {
  fetchOrders();
  fetchUserLocation();
  connectWebSocket(onOrderUpdateReceived);
});
  
  onUnmounted(() => {
    disconnectWebSocket();
  });
  </script>
  
  <style scoped>
  .order-card {
    border-left: 5px solid #FF9F00;
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .order-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(255, 159, 0, 0.3);
  }
  </style>
  