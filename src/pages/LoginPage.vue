<template>
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastNotification v-if="showToast" :message="toastMessage" :duration="3000" />

      <div class="login-box bg-white p-5 rounded shadow-lg">
        <div class="text-center mb-4">
          <!-- Logo Buraya Gelebilir -->
          <h1 class="text-main">EcoEats</h1>
          <p class="text-muted">Log In</p>
        </div>
        <form @submit.prevent="login">
          <div class="form-group mb-4">
            <input 
              type="text" 
              v-model="phoneNumber" 
              placeholder="Phone Number" 
              class="form-control form-control-lg border-main"
              required 
            />
          </div>
          <div class="form-group mb-4">
            <input 
              type="password" 
              v-model="password" 
              placeholder="Password" 
              class="form-control form-control-lg border-main"
              required 
            />
          </div>
          <button type="submit" class="btn btn-main btn-lg w-100 mb-4">Log In</button>
          <div class="d-flex justify-content-between">
            <a href="#" class="text-dark">Forgot Password</a>
            <a href="/register" class="text-dark">Don't have an account? Sign up</a>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
import axios from 'axios'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import ToastNotification from '../components/ToastNotification.vue'; 

const showToast = ref(false);
const toastMessage = ref('');


const authStore = useAuthStore();

  let phoneNumber = ref("");
  let password = ref("");
  let router = useRouter();

  async function login() {
  try {
    const res = await axios.post("/api/login", { phoneNumber: phoneNumber.value, password: password.value });
    if (res.data.success) {
      await authStore.checkAuth();
      router.push("/restaurant-list");
    } else {
      toastMessage.value = res.data.message || "Your username or password is incorrect.";
      showToast.value = true;
    }
  } catch (err) {
    toastMessage.value = err.response?.data?.message || "Your username or password is incorrect.";
    showToast.value = true;
  }
}
  </script>
  
  <style scoped>
  .bg-light {
    background-color: #F6F7FB; /* Açık Gri Mavi */
  }
  
  .login-box {
    max-width: 500px; /* Kartın genişliğini artırdım */
    width: 100%;
    padding: 3rem;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    font-size: 2.8em;
    font-weight: bold;
    color: #FF9F00; /* Turuncu */
  }
  
  .text-main {
    color: #FF9F00 !important; /* Turuncu */
  }
  
  .text-muted {
    color: #8C8C8C;
  }
  
  .form-control {
    font-size: 1.2em;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #FF9F00;
    transition: border-color 0.3s ease;
  }
  
  .form-control:focus {
    border-color: #FF9F00;
    box-shadow: 0 0 8px rgba(255, 159, 0, 0.6);
  }
  
  .btn-main {
    background-color: #FF9F00; /* Turuncu */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.2em;
    padding: 12px;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .btn-main:hover {
    background-color: #FF7F00; /* Koyu Turuncu */
    box-shadow: 0 0 15px rgba(255, 159, 0, 0.7);
  }
  
  a {
    font-size: 1em;
    color: #555;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  a:hover {
    color: #FF9F00;
  }
  </style>
  