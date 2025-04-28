import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue'; 
import CustomerRegisterPage from '../pages/customer/RegisterPage.vue';
import RestaurantRegisterPage from '../pages/restaurant/RegisterPage.vue';
import CreateProductPage from '../pages/restaurant/CreateProductPage.vue';
import RestaurantListPage from '../pages/RestaurantListPage.vue';
import RestaurantId from '../pages/restaurant/details/[restaurantId].vue';
import ProductId from '../pages/restaurant/products/[productId].vue';
import CartPage from '../pages/CartPage.vue';
import MyOrdersPage from '@/pages/MyOrdersPage.vue';
import OrderDetailsPage from '../pages/OrderDetailsPage.vue';
import RestaurantOrdersPage from '@/pages/RestaurantOrdersPage.vue';
import UpdateRestaurantProfilePage from '@/pages/restaurant/UpdateProfilePage.vue';
import UpdateCustomerProfilePage from '@/pages/customer/UpdateProfilePage.vue';
import EditProductPage from '@/pages/restaurant/products/edit/[productId].vue'
import axios from 'axios';


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
  {
    path: '/restaurant/details/:restaurantId',
    name: 'restaurant-details',
    component: RestaurantId,  
  },
  {
    path: '/restaurant/products/:productId',
    name: 'restaurant-product-details',
    component: ProductId,  
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
  },
  {
    path: '/my-orders',
    name: 'myOrders',
    component: MyOrdersPage,
  },
  {
    path: '/order-details/:orderId',
    name: 'order-details',
    component: OrderDetailsPage,
  },
  {
    path: '/restaurant-orders',
    name: 'restaurant-order',
    component: RestaurantOrdersPage,
  },
  {
    path: '/restaurant/update',
    name: 'restaurant-update',
    component: UpdateRestaurantProfilePage,
  },
  {
    path: '/customer/update',
    name: 'customer-update',
    component: UpdateCustomerProfilePage,
  },
  {
    path: '/restaurant/products/edit/:productId',
    name: 'restaurant-product-edit',
    component: EditProductPage,
  },
  
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
  const protectedRoutes = ['/cart', '/my-orders', '/restaurant/create-product'];

  if (protectedRoutes.includes(to.path)) {
    try {
      const response = await axios.get('/api/checkAuth', { withCredentials: true });
      const authStatus = response.data.data;
      console.log("ROUTER WORKED")
      if (authStatus.startsWith('AUTHENTICATED')) {
        next(); // Login olmuş, devam et
      } else {
        next('/login'); // Login değil, login sayfasına at
      }
    } catch (error) {
      console.error('Guard hatası:', error);
      next('/login');
    }
  } else {
    next(); // Korumasız route'lara direkt devam
  }
});


export default router;