<template>
    <div class="container justify-content-around row d-flex mt-5 mx-auto">
  
      <div class="update-box bg-white p-5 rounded shadow-lg my-auto me-5 col">
        <div class="text-center mb-4">
          <h1 class="text-main">Update Restaurant Information</h1>
          <p class="text-muted">Update your restaurant details</p>
        </div>
        <form @submit.prevent="updateRestaurant">
  
          <!-- Restaurant Image Preview -->
          <div class="form-group text-center">
            <div class="image-wrapper" @click="triggerFileInput">
              <img 
                :src=" previewImage || 'data:image/png;base64,' + restaurant.image " 
                alt="Restaurant Image" 
                class="img-fluid rounded shadow-sm restaurant-image"
              />
              <div class="overlay">Change Image</div>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              @change="onImageChange" 
              accept="image/*" 
              hidden 
            />
            <div v-if="errors.image" class="invalid-feedback d-block">{{ errors.image }}</div>
          </div>
          <div class="mb-4">
            <small class="form-text text-muted">Click the image to change the current image.</small>
          </div>
  
          <!-- Restaurant Name Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.name" 
              placeholder="Restaurant Name" 
              class="form-control form-control-lg border-main"
              :class="{'is-invalid': errors.name}"
              required
            />
            <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
          </div>
  
          <!-- Phone Number Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.phoneNumber" 
              placeholder="Phone Number (Optional)" 
              class="form-control form-control-lg border-main"
              :class="{'is-invalid': errors.phoneNumber}"
            />
            <div v-if="errors.phoneNumber" class="invalid-feedback">{{ errors.phoneNumber }}</div>
            <small class="form-text text-muted">Leave empty if you don't want to change the phone number.</small>
          </div>
  
          <!-- Location Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.location" 
              placeholder="Location" 
              class="form-control form-control-lg border-main"
              :class="{'is-invalid': errors.location}"
              required
            />
            <div v-if="errors.location" class="invalid-feedback">{{ errors.location }}</div>
          </div>
  
          <!-- Password Input -->
          <div class="form-group mb-3">
            <input 
              type="password" 
              v-model="restaurant.password" 
              placeholder="New Password (Optional)" 
              class="form-control form-control-lg border-main"
              :class="{'is-invalid': errors.password}"
            />
            <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
            <small class="form-text text-muted">Leave empty if you don't want to change the password.</small>
          </div>
  
          <!-- Opening and Closing Times -->
          <label class="form-label">Opening and Closing Times</label>
          <div class="row mb-3">
            <div class="col">
              <input 
                type="time" 
                v-model="restaurant.openingTime" 
                class="form-control form-control-lg border-main"
                required
              />
            </div>
            <div class="col">
              <input 
                type="time" 
                v-model="restaurant.closingTime" 
                class="form-control form-control-lg border-main"
                required
              />
            </div>
          </div>
  
          <!-- Max Service Distance Input -->
          <label class="form-label">Maximum Service Distance (km)</label>
          <div class="form-group mb-3">
            <input 
              type="number" 
              v-model="restaurant.maxServiceDistance" 
              placeholder="Maximum Service Distance (km)" 
              class="form-control form-control-lg border-main"
              required
            />
          </div>
  
          <!-- Min Service Price Per Km Input -->
          <label class="form-label">Minimum Service Fee per Kilometer</label>
          <div class="form-group mb-4">
            <input 
              type="number" 
              v-model="restaurant.minServicePricePerKm" 
              placeholder="Minimum Service Fee per Kilometer" 
              class="form-control form-control-lg border-main"
              required
            />
          </div>
  
          <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Update Information</button>
        </form>
      </div>
  
      <div v-if="products.length > 0" class="col row d-flex justify-content-start" style="max-height: 350px;">
        <div v-for="product in products" :key="product.id" class="col-4 mb-3">
          <div class="card product-card shadow-sm" @click="goToProduct(product.id)" style="cursor: pointer;">
            <img
              v-if="product.image"
              :src="'data:image/png;base64,' + product.image"
              class="card-img-top"
              alt="Product Image"
              style="height: 200px; object-fit: cover;"
            />
            <div v-else class="d-flex justify-content-center align-items-center bg-secondary text-white" style="height: 200px;">
              No Image
            </div>
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title fw-bold">{{ product.name }}</h5>
                <p class="card-text small text-muted">{{ product.description }}</p>
              </div>
              <div class="mt-3 text-end">
                <span class="badge bg-warning text-dark">{{ formatPrice(product.price) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
    <script setup>
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    
    const router = useRouter()
    
    const restaurant = ref({
        name: '',
        phoneNumber: '',
        location: '',
        password: '',
        openingTime: '',
        closingTime: '',
        image: '', // API'den gelen image linki
        maxServiceDistance: '',
        minServicePricePerKm: '',
    })
    
    const products = ref([]);

    const previewImage = ref(null) // Yeni seçilen resmi göstermek için
    
    const fileInput = ref(null)
    
    const errors = ref({})
    

    const goToProduct = (productId) => {
    router.push({ name: 'restaurant-product-edit', params: { productId } });
    };

    const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return `${price.toFixed(2)} ₺`;
    };

    function triggerFileInput() {
        fileInput.value.click()
    }
    
    const selectedImage = ref(null)

    function onImageChange(event) {
        const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.value = e.target.result; // Base64 formatında resim
          const base64Image = e.target.result;
          const imageFile = base64ToFile(base64Image, file.name);
          selectedImage.value = imageFile; // Yeni file objesini restaurant objesine ekle
        };
        reader.readAsDataURL(file); // Resmi base64 formatına çevir
      }
    }
    
    function base64ToFile(base64, filename) {
      const arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    }

    function appendToFormData(obj) {
        const formData = new FormData();

      for (const key in obj) {
        if (obj[key] !== null && obj[key] !== '') {
          if (key === 'image' && previewImage.value) {
            formData.append(key, obj[key]);
          } else if (key === 'image' && !previewImage.value && obj[key]) {
            formData.append(key, obj[key]);
          } else {
            formData.append(key, obj[key]);
          }
        }
      }

      return formData;
    }
    
    async function fetchRestaurantData() {
        try {
        const response = await axios.get('/api/restaurant/getUserInfo', { withCredentials: true })
        const data = response.data.data
        console.log(data)
        Object.assign(restaurant.value, data.restaurant)
        Object.assign(products.value , data.products)
        restaurant.value.maxServiceDistance = data.restaurant.distance
        restaurant.value.minServicePricePerKm = data.restaurant.minServicePrice
        } catch (error) {
        console.error("Veri Çekme Hatası:", error)
        }
    }
    
    async function updateRestaurant() {
        try {
        restaurant.value.image = selectedImage.value;
        const formData = appendToFormData(restaurant.value)
        console.log(restaurant.value)
        const response = await axios.post('/api/restaurant/update', formData , {withCredentials : true})
        if (response.data.success) {
            router.push('/restaurant-list')
        }
        } catch (error) {
        console.error("Güncelleme Hatası:", error)
        }
    }
    
    onMounted(() => {
        fetchRestaurantData()
    })
    </script>
    
    <style scoped>
    .bg-light {
        background-color: #FFFBF0;
    }
    
    .update-box {
        max-width: 550px;
        width: 100%;
    }
    
    h1 {
        font-size: 2.2em;
        font-weight: bold;
        color: #FF9F00;
    }
    
    .text-main {
        color: #FF9F00 !important;
    }
    
    .text-muted {
        color: #666666;
    }
    
    .form-control {
        font-size: 1.05em;
        padding: 12px;
        border-radius: 10px;
        border-color: #FF9F00;
    }
    
    .form-control:focus {
        border-color: #FF9F00;
        box-shadow: 0 0 5px rgba(255, 159, 0, 0.5);
    }
    
    .btn-main {
        background-color: #FF9F00;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1em;
    }
    
    .btn-main:hover {
        background-color: #FF7F00;
    }
    
    /* Yeni eklenen stiller */
    .image-wrapper {
        position: relative;
        display: inline-block;
        width: 200px;
        height: 200px;
        overflow: hidden;
        border-radius: 10px;
        cursor: pointer;
    }
    
    .restaurant-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: 0.3s;
    }
    
    .image-wrapper:hover .restaurant-image {
        opacity: 0.7;
    }
    
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        background-color: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: 0.3s;
    }
    
    .image-wrapper:hover .overlay {
        opacity: 1;
    }


        .custom-card {
    border-left: 5px solid #FF9F00;
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    }

    .custom-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255, 159, 0, 0.3);
    }

    .product-card {
    transition: transform 0.2s, box-shadow 0.2s;
    border-radius: 10px;
    }

    .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255, 159, 0, 0.4);
    }

    .card-title {
    color: #FF9F00;
    }
    </style>
    