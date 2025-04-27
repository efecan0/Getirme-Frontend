<template>
  <div class="container py-4">
    
    <h1 class="h3 fw-bold text-warning mb-4">🍽️ Restoranlar</h1>

    <!-- Spinner Yükleniyor -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 300px;">
      <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Yükleniyor...</span>
      </div>
    </div>

    <!-- Restoran Listesi -->
    <div v-else class="row g-4">
      <div v-for="restaurant in restaurants" :key="restaurant.id" class="col-12 d-flex justify-content-center">
        <div 
          class="card custom-card shadow-sm col-12 col-md-8 col-lg-6" 
          style="overflow: hidden; cursor: pointer;"
          @click="goToRestaurantDetails(restaurant.id)"
        > 
          <div class="row g-0">

            <!-- Restoran Görseli -->
            <div class="col-md-4">
              <img
                v-if="restaurant.image"
                :src="'data:image/png;base64,' + restaurant.image"
                class="img-fluid rounded-start"
                alt="Restaurant Image"
                style="height: 100%; max-height: 250px; width: 100%; object-fit: cover;" 
              />
              <div v-else class="d-flex justify-content-center align-items-center bg-secondary text-white" style="height: 100%;">
                Görsel Yok
              </div>
            </div>

            <!-- Restoran Bilgileri -->
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">{{ restaurant.name }}</h5>
                <p class="card-text small text-muted mb-2">
                  <i class="bi bi-geo-alt-fill text-secondary me-2"></i>{{ restaurant.location }}
                </p>
                <p class="card-text small text-muted mb-2">
                  <i class="bi bi-clock-fill text-secondary me-2"></i>{{ formatTime(restaurant.openingTime) }} - {{ formatTime(restaurant.closingTime) }}
                </p>
                <div class="d-flex justify-content-between small mt-3">
                  <span><i class="bi bi-signpost-fill text-warning me-2"></i>{{ formatDistance(restaurant.distance) }}</span>
                  <span><i class="bi bi-cash-coin text-success me-2"></i>Min: {{ formatPrice(restaurant.minServicePrice) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const restaurants = ref([]);
const loading = ref(true);

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return '';
  return `${distance.toFixed(1)} km`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '';
  return `${price.toFixed(2)} ₺`;
};

onMounted(async () => {
  try {
    const response = await axios.get('/api/restaurant/list', { withCredentials: true });
    if (response.data.success) {
      restaurants.value = response.data.data;
    }
  } catch (error) {
    console.error('POST isteği başarısız:', error);
  } finally {
    loading.value = false;
  }
});

// Kart tıklayınca restoran detay sayfasına git
const goToRestaurantDetails = (id) => {
  router.push({ name: 'restaurant-details', params: { restaurantId: id } });
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

.card-title {
  color: #FF9F00;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
</style>
