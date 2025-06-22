<template>
  <div class="container py-4">
    <ToastNotification v-if="showToast" :message="toastMessage" :duration="3000" />
    <h1 class="h3 fw-bold text-warning mb-4">🛒 My Cart</h1>

    <!-- If cart is empty -->
    <div v-if="cartStore.products.length === 0" class="alert alert-info text-center">
      Your cart is currently empty.
    </div>

    <!-- If cart has products -->
    <div v-else>

      <div class="row g-4">
        <div 
          v-for="(product, index) in cartStore.products" 
          :key="index"
          class="col-12"
        >
          <div class="card shadow-sm product-card d-flex flex-row align-items-center">

            <!-- Product Image -->
            <div class="p-2">
              <img 
                v-if="product.image"
                :src="'data:image/jpeg;base64,' + product.image" 
                alt="Product Image" 
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
              />
            </div>

            <!-- Product Info -->
            <div class="flex-grow-1 p-2">
              <h5 class="fw-bold mb-1">Product ID: {{ product.productId }}</h5> 
              <small class="text-muted">Quantity: {{ product.size }}</small>
              <!-- Selected Options -->
              <div class="mt-2 small">
                <div v-for="(content, idx) in product.selectableContentNames" :key="idx">
                  <i class="bi bi-check2-circle text-success"></i>
                  {{ content.groupName }}:
                  <span class="text-dark">{{ content.optionNames.join(', ') }}</span>
                </div>
              </div>
            </div>
            <span class="me-2"><strong>{{ product.price }} ₺</strong></span>
            <!-- Delete Button -->
            <div class="p-2">
              <button @click="removeProduct(index)" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Cart Footer -->
      <div class="mt-5 d-flex justify-content-between align-items-center">
        <button class="btn btn-outline-danger fw-bold" @click="clearCart">
          <i class="bi bi-trash-fill"></i> Clear Cart
        </button>
        <button class="btn btn-warning fw-bold" @click="createOrder">
          <i class="bi bi-bag-check-fill"></i> Place Order ({{ totalPrice }} ₺)
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart';
import axios from 'axios';
import { computed,ref } from 'vue';
import { useRouter } from 'vue-router';
import ToastNotification from '../components/ToastNotification.vue'; 


const showToast = ref(false);
const toastMessage = ref('');

const cartStore = useCartStore();
const router = useRouter();

const removeProduct = (index) => {
  cartStore.removeProduct(index);
};

const clearCart = () => {
  cartStore.clearCart();
};

let totalPrice = computed(() => {
  let sum = 0;
  for (let index in cartStore.products) {
    sum += cartStore.products[index].price;
  }
  return sum;
});

const createOrder = async () => {
  try {
    const payload = {
      restaurantId: cartStore.restaurantId,
      products: cartStore.products.map(product => ({
        productId: product.productId,
        size: product.size,
        selectableContentMap: product.selectableContentMap
      })),
    };

    await axios.post('/api/createOrder', payload, { withCredentials: true });
    
    cartStore.clearCart();
    router.push('/my-orders');
  } catch (error) {
    console.log(error)
    toastMessage.value = error?.response?.data?.exception?.message?.split(":")[1] || "An Error Occured.";
    showToast.value = true;
  }
};
</script>

<style scoped>
.product-card {
  border-left: 5px solid #FF9F00;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(255, 159, 0, 0.3);
}
</style>
