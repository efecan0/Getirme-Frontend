<template>
  <div class="container py-4">

    <!-- New Order Toast Notification -->
    <ToastNotification v-if="showNewOrderToast" message="🚀 New Order Received!" />

    <h1 class="h3 fw-bold text-warning mb-4">📦 Incoming Orders</h1>

    <div v-if="activeOrders.length === 0" class="alert alert-info text-center">
      There are currently no active orders.
    </div>

    <div v-else class="row g-4">
      <div v-for="order in activeOrders" :key="order.id" class="col-12">
        <div class="card shadow-sm order-card"
          style="cursor: pointer;"
          @click="goToOrderDetails(order.id)">
          <div class="card-body">

            <h5 class="fw-bold text-warning">Order ID: #{{ order.id }}</h5>

            <p class="mb-2"><strong>Total Price:</strong> {{ order.totalPrice.toFixed(2) }} ₺</p>

            <p class="mb-2"><strong>Current Status:</strong> 
              <span class="badge bg-primary">{{ statusText(order.status) }}</span>
            </p>

            <!-- Customer Info -->
            <p class="mb-2">
              <i class="bi bi-person-fill text-secondary me-1"></i>
              <strong>Customer:</strong> {{ order.customer.name }} {{ order.customer.surname }}
            </p>
            <p class="mb-2">
              <i class="bi bi-house-door-fill text-secondary me-1"></i>
              <strong>Address:</strong> {{ order.customer.location }}
            </p>

            <!-- Courier Progress Bar -->
            <div v-if="order.status === 'ON_THE_WAY'" class="progress my-3" style="height: 20px;">
              <div 
                class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                role="progressbar"
                :style="{ width: order.progress + '%' }"
                :aria-valuenow="order.progress" aria-valuemin="0" aria-valuemax="100">
                {{ order.progress }}%
              </div>
            </div>

            <!-- Status Change Buttons -->
            <div class="d-flex gap-2 mt-3 flex-wrap">
              <button 
                v-for="status in availableStatuses"
                :key="status"
                class="btn btn-sm btn-outline-warning fw-bold"
                :class="status == order.status ? 'btn-warning text-white' : ''"
                @click.stop="updateOrderStatus(order.id, status)"
              >
                {{ statusText(status) }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import axios from 'axios';
import ToastNotification from '@/components/ToastNotification.vue';
import { connectWebSocket, sendOrderStatusUpdate, disconnectWebSocket } from '@/webSocketClient';
import { useRouter } from 'vue-router';
const router = useRouter();

const goToOrderDetails = (orderId) => {
  router.push({ name: 'order-details', params: { orderId } });
};

const orders = ref([]);
const availableStatuses = ['PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']; 
const showNewOrderToast = ref(false);

const progressTimers = ref({});

const fetchOrders = async () => {
  try {
    const response = await axios.get('/api/myOrders', { withCredentials: true });
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
};

const startProgressSimulation = (orderId) => {
  if (progressTimers.value[orderId]) return;

  progressTimers.value[orderId] = setInterval(async () => {
    const order = orders.value.find(o => o.id === orderId);

    if (order && order.progress < 100) {
      const newProgress = Math.min(order.progress + 10, 100);
      order.progress = newProgress;

      try {
        await axios.put(`/api/progress?orderId=${orderId}&progress=${newProgress}`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }

      if (newProgress === 100) {
        clearInterval(progressTimers.value[orderId]);
        delete progressTimers.value[orderId];
      }
    }
  }, 5000);
};

const onOrderUpdateReceived = (update) => {
  if (update.totalPrice) {
    orders.value.push(update);

    showNewOrderToast.value = true;
    setTimeout(() => {
      showNewOrderToast.value = false;
    }, 3000);
  }
  if (!update || !update.orderId) return;

  const idx = orders.value.findIndex(o => o.id === update.orderId);

  if (idx !== -1) {
    if (update.newStatus) {
      orders.value[idx].status = update.newStatus;

      if (update.newStatus === 'ON_THE_WAY') {
        startProgressSimulation(update.orderId);
      }
    }
    if (update.progress !== undefined) {
      orders.value[idx].progress = update.progress;
    }
  } 
};

const updateOrderStatus = (orderId, newStatus) => {
  const idx = orders.value.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders.value[idx].status = newStatus;
  }

  sendOrderStatusUpdate(orderId, newStatus);

  if (newStatus === 'ON_THE_WAY') {
    startProgressSimulation(orderId);
  }
};

const statusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Order Received';
    case 'PREPARING': return 'Preparing';
    case 'ON_THE_WAY': return 'On the Way';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const activeOrders = computed(() => {
  return orders.value.filter(order => 
    order.status !== 'DELIVERED' && 
    order.status !== 'CANCELLED'
  );
});

onMounted(() => {
  fetchOrders();
  connectWebSocket(onOrderUpdateReceived);
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped>
.order-card {
  border-left: 5px solid #FF9F00;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(255, 159, 0, 0.3);
}
</style>
