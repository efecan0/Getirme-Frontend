<template>
    <div class="container mt-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="mb-4 main-color">Yeni Ürün Oluştur</h2>
          <form @submit.prevent="submitForm" enctype="multipart/form-data">
            <div class="mb-3">
              <label for="name" class="form-label">Ürün Adı</label>
              <input v-model="product.name" type="text" class="form-control" id="name" required />
            </div>
  
            <div class="mb-3">
              <label for="description" class="form-label">Açıklama</label>
              <textarea v-model="product.description" class="form-control" id="description" rows="3" required></textarea>
            </div>
  
            <div class="mb-3">
              <label for="price" class="form-label">Fiyat (₺)</label>
              <input v-model.number="product.price" type="number" step="0.01" class="form-control" id="price" required />
            </div>
  
            <div class="mb-3">
              <label for="image" class="form-label">Ürün Görseli</label>
              <input @change="onImageSelected" type="file" class="form-control" id="image" accept="image/*" />
            </div>
  
            <div
              v-for="(options, key, index) in product.selectableContentOptions"
              :key="index"
              class="mb-4 border p-3 rounded bg-light-subtle"
            >
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0 main-color">{{ key }}</h5>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContentGroup(key)">Sil</button>
              </div>
  
              <div v-for="(option, optIndex) in options" :key="optIndex" class="mb-2 row gx-2">
                <div class="col">
                  <input v-model="option.name" type="text" class="form-control" placeholder="Seçenek Adı" />
                </div>
                <div class="col">
                  <input v-model.number="option.price" type="number" step="0.01" class="form-control" placeholder="Fiyat" />
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-danger" @click="removeOption(key, optIndex)">-</button>
                </div>
              </div>
  
              <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addOption(key)">
                + Seçenek Ekle
              </button>
            </div>
  
            <div class="mb-3">
              <label class="form-label">Yeni Seçilebilir İçerik Başlığı</label>
              <div class="d-flex">
                <input v-model="newGroupKey" type="text" class="form-control me-2" placeholder="Örn: Soslar" />
                <button type="button" class="btn btn-success" @click="addNewGroup">Ekle</button>
              </div>
            </div>
  
            <button type="submit" class="btn btn-success mt-3">Ürünü Oluştur</button>
          </form>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'

const product = reactive({
  name: '',
  description: '',
  price: null,
  image: null,
  selectableContentOptions: {}
})

const newGroupKey = ref('')

const onImageSelected = (e) => {
  product.image = e.target.files[0]
}

const addNewGroup = () => {
  if (newGroupKey.value && !product.selectableContentOptions[newGroupKey.value]) {
    product.selectableContentOptions[newGroupKey.value] = [
      { name: '', price: 0 }
    ]
    newGroupKey.value = ''
  }
}

const addOption = (key) => {
  product.selectableContentOptions[key].push({ name: '', price: 0 })
}

const removeOption = (key, index) => {
  product.selectableContentOptions[key].splice(index, 1)
  if (product.selectableContentOptions[key].length === 0) {
    delete product.selectableContentOptions[key]
  }
}

const removeContentGroup = (key) => {
  delete product.selectableContentOptions[key]
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('name', product.name)
  formData.append('description', product.description)
  formData.append('price', product.price)

  if (product.image) {
    formData.append('image', product.image)
  }

  formData.append('selectableContentOptionMap', JSON.stringify(product.selectableContentOptions))


  try {
    console.log(product);
    const response = await axios.post('/api/restaurant/createProduct', formData, {
      withCredentials : true,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      
    })
    console.log(response);
    alert('Ürün başarıyla oluşturuldu!')
  } catch (error) {
    console.error(error)
    alert('Ürün oluşturulurken bir hata oluştu.')
  }
}
</script>


<style scoped>
h5 {
  color: #FF9F00;
}

.main-color {
  color: #FF9F00;
}

.card {
  border-radius: 1rem;
}

.bg-light-subtle {
  background-color: #fdf8f1;
}
</style>
