<template>
    <div v-if="product" class="container py-4">
      <div class="row g-4">
        <!-- Ürün Resmi -->
        <div class="col-lg-5">
          <div class="card shadow-sm border-0 h-100">
            <div class="ratio ratio-1x1">
              <img 
                v-if="product.image" 
                :src="'data:image/jpeg;base64,' + product.image" 
                class="card-img-top object-fit-cover rounded-start"
                alt="Ürün Resmi"
              >
              <div v-else class="d-flex align-items-center justify-content-center bg-light text-muted h-100">
                <i class="bi bi-image-fill" style="font-size: 3rem;"></i>
              </div>
            </div>
            <div class="card-footer bg-white border-0 pt-0 position-relative">
              <span class="badge bg-dark fs-5 position-absolute top-0 end-0 m-3">
                {{ product.price }}₺
              </span>
            </div>
          </div>
        </div>
  
        <!-- Ürün Bilgileri -->
        <div class="col-lg-7">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h1 class="h2 fw-bold mb-3">{{ product.name }}</h1>
              <p class="text-muted mb-4">{{ product.description }}</p>
  
              <!-- Seçilebilir İçerikler -->
              <div class="mb-4" v-for="content in selectableContent" :key="content.id">
                <h3 class="h5 fw-bold mb-3">
                  <i class="bi bi-list-check me-2"></i>{{ content.name }}
                </h3>
                <div class="d-flex flex-wrap gap-2">
                  <button 
                    v-for="option in content.selectableContentOptionDtoList" 
                    :key="option.id"
                    class="btn btn-sm btn-outline-secondary px-3 py-2"
                    :class="{ 'active': selectedOptions[content.id] === option.id }"
                    @click="toggleOption(content.id, option.id)"
                  >
                    {{ option.name }} 
                    <span v-if="option.price > 0" class="ms-1 fw-bold">+{{ option.price }}₺</span>
                  </button>
                </div>
              </div>
  
              <!-- Adet Seçimi -->
              <div class="mb-4">
                <h3 class="h5 fw-bold mb-3">
                  <i class="bi bi-123 me-2"></i>Adet
                </h3>
                <div class="quantity-selector d-flex align-items-center">
                  <button class="btn btn-outline-primary px-3 py-1" @click="decrementQuantity">
                    <i class="bi bi-dash-lg"></i>
                  </button>
                  <span class="mx-3 fw-bold fs-5">{{ quantity }}</span>
                  <button class="btn btn-outline-primary px-3 py-1" @click="incrementQuantity">
                    <i class="bi bi-plus-lg"></i>
                  </button>
                </div>
              </div>
  
              <!-- Sepet Butonu -->
              <button class="btn btn-primary w-100 py-3 fw-bold mt-auto" @click="addToCart">
                <i class="bi bi-cart-plus me-2"></i>SEPETE EKLE - {{ totalPrice }}₺
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { onMounted,ref, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const productId = route.params['productId'];
const product = ref();
const selectableContent = ref();
onMounted(async () => {
    try {
      const response =await axios.get(`/api/restaurant/product/details/${productId}`, { withCredentials: true });
      
      if(response.data.success){
        product.value = response.data.data.product;
        selectableContent.value = response.data.data.selectableContent;
      }
    } catch (error) {
      console.error('POST isteği başarısız:', error);
    }
  });




const selectedOptions = ref({});
const quantity = ref(1);

// Seçenek seçme fonksiyonu
const toggleOption = (contentId, optionId) => {
  if (selectedOptions.value[contentId] === optionId) {
    // Eğer zaten seçiliyse seçimi kaldır
    selectedOptions.value[contentId] = null;
  } else {
    // Değilse seç
    selectedOptions.value[contentId] = optionId;
  }
};

// Adet arttırma/azaltma
const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

// Toplam fiyat hesaplama
const totalPrice = computed(() => {
  let total = product.value.price;
  
  // Seçilen seçeneklerin fiyatlarını ekle
  for (const content of selectableContent.value) {
    const selectedOptionId = selectedOptions.value[content.id];
    if (selectedOptionId) {
      const option = content.selectableContentOptionDtoList.find(o => o.id === selectedOptionId);
      if (option) total += option.price;
    }
  }
  
  return (total * quantity.value).toFixed(2);
});

const addToCart = () => {
  const cartItem = {
    product: product.value,
    selectedOptions: selectedOptions.value,
    quantity: quantity.value,
    totalPrice: totalPrice.value
  };
  console.log("Sepete eklendi:", cartItem);
  // API çağrısı burada yapılabilir
};


</script>


<style scoped>
.card {
  transition: transform 0.2s ease;
  border-radius: 0.75rem !important;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.object-fit-cover {
  object-fit: cover;
}

.quantity-selector button {
  min-width: 38px;
}

.btn-outline-secondary.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}

.ratio-1x1 {
  --bs-aspect-ratio: 100%;
}

@media (max-width: 992px) {
  .ratio-1x1 {
    --bs-aspect-ratio: 75%;
  }
  
  .rounded-start {
    border-radius: 0.75rem 0.75rem 0 0 !important;
  }
}
</style>