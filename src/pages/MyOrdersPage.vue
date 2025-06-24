<template>
  <div class="container py-4">
    <ToastNotification v-if="showStatusToast" :message="statusToastMessage" />

    <h1 class="h3 fw-bold text-warning mb-4">🛒 My Orders</h1>

    <div v-if="orders.length === 0" class="alert alert-info text-center">
      You have no orders yet.
    </div>

    <div v-else class="row g-4">
      <div v-for="order in orders" :key="order.id" class="col-12 col-md-6 col-lg-4">
        <div
          class="card shadow-sm order-card h-100"
          style="cursor: pointer;"
          @click="goToOrderDetails(order.id)"
        >
          <div class="card-body d-flex flex-column justify-content-between">

            <div>
              <h5 class="fw-bold text-warning">Order ID: #{{ order.id }}</h5>
              <p class="mb-2"><strong>Total Price:</strong> {{ order.totalPrice.toFixed(2) }} ₺</p>
              <p class="mb-2"><strong>Restaurant:</strong> {{ order.restaurant.name }}</p>

              <p class="mb-2">
                <strong>Status:</strong>
                <span class="badge bg-primary">{{ statusText(order.status) }}</span>
              </p>

              <div v-if="order.status === 'ON_THE_WAY'" class="progress my-3" style="height: 20px;">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                  role="progressbar"
                  :style="{ width: order.progress + '%' }"
                  :aria-valuenow="order.progress" aria-valuemin="0" aria-valuemax="100"
                >
                  {{ order.progress }}%
                </div>
              </div>

              <div v-if="order.status === 'ON_THE_WAY'" class="alert alert-primary p-2 text-center fw-bold">
                <template v-if="getLiveRemainingTime(order) > 0">
                  🚚 On the way! Estimated delivery: {{ getLiveRemainingTime(order) }} min left
                </template>
                <template v-else>
                  {{ getDelayMessage(order) }}
                </template>
              </div>

              <div v-else-if="order.status === 'PREPARING'" class="alert alert-warning p-2 text-center fw-bold">
                <template v-if="getLiveRemainingTime(order) > 0">
                  👨‍🍳 Preparing! Estimated delivery: {{ getLiveRemainingTime(order) }} min left
                </template>
                <template v-else>
                  {{ getDelayMessage(order) }}
                </template>
              </div>

              <div v-else-if="order.status === 'DELIVERED'" class="alert alert-success p-2 text-center fw-bold">
                ✅ Delivered!
              </div>

              <div v-else-if="order.status === 'CANCELLED'" class="alert alert-danger p-2 text-center fw-bold">
                ❌ Order Cancelled!
              </div>

              <div v-else class="alert alert-info p-2 text-center fw-bold">
                🛒 Order Received!
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
    console.error('Failed to fetch orders:', error);
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
    console.error('Failed to fetch location:', error);
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
    console.error('Failed to fetch weather:', error);
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
  const order = orders.value.find(o => o.id === orderId);
  const arriveTime = calculateEstimatedDeliveryTime(order.restaurant.distance);  // dakika cinsinden

  router.push({
    name: 'order-details',
    params: { orderId },
    query: { arriveTime: arriveTime ?? 0 }
  });
};


const statusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Order Received';
    case 'PREPARING': return 'Preparing';
    case 'ON_THE_WAY': return 'On the Way';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const onOrderUpdateReceived = (update) => {
  if (!update || !update.orderId) return;

  const idx = orders.value.findIndex(o => o.id === update.orderId);

  if (idx !== -1) {
    if (update.newStatus) {
      orders.value[idx].status = update.newStatus;

      switch (update.newStatus) {
        case 'PREPARING':
          statusToastMessage.value = '👨‍🍳 Order is being prepared!';
          break;
        case 'ON_THE_WAY':
          statusToastMessage.value = '🚚 Order is on the way!';
          break;
        case 'DELIVERED':
          statusToastMessage.value = '✅ Order delivered!';
          break;
        case 'CANCELLED':
          statusToastMessage.value = '❌ Order cancelled!';
          break;
        default:
          statusToastMessage.value = '📦 Order status updated!';
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
  const createdAt = new Date(order.date);
  const now = new Date();

  const diffMs = now - createdAt;
  const elapsedMinutes = Math.floor(diffMs / 60000);

  let estimatedMinutes = 0;

  if (order.status === 'ON_THE_WAY') {
    estimatedMinutes = calculateEstimatedDeliveryTime(order.restaurant.distance);
  } else if (order.status === 'PREPARING') {
    estimatedMinutes = calculateEstimatedDeliveryTime(order.restaurant.distance) + 15;
  } else {
    return null;
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

  if (delay <= 0) return null;

  if (delay < 5) {
    return `We’re slightly over the estimate 🙏 Your order is arriving shortly!`;
  } else if (delay < 10) {
    return `We’ve exceeded the estimate 😅 Please expect delivery within 5-10 minutes!`;
  } else if (delay < 20) {
    return `We apologize for the delay 😔 Your courier is on the way and will arrive soon.`;
  } else {
    return `⚠️ Significant delay. Please contact customer support for assistance.`;
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
