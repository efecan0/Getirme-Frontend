import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue'; 
import CustomerRegisterPage from '../pages/customer/RegisterPage.vue';
import RestaurantRegisterPage from '../pages/restaurant/RegisterPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: LoginPage,  // Anasayfa bileşeni
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,  // Giriş sayfası
  },
  {
    path: '/register',
    name: 'customer-register',
    component: CustomerRegisterPage, 
  },
  {
    path: '/restaurant/register',
    name: 'restaurant-register',
    component: RestaurantRegisterPage, 
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
