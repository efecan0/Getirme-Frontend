<template>
  <div class="container py-4">

    <h1 class="h3 fw-bold text-warning mb-4">🛒 Sepetim</h1>

    <!-- Sepet boşsa -->
    <div v-if="cartStore.products.length === 0" class="alert alert-info text-center">
      Sepetiniz şu anda boş.
    </div>

    <!-- Sepette ürünler varsa -->
    <div v-else>

      <div class="row g-4">
        <div 
          v-for="(product, index) in cartStore.products" 
          :key="index"
          class="col-12"
        >
          <div class="card shadow-sm product-card d-flex flex-row align-items-center">

            <!-- Ürün Resmi -->
            <div class="p-2">
              <img 
                v-if="product.image"
                :src="'data:image/jpeg;base64,' + product.image" 
                alt="Ürün" 
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
              />
            </div>

            <!-- Ürün Bilgileri -->
            <div class="flex-grow-1 p-2">
              <h5 class="fw-bold mb-1">Ürün ID: {{ product.productId }}</h5> 
              <small class="text-muted">Boyut: {{ product.size }}</small>

              <!-- Seçilen İçerikler -->
              <div class="mt-2 small">
                <div v-for="(content, idx) in product.selectableContentNames" :key="idx">
                  <i class="bi bi-check2-circle text-success"></i>
                  {{ content.groupName }}:
                  <span class="text-dark">{{ content.optionNames.join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Sil Butonu -->
            <div class="p-2">
              <button @click="removeProduct(index)" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Sepet Alt Bilgi -->
      <div class="mt-5 d-flex justify-content-between align-items-center">
        <button class="btn btn-outline-danger fw-bold" @click="clearCart">
          <i class="bi bi-trash-fill"></i> Sepeti Temizle
        </button>

        <button class="btn btn-warning fw-bold" @click="createOrder">
          <i class="bi bi-bag-check-fill"></i> Siparişi Tamamla
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart';
import axios from 'axios';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

const removeProduct = (index) => {
  cartStore.removeProduct(index);
};

const clearCart = () => {
  cartStore.clearCart();
};

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
    alert(error.response.data.exception.message.split(":")[1]);
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
