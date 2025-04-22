<template>
    <div class="row g-3">
      <div v-for="restaurant in restaurants" :key="restaurant.name" class="col-12 justify-content-center d-flex">
        <div class="card shadow-sm col-4 " style="overflow: hidden;"> 
          <div class="row g-0">
            <div class="col-md-4">
              <img
                v-if="restaurant.image"
                :src="'data:image/png;base64,' + restaurant.image"
                class="img-fluid rounded-start"
                alt="Restaurant Image"
                style=" height: 100%; max-height: 250px; width: 100%; object-fit: cover;" 
              />
              <div v-else class="d-flex justify-content-center align-items-center bg-secondary text-white" style="height: 100%;">
                Görsel Yok
              </div>
            </div>
            <div class="col-md-8 align-items-between">
              <div class="card-body">
                <h5 class="card-title">{{ restaurant.name }}</h5>

              </div>
              <div class="card-body">
                <p class="card-text"><i class="bi bi-geo-alt-fill text-secondary me-2"></i>{{ restaurant.location }}</p>
                <p class="card-text"><i class="bi bi-clock-fill text-secondary me-2"></i>{{ formatTime(restaurant.openingTime) }} - {{ formatTime(restaurant.closingTime) }}</p>
              </div>
              <div class="card-body">     
                <div class="d-flex justify-content-between">
                  <small class="text-muted"><i class="bi bi-signpost-fill text-warning me-2"></i>{{ formatDistance(restaurant.distance) }}  </small>
                  <small class="text-muted"><i class="bi bi-cash-coin text-success me-2"></i>Min. Sepet Tutarı : {{ formatPrice(restaurant.minServicePrice) }}</small>
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
  import axios from 'axios';
  
  const restaurants = ref([]);
  
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
  
  // Bileşen yüklendiğinde çalıştır
  onMounted( async () => {
    try {
      const response =await axios.get('/api/restaurant/list', { withCredentials: true });
      if(response.data.success){
        restaurants.value = response.data.data;
      }
      
    } catch (error) {
      console.error('POST isteği başarısız:', error);
    }
  });
  </script>
  
  
  <style scoped>
  .card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
  }
  
  .card-title {
    color: #FF9F00; /* Logonuzun ana rengi */
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  </style>