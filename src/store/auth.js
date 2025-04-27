import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const isLoggedIn = ref(false);
  const userType = ref('');

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/checkAuth', { withCredentials: true });
      const authStatus = response.data.data;

      if (authStatus.startsWith('AUTHENTICATED')) {
        userType.value = authStatus.split('_')[1];
        isLoggedIn.value = true;
      } else {
        isLoggedIn.value = false;
        userType.value = '';
      }
    } catch (error) {
      console.error('CheckAuth hatası:', error);
      isLoggedIn.value = false;
      userType.value = '';
    }
  };

  const goHomeSmart = () => {
    if (isLoggedIn.value) {
      router.push('/restaurant-list');
    } else {
      router.push('/login');
    }
  };

  const logout = () => {
    document.cookie = "accessToken=; Max-Age=0; path=/";
    isLoggedIn.value = false;
    userType.value = '';
    router.push('/login');
  };

  return { isLoggedIn, userType, checkAuth, goHomeSmart, logout };
});