import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
    state: () => ({
        restaurantId: null,
        products: [],
      }),
      actions: {
        addProduct(product) {
          if (this.restaurantId && this.restaurantId !== product.restaurantId) {
            throw new Error('Sepette farklı bir restorandan ürün var. Lütfen önce sepeti boşalt.');
          }
          if (!this.restaurantId) {
            this.restaurantId = product.restaurantId;
          }
          this.products.push(product);
        },
        removeProduct(index) {
          this.products.splice(index, 1);
          if (this.products.length === 0) {
            this.restaurantId = null;
          }
        },
        clearCart() {
          this.products = [];
          this.restaurantId = null;
        },
      }
      
});