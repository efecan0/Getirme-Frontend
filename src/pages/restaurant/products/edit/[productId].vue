<template>
    <div class="container mt-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="mb-4 main-color">Ürünü Düzenle</h2>
          <form @submit.prevent="submitForm" enctype="multipart/form-data">
            <div class="mb-3">
              <label for="name" class="form-label">Ürün Adı</label>
              <input v-model="data.name" type="text" class="form-control" id="name" required />
            </div>
  
            <div class="mb-3">
              <label for="description" class="form-label">Açıklama</label>
              <textarea v-model="data.description" class="form-control" id="description" rows="3" required></textarea>
            </div>
  
            <div class="mb-3">
              <label for="price" class="form-label">Fiyat (₺)</label>
              <input v-model.number="data.price" type="number" step="0.01" class="form-control" id="price" required />
            </div>
  
            <div class="mb-3">
              <label for="image" class="form-label">Ürün Görseli</label>
              <input @change="onImageSelected" type="file" class="form-control" id="image" accept="image/*" />
            </div>
  
            <div
              v-for="(options, key) in selectableContent.value"
              :key="key"
              class="mb-4 border p-3 rounded bg-light-subtle"
            >
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0 main-color">{{ options.name }}</h5>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContentGroup(key)">Sil</button>
              </div>
  
              <div v-for="(option, optIndex) in options.selectableContentOptionDtoList" :key="optIndex" class="mb-2 row gx-2">
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
  
            <div class="d-flex justify-content-center ">
                <div @click="deleteProduct" class="btn btn-danger mt-3 mx-1">Ürünü Sil</div>
                <button type="submit" class="btn btn-success mt-3 mx-1">Ürünü Güncelle</button>
            </div>
            
          </form>
        </div>
      </div>
      
    </div>
  </template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import router from '@/router';
const route = useRoute();
const productId = route.params.productId;


let data = ref({
  name: '',
  description: '',
  price: null,
  image: null,
})
const selectableContent = reactive({})

const deleteProduct = async () => {
   const response = await axios.post(`/api/restaurant/deleteProduct/${productId}` , {withCredentials : true});
   if(response.data.success){
    router.push("/restaurant/update")
   }else{
    alert("ürün silinirken bir hata oluştu!")
   }
}


onMounted(async () => {
    const response = await axios.get(`/api/restaurant/product/details/${productId}` , {withCredentials : true})
    console.log(response)
    data.value = response.data.data.product
    selectableContent.value = response.data.data.selectableContent
    console.log(selectableContent)
    data.value.image = null
})

const newGroupKey = ref('')

const onImageSelected = (e) => {
  data.value.image = e.target.files[0]
}

const addNewGroup = () => {
  if (newGroupKey.value && !selectableContent.value.find((i) => i.name === newGroupKey.value)) {
    selectableContent.value.push({ id : null , name :newGroupKey.value , selectableContentOptionDtoList : [{ name: '', price: 0 }]})
    newGroupKey.value = ''
  }
}

const addOption = (key) => {
  selectableContent.value[key].selectableContentOptionDtoList.push({ name: '', price: 0 })
}

const removeOption = (key, index) => {
    console.log(selectableContent.value[key])
    selectableContent.value[key].selectableContentOptionDtoList.splice(index, 1)
}

const removeContentGroup = (key) => {
  selectableContent.value.splice(key , 1)
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('updateProductDtoIU', new Blob([JSON.stringify({
  name : data.value.name,
  description : data.value.description,
  price : data.value.price,
  selectableContentDtoList: selectableContent.value
})], { type: 'application/json' }));
    formData.append('image', data.value.image)


  try {
    console.log(data.value);
    const response = await axios.post(`/api/restaurant/updateProduct/${productId}`, formData, {
      withCredentials : true,
      headers : {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log(response);
    if(response.data.success){
        router.push("/restaurant/update")
    }
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
