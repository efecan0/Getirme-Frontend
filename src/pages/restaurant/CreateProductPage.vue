<template>
  <div class="container mt-5">
    <ToastNotification v-if="showToast" :message="toastMessage" :duration="3000" />
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="mb-4 main-color">Create New Product</h2>
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div class="mb-3">
            <label for="name" class="form-label">Product Name</label>
            <input v-model="product.name" type="text" class="form-control" id="name" required />
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea v-model="product.description" class="form-control" id="description" rows="3" required></textarea>
          </div>

          <div class="mb-3">
            <label for="price" class="form-label">Price (₺)</label>
            <input v-model.number="product.price" type="number" step="0.01" class="form-control" id="price" required />
          </div>

          <div class="mb-3">
            <label for="image" class="form-label">Product Image</label>
            <input @change="onImageSelected" type="file" class="form-control" id="image" accept="image/*" />
          </div>

          <div
            v-for="(options, key, index) in product.selectableContentOptions"
            :key="index"
            class="mb-4 border p-3 rounded bg-light-subtle"
          >
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0 main-color">{{ key }}</h5>
              <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContentGroup(key)">Delete</button>
            </div>

            <div v-for="(option, optIndex) in options" :key="optIndex" class="mb-2 row gx-2">
              <div class="col">
                <input v-model="option.name" type="text" class="form-control" placeholder="Option Name" />
              </div>
              <div class="col">
                <input v-model.number="option.price" type="number" step="0.01" class="form-control" placeholder="Price" />
              </div>
              <div class="col-auto">
                <button type="button" class="btn btn-outline-danger" @click="removeOption(key, optIndex)">-</button>
              </div>
            </div>

            <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addOption(key)">
              + Add Option
            </button>
          </div>

          <div class="mb-3">
            <label class="form-label">New Selectable Content Title</label>
            <div class="d-flex">
              <input v-model="newGroupKey" type="text" class="form-control me-2" placeholder="e.g. Sauces" />
              <button type="button" class="btn btn-success" @click="addNewGroup">Add</button>
            </div>
          </div>

          <button type="submit" class="btn btn-success mt-3">Create Product</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue'
import axios from 'axios'
import ToastNotification from '../../components/ToastNotification.vue';

const showToast = ref(false);
const toastMessage = ref('');
let router = useRouter();


const product = reactive({
  name: '',
  description: '',
  price: null,
  image: null,
  selectableContentOptions: {}
});

const newGroupKey = ref('');

const onImageSelected = (e) => {
  product.image = e.target.files[0];
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
  product.selectableContentOptions[key].splice(index, 1);
  if (product.selectableContentOptions[key].length === 0) {
    delete product.selectableContentOptions[key];
  }
}

const removeContentGroup = (key) => {
  delete product.selectableContentOptions[key];
}

const submitForm = async () => {
  try {   
  const formData = new FormData();
  formData.append('name', product.name);
  formData.append('description', product.description);
  formData.append('price', product.price);

  if (product.image) {
    formData.append('image', product.image);
  }

  formData.append('selectableContentOptionMap', JSON.stringify(product.selectableContentOptions));
    
    await axios.post('/api/restaurant/createProduct', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    router.push('/restaurant/update');

  } catch (error) {
    console.log(error);
    toastMessage.value = error.response?.data?.exception?.message.split(":")[1] || "An Error Occured.";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
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
