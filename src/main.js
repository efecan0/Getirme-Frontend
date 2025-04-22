import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // Router'ı içe aktar

createApp(App)
  .use(router)
  .mount('#app');