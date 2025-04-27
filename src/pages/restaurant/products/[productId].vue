<template>
  <div class="container py-4" v-if="product && restaurantId">

    <!-- Geri Dön Butonu -->
    <div class="mb-4">
      <button class="btn btn-outline-warning fw-bold" @click="goBackToRestaurant">
        <i class="bi bi-arrow-left"></i> Restorana Geri Dön
      </button>
    </div>

    <!-- Ürün Detayı -->
    <div class="card custom-card shadow-sm mb-4">
      <img
        v-if="product.image"
        :src="'data:image/jpeg;base64,' + product.image"
        class="card-img-top"
        alt="Ürün Resmi"
        style="height: 250px; object-fit: cover;"
      />
      <div class="card-body">
        <h2 class="h4 fw-bold text-warning">{{ product.name }}</h2>
        <p class="text-muted">{{ product.description }}</p>

        <!-- Adet Seçimi -->
        <h5 class="mt-4">Adet</h5>
        <div class="d-flex align-items-center gap-3 mb-4 justify-content-center">
          <button class="btn btn-outline-warning" @click="decreaseQuantity">
            <i class="bi bi-dash"></i>
          </button>
          <span class="fw-bold fs-5">{{ quantity }}</span>
          <button class="btn btn-outline-warning" @click="increaseQuantity">
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <!-- İçerik Seçimi -->
        <h5 class="mt-4">İçerik Seçimi</h5>
        <div v-for="content in selectableContent" :key="content.id" class="mb-3">
          <p class="fw-bold mb-2">{{ content.name }}</p>

            <div class="d-flex flex-wrap gap-2 justify-content-center">

            <button
              v-for="option in content.selectableContentOptionDtoList"
              :key="option.id"
              class="btn btn-sm"
              :class="{'btn-warning': isSelected(content.id, option.id), 'btn-outline-warning': !isSelected(content.id, option.id)}"
              @click="toggleOption(content.id, option)"
            >
              {{ option.name }} <span v-if="option.price > 0">(+{{ option.price }}₺)</span>
            </button>
          </div>
        </div>

        <div class="mt-4 text-end">
          <button class="btn btn-warning fw-bold" @click="addToCart">
            <i class="bi bi-cart-plus"></i> Sepete Ekle
          </button>
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

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const productId = route.params.productId;
const restaurantId = cartStore.restaurantId;
console.log(restaurantId)

const product = ref(null);
const selectableContent = ref([]);
const quantity = ref(1); // Adet bilgisi
const selectedOptions = ref({});

onMounted(async () => {
  try {
    const response = await axios.get(`/api/restaurant/product/details/${productId}`, { withCredentials: true });
    if (response.data.success) {
      product.value = response.data.data.product;
      selectableContent.value = response.data.data.selectableContent;
    }
  } catch (error) {
    console.error('Ürün detayı hatası:', error);
  }
});

// İçerik Seçimi Toggle
const toggleOption = (contentId, option) => {
  if (!selectedOptions.value[contentId]) {
    selectedOptions.value[contentId] = [];
  }
  const index = selectedOptions.value[contentId].findIndex(o => o.id === option.id);
  if (index > -1) {
    selectedOptions.value[contentId].splice(index, 1);
    if (selectedOptions.value[contentId].length === 0) {
      delete selectedOptions.value[contentId];
    }
  } else {
    selectedOptions.value[contentId].push(option);
  }
};

// Seçili mi kontrol
const isSelected = (contentId, optionId) => {
  return selectedOptions.value[contentId]?.some(o => o.id === optionId);
};

// Adet Arttır / Azalt
const increaseQuantity = () => {
  quantity.value++;
};
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

// Sepete Ekle
const addToCart = () => {
  const selectableContentMap = {};
  const selectableContentNames = [];

  for (const [groupId, options] of Object.entries(selectedOptions.value)) {
    selectableContentMap[groupId] = options.map(o => o.id);
    selectableContentNames.push({
      groupName: selectableContent.value.find(c => c.id == groupId)?.name || "İçerik",
      optionNames: options.map(o => o.name),
    });
  }

  cartStore.addProduct({
    image: product.value.image,
    restaurantId: Number(restaurantId),
    productId: Number(productId),
    size: quantity.value, // Adet
    selectableContentMap,
    selectableContentNames,
  });

  router.push('/cart');
};

// Restorana Geri Dön
const goBackToRestaurant = () => {
  router.push({ name: 'restaurant-details', params: { restaurantId } });
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

.btn {
  min-width: 100px;
}
</style>
