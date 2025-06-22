<template>
  <nav class="navbar navbar-expand-lg custom-navbar shadow-sm sticky-top">
    <div class="container-fluid">

      <!-- Logo -->
      <a class="navbar-brand fw-bold text-white" href="#" @click.prevent="goHomeSmart">
        EcoEats<span style="color: #FF9F00;">.</span>
      </a>

      <!-- Hamburger Menu -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu Content -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">

          <!-- Cart -->
          <li class="nav-item" v-if="userType=='CUSTOMER'">
            <router-link class="nav-link text-white fw-bold" to="/cart">
              <i class="bi bi-cart"></i> My Cart<span v-if="cartCount > 0"> ({{ cartCount }})</span>
            </router-link>
          </li>

          <!-- Restaurant Profile -->
          <li class="nav-item" v-if="userType=='RESTAURANT'">
            <router-link class="nav-link text-white fw-bold" to="/restaurant/update">
              <i class="bi bi-person-circle"></i> Profile
            </router-link>
          </li>

          <!-- Customer Profile -->
          <li class="nav-item" v-if="userType=='CUSTOMER'">
            <router-link class="nav-link text-white fw-bold" to="/customer/update">
              <i class="bi bi-person-circle"></i> Profile
            </router-link>
          </li>

          <!-- Create Product -->
          <li class="nav-item" v-if="userType=='RESTAURANT'">
            <router-link class="nav-link text-white fw-bold" to="/restaurant/create-product">
              <i class="bi bi-plus-circle"></i> Add Product
            </router-link>
          </li>

          <!-- Orders -->
          <li class="nav-item" v-if="userType=='CUSTOMER'">
            <router-link class="nav-link text-white fw-bold" to="/my-orders">
              <i class="bi bi-list-check"></i> My Orders
            </router-link>
          </li>
          <li class="nav-item" v-else-if="userType=='RESTAURANT'">
            <router-link class="nav-link text-white fw-bold" to="/restaurant-orders">
              <i class="bi bi-list-check"></i> Orders
            </router-link>
          </li>

          <!-- Login / Logout -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link class="nav-link text-white fw-bold" to="/login">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </router-link>
          </li>

          <li class="nav-item" v-else>
            <button class="nav-link text-white fw-bold btn btn-link" @click="logout" style="text-decoration: none;">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';

const cartStore = useCartStore();
const authStore = useAuthStore();

const { isLoggedIn, userType } = storeToRefs(authStore);
const cartCount = computed(() => cartStore.products.length);

onMounted(async () => {
  await authStore.checkAuth();
});

const goHomeSmart = () => {
  authStore.goHomeSmart();
};

const logout = () => {
  authStore.logout();
};
</script>

<style scoped>
.custom-navbar {
  background: linear-gradient(90deg, #FF9F00, #FFB300);
}

.navbar-brand {
  font-size: 1.5rem;
  cursor: pointer;
}

.nav-link {
  transition: color 0.3s, background-color 0.3s;
}

.nav-link:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 12px;
}
</style>
