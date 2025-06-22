<template>
  <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="register-box bg-white p-5 rounded shadow-lg">
      <div class="text-center mb-4">
        <h1 class="text-main">Restaurant Registration</h1>
        <p class="text-muted">Register Your Restaurant</p>
      </div>
      <form @submit.prevent="register">
        <!-- Restaurant Name Input -->
        <div class="form-group mb-3">
          <input 
            type="text" 
            v-model="restaurant.name" 
            placeholder="Restaurant Name" 
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
            placeholder="Phone Number" 
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
            placeholder="Location" 
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
            placeholder="Password" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.password}"
          />
          <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <!-- Opening Time Input -->
        <label>Opening and Closing Hours</label>
        <div class="form-group mb-3">
          <input 
            type="time" 
            v-model="restaurant.openingTime" 
            placeholder="Opening Time" 
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
            placeholder="Closing Time" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.closingTime}"
          />
          <div v-if="errors.closingTime" class="invalid-feedback">{{ errors.closingTime }}</div>
        </div>

        <label>Profile Image</label>
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
            placeholder="Maximum Service Distance (km)" 
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
            placeholder="Minimum Service Price Per Kilometer" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.minServicePricePerKm}"
          />
          <div v-if="errors.minServicePricePerKm" class="invalid-feedback">{{ errors.minServicePricePerKm }}</div>
        </div>

        <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Register</button>
      </form>
      <div class="d-flex justify-content-between">
        <a href="/login" class="text-dark">Already have an account? Log In</a>
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
    errors.value.name = 'Restaurant name cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.phoneNumber) {
    errors.value.phoneNumber = 'Phone number cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.location) {
    errors.value.location = 'Location cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.password) {
    errors.value.password = 'Password cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.openingTime) {
    errors.value.openingTime = 'Opening time cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.closingTime) {
    errors.value.closingTime = 'Closing time cannot be empty.'
    isValid = false
  }
  if (!restaurant.value.image) {
    errors.value.image = 'An image must be selected.'
    isValid = false
  }
  if (!restaurant.value.maxServiceDistance || restaurant.value.maxServiceDistance < 1) {
    errors.value.maxServiceDistance = 'Maximum service distance must be at least 1 km.'
    isValid = false
  }
  if (!restaurant.value.minServicePricePerKm || restaurant.value.minServicePricePerKm < 0) {
    errors.value.minServicePricePerKm = 'Minimum service price cannot be less than zero.'
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
      console.log("Response: ", response)
      if (response.data.success) {
        router.push("/login");
      }
    })
    .catch((error) => {
      console.error("Network Error:", error)
    })

  console.log('Restaurant registered:', restaurant.value)
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
  