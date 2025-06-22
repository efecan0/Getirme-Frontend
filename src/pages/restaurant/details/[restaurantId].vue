<template>
  <div class="container py-4" v-if="restaurant">

    <!-- Restaurant Header -->
    <div class="card custom-card shadow-sm mb-4">
      <div class="row g-0 align-items-center">
        
        <div class="col-md-3 d-flex justify-content-center align-items-center p-3">
          <img
            v-if="restaurant.image"
            :src="'data:image/jpeg;base64,' + restaurant.image"
            class="img-fluid rounded-circle border border-3 border-warning"
            style="width: 150px; height: 150px; object-fit: cover;"
            alt="Restaurant Image"
          />
          <div v-else class="d-flex justify-content-center align-items-center bg-secondary text-white rounded-circle" style="width: 150px; height: 150px;">
            No Image
          </div>
        </div>

        <div class="col-md-9">
          <div class="card-body">
            <h1 class="h3 fw-bold text-warning">{{ restaurant.name }}</h1>
            <p class="text-muted mb-1">
              <i class="bi bi-geo-alt-fill text-danger me-2"></i>{{ restaurant.location }}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-clock-fill text-primary me-2"></i>{{ formatTime(restaurant.openingTime) }} - {{ formatTime(restaurant.closingTime) }}
            </p>

            <div class="d-flex gap-3 flex-wrap mt-3">
              <span class="badge bg-light text-dark border border-warning p-2">
                🚗 Distance: {{ formatDistance(restaurant.distance) }}
              </span>
              <span class="badge bg-light text-dark border border-success p-2">
                💰 Min. Order: {{ formatPrice(restaurant.minServicePrice) }}
              </span>
              <span class="badge bg-light text-dark border border-primary p-2">
                🕒 Estimated Delivery: {{ estimateArrivalTime(restaurant.distance)+20 }} min
              </span>
            </div>

            <!-- Carbon Footprint -->
            <div class="alert alert-success text-center fw-bold mt-4">
              🌍 Estimated Carbon Footprint: {{ estimateCarbonFootprint(restaurant.distance) }} kg CO₂
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Menu Header -->
    <h2 class="h4 fw-bold text-warning border-bottom pb-2 mb-4">
      <i class="bi bi-menu-button-wide me-2"></i>Menu
    </h2>

    <!-- Products -->
    <div class="row g-4">
      <div v-for="product in products" :key="product.id" class="col-12 col-md-6 col-lg-4">
        <div class="card product-card shadow-sm h-100" @click="goToProduct(product.id)" style="cursor: pointer;">
          <img
            v-if="product.image"
            :src="'data:image/png;base64,' + product.image"
            class="card-img-top"
            alt="Product Image"
            style="height: 200px; object-fit: cover;"
          />
          <div v-else class="d-flex justify-content-center align-items-center bg-secondary text-white" style="height: 200px;">
            No Image
          </div>
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title fw-bold">{{ product.name }}</h5>
              <p class="card-text small text-muted">{{ product.description }}</p>
            </div>
            <div class="mt-3 text-end">
              <span class="badge bg-warning text-dark">{{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useCartStore } from '@/store/cart';
const cartStore = useCartStore();

const route = useRoute();
const router = useRouter();
const restaurantId = route.params['restaurantId'];

const restaurant = ref({});
const products = ref([]);
const loading = ref(true);

const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5);
};

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return '';
  return `${distance.toFixed(1)} km`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '';
  return `${price.toFixed(2)} ₺`;
};

const estimateArrivalTime = (distanceKm) => {
  if (!distanceKm) return 0;
  const averageSpeedKmH = 30;
  const travelHours = distanceKm / averageSpeedKmH;
  const travelMinutes = Math.round(travelHours * 60);
  return travelMinutes;
};

const estimateCarbonFootprint = (distanceKm) => {
  if (!distanceKm) return '0.00';
  const carbonPerKm = 50; // 50 grams CO₂ per km
  const totalCarbonGrams = distanceKm * carbonPerKm;
  return (totalCarbonGrams / 1000).toFixed(2); // in kg
};

onMounted(async () => {
  try {
    const response = await axios.get(`/api/restaurant/details/${restaurantId}`, { withCredentials: true });
    if (response.data.success) {
      restaurant.value = response.data.data.restaurant;
      products.value = response.data.data.products;
    }
    if (!cartStore.restaurantId) {
      cartStore.restaurantId = Number(restaurantId);
    }
  } catch (error) {
    console.error('Error fetching details:', error);
  } finally {
    loading.value = false;
  }
});

const goToProduct = (productId) => {
  router.push({ name: 'restaurant-product-details', params: { productId } });
};
</script>

<style scoped>
.custom-card {
  border-left: 5px solid #FF9F00;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 159, 0, 0.3);
}

.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 10px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 159, 0, 0.4);
}

.card-title {
  color: #FF9F00;
}
</style>
