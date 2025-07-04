<template>
  <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="register-box bg-white p-5 rounded shadow-lg">
      <div class="text-center mb-4">
        <h1 class="text-main">Sign Up</h1>
        <p class="text-muted">Create Your Account</p>
      </div>
      <form @submit.prevent="register">
        <!-- Name Input -->
        <div class="form-group mb-3">
          <input 
            type="text" 
            v-model="customer.name" 
            placeholder="First Name" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.name}"
          />
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>
        
        <!-- Surname Input -->
        <div class="form-group mb-3">
          <input 
            type="text" 
            v-model="customer.surname" 
            placeholder="Last Name" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.surname}"
          />
          <div v-if="errors.surname" class="invalid-feedback">{{ errors.surname }}</div>
        </div>
        
        <!-- Phone Number Input -->
        <div class="form-group mb-3">
          <input 
            type="text" 
            v-model="customer.phoneNumber" 
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
            v-model="customer.location" 
            placeholder="Location" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.location}"
          />
          <div v-if="errors.location" class="invalid-feedback">{{ errors.location }}</div>
        </div>

        <!-- Password Input -->
        <div class="form-group mb-4">
          <input 
            type="password" 
            v-model="customer.password" 
            placeholder="Password" 
            class="form-control form-control-lg border-main"
            required 
            :class="{'is-invalid': errors.password}"
          />
          <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Sign Up</button>
      </form>
      <div class="d-flex justify-content-between">
        <a href="/login" class="text-dark">Already have an account? Log In</a>
      </div>
      <div class="d-flex justify-content-between mt-3">
        <a href="/restaurant/register" class="text-dark">Are you a restaurant? Register</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

let router = useRouter();

const customer = reactive({
  name: '',
  surname: '',
  phoneNumber: '',
  location: '',
  password: '',
})

const errors = reactive({
  name: '',
  surname: '',
  phoneNumber: '',
  location: '',
  password: '',
})

const validateForm = () => {
  let isValid = true
  errors.name = ''
  errors.surname = ''
  errors.phoneNumber = ''
  errors.location = ''
  errors.password = ''

  if (!customer.name || customer.name.length < 2 || customer.name.length > 50) {
    errors.name = 'First name must be between 2 and 50 characters.'
    isValid = false
  }
  if (!customer.surname || customer.surname.length < 2 || customer.surname.length > 50) {
    errors.surname = 'Last name must be between 2 and 50 characters.'
    isValid = false
  }

  const phonePattern = /^5[0-9]{9}$/
  if (!phonePattern.test(customer.phoneNumber)) {
    errors.phoneNumber = 'Phone number must be 10 digits and start with 5.'
    isValid = false
  }

  if (!customer.location) {
    errors.location = 'Location cannot be empty.'
    isValid = false
  }

  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/
  if (!passwordPattern.test(customer.password)) {
    errors.password = 'Password must be at least 8 characters, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    isValid = false
  }

  return isValid
}

const register = async () => {
  Object.keys(errors).forEach(key => errors[key] = '') // Reset errors
  if (!validateForm()) return

  try {
    const res = await axios.post("/api/customer/register", customer)
    console.log(res)
    if (res.data.success) {
      router.push("/login");
    }
  } catch (err) {
    console.error("An error occurred during registration:", err)
  }
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
  