<template>
  <div class="container py-4" v-if="product && restaurantId">

    <!-- Back to Restaurant Button -->
    <div class="mb-4">
      <button class="btn btn-outline-warning fw-bold" @click="goBackToRestaurant">
        <i class="bi bi-arrow-left"></i> Back to Restaurant
      </button>
    </div>

    <!-- Product Details -->
    <div class="card custom-card shadow-sm mb-4">
      <img
        v-if="product.image"
        :src="'data:image/jpeg;base64,' + product.image"
        class="card-img-top"
        alt="Product Image"
        style="height: 250px; object-fit: cover;"
      />
      <div class="card-body">
        <h2 class="h4 fw-bold text-warning">{{ product.name }}</h2>
        <p class="text-muted">{{ product.description }}</p>

        <!-- Quantity Selection -->
        <h5 class="mt-4">Quantity</h5>
        <div class="d-flex align-items-center gap-3 mb-4 justify-content-center">
          <button class="btn btn-outline-warning" @click="decreaseQuantity">
            <i class="bi bi-dash"></i>
          </button>
          <span class="fw-bold fs-5">{{ quantity }}</span>
          <button class="btn btn-outline-warning" @click="increaseQuantity">
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <!-- Content Selection -->
        <h5 class="mt-4">Select Options</h5>
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
            <i class="bi bi-cart-plus"></i> Add to Cart
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
const quantity = ref(1);
const selectedOptions = ref({});
onMounted(async () => {
  try {
    const response = await axios.get(`/api/restaurant/product/details/${productId}`, { withCredentials: true });
    if (response.data.success) {
      product.value = response.data.data.product;
      selectableContent.value = response.data.data.selectableContent;
      console.log(product.value)
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
});

// Toggle Content Selection
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

// Check if Option is Selected
const isSelected = (contentId, optionId) => {
  return selectedOptions.value[contentId]?.some(o => o.id === optionId);
};

// Increase / Decrease Quantity
const increaseQuantity = () => {
  quantity.value++;
};
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

// Add to Cart
const addToCart = () => {
  const selectableContentMap = {};
  const selectableContentNames = [];

  for (const [groupId, options] of Object.entries(selectedOptions.value)) {
    selectableContentMap[groupId] = options.map(o => o.id);
    selectableContentNames.push({
      groupName: selectableContent.value.find(c => c.id == groupId)?.name || "Option",
      optionNames: options.map(o => o.name),
    });
  }

  let totalPrice = 0;
  for (let index in selectedOptions.value) {
    totalPrice += selectedOptions.value[index][0].price * quantity.value;
  }
  
  totalPrice += quantity.value * product.value.price;

  cartStore.addProduct({
    image: product.value.image,
    restaurantId: Number(restaurantId),
    productId: Number(productId),
    size: quantity.value,
    selectableContentMap,
    selectableContentNames,
    price: totalPrice
  });

  router.push('/cart');
};

// Go Back to Restaurant
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
