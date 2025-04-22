<template>
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="register-box bg-white p-5 rounded shadow-lg">
        <div class="text-center mb-4">
          <h1 class="text-main">Restaurant Kayıt</h1>
          <p class="text-muted">Restoranınızı Kaydedin</p>
        </div>
        <form @submit.prevent="register">
          <!-- Restaurant Name Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.name" 
              placeholder="Restaurant Adı" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.name}"
            />
            <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
          </div>
  
          <!-- Phone Number Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.phoneNumber" 
              placeholder="Telefon Numarası" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.phoneNumber}"
            />
            <div v-if="errors.phoneNumber" class="invalid-feedback">{{ errors.phoneNumber }}</div>
          </div>
  
          <!-- Location Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="restaurant.location" 
              placeholder="Lokasyon" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.location}"
            />
            <div v-if="errors.location" class="invalid-feedback">{{ errors.location }}</div>
          </div>
  
          <!-- Password Input -->
          <div class="form-group mb-3">
            <input 
              type="password" 
              v-model="restaurant.password" 
              placeholder="Şifre" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.password}"
            />
            <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
          </div>
  
          <!-- Opening Time Input -->
          <label for="">Açılış ve Kapanış Saatleri</label>
          <div class="form-group mb-3">
            <input 
              type="time" 
              v-model="restaurant.openingTime" 
              placeholder="Açılış Saati" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.openingTime}"
            />
            <div v-if="errors.openingTime" class="invalid-feedback">{{ errors.openingTime }}</div>
          </div>
  
          <!-- Closing Time Input -->
          <div class="form-group mb-3">
            <input 
              type="time" 
              v-model="restaurant.closingTime" 
              placeholder="Kapanış Saati" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.closingTime}"
            />
            <div v-if="errors.closingTime" class="invalid-feedback">{{ errors.closingTime }}</div>
          </div>
  
          <label for="">Profil Resmi</label>
          <!-- Image Input -->
          <div class="form-group mb-3">
            <input 
              type="file" 
              @change="onImageChange" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.image}"
            />
            <div v-if="errors.image" class="invalid-feedback">{{ errors.image }}</div>
          </div>
  
          <!-- Max Service Distance Input -->
          <div class="form-group mb-3">
            <input 
              type="number" 
              v-model="restaurant.maxServiceDistance" 
              placeholder="Maksimum Hizmet Mesafesi (km)" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.maxServiceDistance}"
            />
            <div v-if="errors.maxServiceDistance" class="invalid-feedback">{{ errors.maxServiceDistance }}</div>
          </div>
  
          <!-- Min Service Price Per Km Input -->
          <div class="form-group mb-4">
            <input 
              type="number" 
              v-model="restaurant.minServicePricePerKm" 
              placeholder="Kilometre Başına Minimum Hizmet Ücreti" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.minServicePricePerKm}"
            />
            <div v-if="errors.minServicePricePerKm" class="invalid-feedback">{{ errors.minServicePricePerKm }}</div>
          </div>
  
          <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Kayıt Ol</button>
        </form>
        <div class="d-flex justify-content-between">
          <a href="/login" class="text-dark">Zaten Hesabınız Var mı? Giriş Yap</a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref } from 'vue'
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
  image: null,
  maxServiceDistance: '',
  minServicePricePerKm: '',
})

const errors = ref({
  name: '',
  phoneNumber: '',
  location: '',
  password: '',
  openingTime: '',
  closingTime: '',
  image: '',
  maxServiceDistance: '',
  minServicePricePerKm: '',
})

function appendToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    formData.append(key, obj[key])
  }
  return formData;
}

function validateForm() {
  let isValid = true
  errors.value = {
    name: '',
    phoneNumber: '',
    location: '',
    password: '',
    openingTime: '',
    closingTime: '',
    image: '',
    maxServiceDistance: '',
    minServicePricePerKm: '',
  }

  if (!restaurant.value.name) {
    errors.value.name = 'Restoran adı boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.phoneNumber) {
    errors.value.phoneNumber = 'Telefon numarası boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.location) {
    errors.value.location = 'Lokasyon boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.password) {
    errors.value.password = 'Şifre boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.openingTime) {
    errors.value.openingTime = 'Açılış saati boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.closingTime) {
    errors.value.closingTime = 'Kapanış saati boş bırakılamaz.'
    isValid = false
  }
  if (!restaurant.value.image) {
    errors.value.image = 'Resim seçilmelidir.'
    isValid = false
  }
  if (!restaurant.value.maxServiceDistance || restaurant.value.maxServiceDistance < 1) {
    errors.value.maxServiceDistance = 'Maksimum hizmet mesafesi en az 1 km olmalıdır.'
    isValid = false
  }
  if (!restaurant.value.minServicePricePerKm || restaurant.value.minServicePricePerKm < 0) {
    errors.value.minServicePricePerKm = 'Minimum hizmet ücreti sıfırdan küçük olamaz.'
    isValid = false
  }

  return isValid
}

function onImageChange(event) {
  restaurant.value.image = event.target.files[0]
}

function register() {
  errors.value = {}
  const isValid = validateForm()
  if (!isValid) return

  const formData = appendToFormData(restaurant.value)

  axios.post('/api/restaurant/register', formData)
    .then((response) => {
      console.log("response: ", response)
      if (response.data.success) {
        router.push("/login");
      }
    })
    .catch((error) => {
      console.error("Network Error:", error)
    })

  console.log('Restoran kaydedildi:', restaurant.value)
}
</script>

  
  <style scoped>
  .bg-light {
    background-color: #FFFBF0; /* Açık Krem */
  }
  
  .register-box {
    max-width: 450px;
    width: 100%;
  }
  
  h1 {
    font-size: 2.5em;
    font-weight: bold;
    color: #FF9F00; /* Turuncu */
  }
  
  .text-main {
    color: #FF9F00 !important; /* Turuncu */
  }
  
  .text-muted {
    color: #666666;
  }
  
  .form-control {
    font-size: 1.1em;
    padding: 12px;
    border-radius: 10px;
    border-color: #FF9F00;
  }
  
  .form-control:focus {
    border-color: #FF9F00;
    box-shadow: 0 0 5px rgba(255, 159, 0, 0.5); /* Turuncu */
  }
  
  .btn-main {
    background-color: #FF9F00; /* Turuncu */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
  }
  
  .btn-main:hover {
    background-color: #FF7F00; /* Koyu Turuncu */
    box-shadow: 0 0 10px rgba(255, 159, 0, 0.7);
  }
  
  a {
    text-decoration: none;
  }
  
  a:hover {
    color: #FF9F00;
  }
  
  /* Hata Mesajları */
  .invalid-feedback {
    color: red;
  }
  </style>
  