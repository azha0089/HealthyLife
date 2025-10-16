<template>
  <div class="page-container apply-page">
    <h2>Apply for Event</h2>
    <el-form :model="form" label-width="120px" class="apply-form">
      <el-form-item label="Name">
        <el-input v-model="form.name" placeholder="Event name" />
      </el-form-item>
      <el-form-item label="Time">
        <el-date-picker v-model="form.time" type="datetime" placeholder="Select date & time" style="width: 100%" />
      </el-form-item>
      <el-form-item label="Suburb">
        <el-select v-model="form.suburb" placeholder="Select suburb" filterable clearable style="width: 100%">
          <el-option v-for="s in suburbOptions" :key="s" :label="s" :value="s" />
        </el-select>
      </el-form-item>
      <el-form-item label="Address">
        <el-input v-model="form.address" placeholder="e.g., 1397 Toorak Rd Camberwell" />
      </el-form-item>
      <el-form-item label="Type">
        <el-select v-model="form.type" placeholder="Select type">
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="Location">
        <div class="map-picker">
          <div ref="mapRef" class="map"></div>
          <div class="coords" v-if="form.lat != null && form.lng != null">
            Lat: {{ form.lat.toFixed(6) }}, Lng: {{ form.lng.toFixed(6) }}
          </div>
          <div class="hint">Tap anywhere on the map (Melbourne) to select the location.</div>
        </div>
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="Describe the event" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">Submit</el-button>
        <el-button @click="$router.back()">Cancel</el-button>
      </el-form-item>
      <div class="helper">Submissions created here will be marked as <b>By: user</b> until approved by admin.</div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEventsStore } from '../stores/events.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const store = useEventsStore()
const types = computed(() => store.types)

const form = reactive({
  name: '', time: '', suburb: '', address: '', type: '', lat: null, lng: null, description: ''
})

const suburbOptions = [
  'Melbourne CBD','Southbank','Docklands','Carlton','Fitzroy','Richmond','St Kilda','Camberwell','Hawthorn','Kew','Box Hill','Burwood','Glen Waverley','Doncaster','South Yarra','Prahran','Toorak'
]

const mapRef = ref(null)
let map, marker

onMounted(() => {
  map = L.map(mapRef.value, { zoomControl: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  // Melbourne center
  map.setView([-37.8136, 144.9631], 11)
  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    form.lat = lat
    form.lng = lng
    if (!marker) {
      marker = L.marker([lat, lng]).addTo(map)
    } else {
      marker.setLatLng([lat, lng])
    }
  })
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

function submit() {
  if (!form.name || !form.time || !form.type || !form.suburb || form.lat == null || form.lng == null) {
    ElMessage.warning('Please complete all required fields')
    return
  }
  store.submitEvent({ ...form }).then(() => {
    ElMessage.success('Submitted for approval')
    router.push('/events')
  })
}
</script>

<style scoped>
.apply-page { padding: 16px; }
.apply-form { max-width: 720px; }
.map-picker { width: 100%; }
.map { width: 100%; height: 260px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.coords { margin-top: 8px; color:#555; font-size: 13px; }
.hint { margin-top: 4px; color:#888; font-size: 12px; }
</style>


