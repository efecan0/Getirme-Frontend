<template>
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="register-box bg-white p-5 rounded shadow-lg">
        <div class="text-center mb-4">
          <h1 class="text-main">Kayıt Ol</h1>
          <p class="text-muted">Hesabınızı Oluşturun</p>
        </div>
        <form @submit.prevent="register">
          <!-- Name Input -->
          <div class="form-group mb-3">
            <input 
              type="text" 
              v-model="customer.name" 
              placeholder="Ad" 
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
              placeholder="Soyad" 
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
              v-model="customer.location" 
              placeholder="Lokasyon" 
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
              placeholder="Şifre" 
              class="form-control form-control-lg border-main"
              required 
              :class="{'is-invalid': errors.password}"
            />
            <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
          </div>
  
          <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Kayıt Ol</button>
        </form>
        <div class="d-flex justify-content-between">
          <a href="/login" class="text-dark">Zaten Hesabınız Var mı? Giriş Yap</a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        customer: {
          name: '',
          surname: '',
          phoneNumber: '',
          location: '',
          password: '',
        },
        errors: {
          name: '',
          surname: '',
          phoneNumber: '',
          location: '',
          password: '',
        },
      };
    },
    methods: {
      // Form submit işlemi
      register() {
        this.errors = {}; // Hata mesajlarını sıfırla
        const isValid = this.validateForm();
        if (!isValid) return;
  
        // Burada API'ye veri gönderilebilir.
        console.log('Kullanıcı kaydedildi:', this.customer);
        // Yönlendirme veya başka bir işlem yapılabilir
      },
  
      // Form doğrulama
      validateForm() {
        let isValid = true;
        if (!this.customer.name || this.customer.name.length < 2 || this.customer.name.length > 50) {
          this.errors.name = 'Ad 2-50 karakter arasında olmalıdır.';
          isValid = false;
        }
        if (!this.customer.surname || this.customer.surname.length < 2 || this.customer.surname.length > 50) {
          this.errors.surname = 'Soyad 2-50 karakter arasında olmalıdır.';
          isValid = false;
        }
        const phonePattern = /^5[0-9]{9}$/;
        if (!phonePattern.test(this.customer.phoneNumber)) {
          this.errors.phoneNumber = 'Telefon numarası 10 haneli ve 5 ile başlamalıdır.';
          isValid = false;
        }
        if (!this.customer.location) {
          this.errors.location = 'Lokasyon boş bırakılamaz.';
          isValid = false;
        }
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordPattern.test(this.customer.password)) {
          this.errors.password = 'Şifre en az 8 karakter olmalı, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir.';
          isValid = false;
        }
        return isValid;
      },
    },
  };
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
  