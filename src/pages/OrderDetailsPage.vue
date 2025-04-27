<template>
    <div v-if="order">
      <!-- Teslimat Durumu -->
      <div class="alert text-center fw-bold mb-3" 
           :class="orderStatus === 'DELIVERED' ? 'alert-success' : 'alert-warning'">
        <template v-if="orderStatus === 'DELIVERED'">
          ✅ Sipariş Teslim Edildi
        </template>
        <template v-else>
          ⏳ Tahmini Teslimat: {{ calculateEstimatedDeliveryTime(order.restaurant.distance) }} dakika
        </template>
      </div>
  
      <!-- Karbon Ayak İzi -->
      <div class="alert alert-light border border-warning text-center fw-bold mb-4 shadow-sm">
        🌍 Tahmini Karbon Ayak İzi: 
        <span class="text-warning">{{ (estimateCarbonFootprint(order.restaurant.distance) / 1000).toFixed(2) }} kg CO₂</span>
      </div>
  
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 fw-bold text-warning">📦 Sipariş Detayı - #{{ order.id }}</h1>
          <button class="btn btn-outline-warning fw-bold" @click="goBack">
            <i class="bi bi-arrow-left"></i> Geri Dön
          </button>
        </div>
  
        <!-- Sipariş Özeti -->
        <div class="card custom-card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold text-warning">🗓 Sipariş Özeti</h5>
            <p class="card-text">
              <strong>Sipariş Tarihi:</strong> {{ formatOrderDate(order.date) }}<br>
              <strong>Toplam Fiyat:</strong> {{ order.totalPrice.toFixed(2) }} ₺
            </p>
          </div>
        </div>
  
        <!-- Müşteri Bilgisi -->
        <div class="card custom-card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold text-warning">👤 Müşteri Bilgisi</h5>
            <p class="card-text">
              {{ order.customer.name }} {{ order.customer.surname }}<br>
              Lokasyon: {{ order.customer.location }}
            </p>
          </div>
        </div>
  
        <!-- Restoran Bilgisi -->
        <div class="card custom-card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold text-warning">🏠 Restoran Bilgisi</h5>
            <p class="card-text">
              <strong>Restoran Adı:</strong> {{ order.restaurant.name }}<br>
              <strong>Konum:</strong> {{ order.restaurant.location }}<br>
              <strong>Çalışma Saatleri:</strong> {{ order.restaurant.openingTime }} - {{ order.restaurant.closingTime }}<br>
              <strong>Mesafe:</strong> {{ order.restaurant.distance }} km
            </p>
          </div>
        </div>
  
        <!-- Ürünler -->
        <div class="card custom-card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold text-warning">🍔 Ürünler</h5>
            <div v-for="product in order.orderProducts" :key="product.id" class="mb-4">
              <h6 class="fw-bold">{{ product.name }} (Adet: {{ product.size }})</h6>
              <ul class="list-unstyled ms-3">
                <li v-for="content in product.selectableContentDtoList" :key="content.id" class="mb-2">
                  <strong>{{ content.name }}:</strong>
                  <span v-for="option in content.selectableContentOptionDtoList" :key="option.id" class="badge custom-badge ms-1">
                    {{ option.name }} ({{ option.price }}₺)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <div class="text-end mt-3">
          <h5 class="fw-bold text-warning">Toplam Fiyat: {{ order.totalPrice.toFixed(2) }} ₺</h5>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import { connectWebSocket, disconnectWebSocket } from '@/webSocketClient';

  const route = useRoute();
  const router = useRouter();
  const orderId = route.params.orderId;
  const order = ref(null);
  const orderStatus = ref('');
  const weatherInfo = ref(null);
  const userLocation = ref(null);
  
  onMounted(async () => {
    await fetchOrder();
    await fetchUserLocation();
    connectWebSocket(onStatusUpdateReceived);
  });
  
  onUnmounted(() => {
    disconnectWebSocket();
  });
  
  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orderDetails/${orderId}`, { withCredentials: true });
      if (response.data.success) {
        order.value = response.data.data;
        orderStatus.value = order.value.status;
      }
    } catch (error) {
      console.error('Sipariş detayı alınamadı:', error);
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
    
    if (!distanceKm || isNaN(distanceKm)) return 0;
  
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
  
  const estimateCarbonFootprint = (distanceKm) => {
    const carbonPerKm = 50;
    const totalCarbon = distanceKm * carbonPerKm;
    return totalCarbon;
  };

  const formatOrderDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  
  const goBack = () => {
    router.back();
  };
  
  const onStatusUpdateReceived = (newStatus) => {
    orderStatus.value = newStatus;
  };
  </script>
  
  <style scoped>
  .custom-card {
    border-left: 5px solid #FF9F00;
    border-radius: 12px;
    padding: 1rem;
  }
  
  .custom-badge {
    background-color: #FF9F00;
    color: white;
    font-size: 0.8rem;
  }
  .badge {
    font-size: 0.8rem;
  }
  </style>
  