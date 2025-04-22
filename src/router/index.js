import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue'; 
import CustomerRegisterPage from '../pages/customer/RegisterPage.vue';
import RestaurantRegisterPage from '../pages/restaurant/RegisterPage.vue';
import CreateProductPage from '../pages/restaurant/CreateProductPage.vue';
import RestaurantListPage from '../pages/RestaurantListPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: LoginPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
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
  {
    path: '/restaurant/create-product',
    name: 'create-product',
    component: CreateProductPage, 
  },
  {
    path: '/restaurant-list',
    name: 'restaurant-list',
    component: RestaurantListPage,  
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
