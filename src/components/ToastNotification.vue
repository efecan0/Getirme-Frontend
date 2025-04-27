<template>
    <div v-if="visible" class="toast-container">
      <div class="toast-message">
        {{ props.message }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref,defineProps } from 'vue';
  
  const props = defineProps({
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    }
  });
  
  const visible = ref(true);
  
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  }
  .toast-message {
    background-color: #FF9F00;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  </style>
  