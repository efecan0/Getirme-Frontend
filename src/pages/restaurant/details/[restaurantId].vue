
<template>
  <div class="container py-4">
    <!-- Restoran Başlık -->
    <div class="card mb-4 shadow-sm">
      <div class="row g-0">
        <!-- Resim -->
        <div class="col-md-3 text-center p-3">
          <img 
            :src="restaurant.image ? 'data:image/jpeg;base64,' + restaurant.image : 'placeholder-image.jpg'"
            class="img-fluid rounded-circle border border-3 border-warning"
            style="width: 150px; height: 150px; object-fit: cover;"
            alt="Restoran Resmi"
          >
        </div>

        <!-- Detaylar -->
        <div class="col-md-9">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 class="h2 fw-bold mb-1" style="color:#FF9F00;">
                  {{ restaurant.name }}
                </h1>
                <div class="d-flex align-items-center text-muted mb-2">
                  <i class="bi bi-geo-alt fs-5 me-2 text-danger"></i>
                  <span>{{ restaurant.location }}</span>
                </div>
              </div>
              <span class="badge bg-success bg-opacity-10 text-success fs-6">
                <i class="bi bi-signpost-split me-1"></i>{{ restaurant.distance }} km
              </span>
            </div>

            <!-- Bilgi Kutucukları -->
            <div class="d-flex flex-wrap gap-3 mb-3">
              <div class="bg-light p-3 rounded-2">
                <i class="bi bi-clock fs-5 text-primary me-2"></i>
                <span class="fw-bold">{{ formatTime(restaurant.openingTime) }} - {{ formatTime(restaurant.closingTime) }}</span>
              </div>
              
              <div class="bg-light p-3 rounded-2">
                <i class="bi bi-truck fs-5 text-warning me-2"></i>
                <span class="fw-bold">Min. Tutar: {{ restaurant.minServicePrice }} ₺</span>
              </div>
            </div>

           
  
          </div>
        </div>
      </div>
    </div>

    <!-- Ürünler -->
    <h3 class="h4 mb-4 border-bottom pb-2">
      <i class="bi bi-menu-button-wide me-2"></i>Menü
    </h3>
    
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="product in products" :key="product.id">
        <div class="card h-100 shadow-sm border-0">
          <div class="position-relative">
            <img 
              :src="product.image ? 'data:image/jpeg;base64,' + product.image : 'placeholder-product.jpg'"
              class="card-img-top"
              style="height: 200px; object-fit: cover;"
              alt="Ürün Resmi"
            >
            <span class="position-absolute top-0 end-0 m-2 badge bg-dark">
              {{ product.price }} ₺
            </span>
          </div>
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ product.name }}</h5>
            <p class="card-text text-muted small">{{ product.description }}</p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <button class="btn btn-success w-100">
              <i class="bi bi-cart-plus me-2"></i>Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted,ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const restaurantId = route.params['restaurantId'];

const restaurant = ref({});
const products = ref([]);
onMounted(async () => {
    try {
      const response =await axios.get(`/api/restaurant/details/${restaurantId}`, { withCredentials: true });
      
      if(response.data.success){
        restaurant.value =response.data.data.restaurant
        console.log(restaurant.value)
        products.value = response.data.data.products
      }
    } catch (error) {
      console.error('POST isteği başarısız:', error);
    }
  });

const formatTime = (time) => {
    return String(time).slice(0,5);
  }

</script>


<style>
/* Gerekirse özel stiller */
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-3px);
}
</style>