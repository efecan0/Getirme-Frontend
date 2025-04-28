<template>
    <div class="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="update-box bg-white p-5 rounded shadow-lg my-auto">
            <div class="text-center mb-4">
            <h1 class="text-main">Profil Bilgilerini Güncelle</h1>
            <p class="text-muted">Profil bilgilerinizi güncelleyin</p>
            </div>
            <form @submit.prevent="updateCustomer">

            <!-- Profile Name Input -->
            <div class="form-group mb-3">
                <input 
                type="text" 
                v-model="customer.name" 
                placeholder="Adınız" 
                class="form-control form-control-lg border-main"
                :class="{'is-invalid': errors.name}"
                required
                />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
            </div>

            <div class="form-group mb-3">
                <input 
                type="text" 
                v-model="customer.surname" 
                placeholder="Soyadınız" 
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
                v-model="customer.phoneNumber" 
                placeholder="Telefon Numarası (İsteğe Bağlı)" 
                class="form-control form-control-lg border-main"
                :class="{'is-invalid': errors.phoneNumber}"
                />
                <div v-if="errors.phoneNumber" class="invalid-feedback">{{ errors.phoneNumber }}</div>
                <small class="form-text text-muted">Numaranızı değiştirmek istemiyorsanız boş bırakın.</small>
            </div>

            <!-- Location Input -->
            <div class="form-group mb-3">
                <input 
                type="text" 
                v-model="customer.location" 
                placeholder="Lokasyon" 
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
                v-model="customer.password" 
                placeholder="Yeni Şifre (İsteğe Bağlı)" 
                class="form-control form-control-lg border-main"
                :class="{'is-invalid': errors.password}"
                />
                <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
                <small class="form-text text-muted">Şifreyi değiştirmek istemiyorsanız boş bırakın.</small>
            </div>

            <button type="submit" class="btn btn-main btn-lg w-100 mb-3">Bilgileri Güncelle</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const customer = ref({
    name: null,
    surname : null,
    phoneNumber: null,
    location: null,
    password: null,
})

const errors = ref({})

async function fetchCustomerData() {
    try {
    const response = await axios.get('/api/customer/getUserInfo', { withCredentials: true })
    const data = response.data.data
    console.log(data)
    Object.assign(customer.value, data)
    } catch (error) {
    console.error("Veri Çekme Hatası:", error)
    }
}

async function updateCustomer() {
    try {
    const response = await axios.post('/api/customer/update', customer.value , {withCredentials : true})
    if (response.data.success) {
        router.push('/restaurant-list')
    }
    } catch (error) {
    console.error("Güncelleme Hatası:", error)
    }
}

onMounted(() => {
    fetchCustomerData()
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
</style>
