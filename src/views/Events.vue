<template>
  <div class="page-container events-page">
    <div class="filters">
      <el-select v-model="suburb" placeholder="Suburb" clearable @change="applyFilters" style="min-width: 180px">
        <el-option v-for="s in suburbs" :key="s" :label="s" :value="s" />
      </el-select>
      <el-select v-model="type" placeholder="Type" clearable @change="applyFilters" style="min-width: 200px">
        <el-option v-for="t in types" :key="t" :label="t" :value="t" />
      </el-select>
      <el-button type="default" @click="clearAll">Reset</el-button>
      <el-button type="primary" @click="$router.push('/events/apply')">Apply for Event</el-button>
    </div>

    <div class="split">
      <div class="left">
        <el-scrollbar height="calc(100vh - 220px)">
          <el-empty v-if="list.length === 0" description="No events" />
          <el-card
            v-for="e in list"
            :key="e.id"
            class="event-card"
            shadow="hover"
          >
            <div class="event-header">
              <strong>{{ e.name }}</strong>
              <div style="display:flex; align-items:center; gap:8px;">
                <el-tag size="small">{{ e.type }}</el-tag>
                <el-tag v-if="e.createdBy" size="small" type="info">{{ e.createdBy }}</el-tag>
              </div>
            </div>
            <div class="event-meta">
              <span>{{ formatDateTime(e.time) }}</span>
              <span>{{ e.suburb }}</span>
              <span v-if="e.bookingsCount >= 0"><el-icon style="margin-right:4px"><User /></el-icon>{{ e.bookingsCount }}</span>
            </div>
            <div class="event-actions">
              <el-button size="small" type="primary" @click="navigateTo(e)">Navigate</el-button>
              <el-button size="small" @click="openDetails(e)">View Details</el-button>
              <el-button
                v-if="!isBooked(e.id)"
                size="small"
                type="success"
                @click="book(e)"
              >Book</el-button>
              <el-button
                v-else
                size="small"
                type="warning"
                @click="cancel(e)"
              >Cancel</el-button>
            </div>
          </el-card>
        </el-scrollbar>
      </div>
      <div class="right">
        <div ref="mapRef" class="map"></div>
      </div>
    </div>

    <el-dialog v-model="detailsVisible" width="520px" :title="activeEvent?.name || 'Event Details'">
      <template #default>
        <div v-if="activeEvent">
          <p><strong>Time:</strong> {{ formatDateTime(activeEvent.time) }}</p>
          <p><strong>Type:</strong> <el-tag size="small">{{ activeEvent.type }}</el-tag></p>
          <p><strong>Suburb:</strong> {{ activeEvent.suburb }}</p>
          <p><strong>Address:</strong> {{ activeEvent.address }}</p>
          <p v-if="activeEvent.createdBy"><strong>Created by:</strong> {{ activeEvent.createdBy }}</p>
          <p v-if="activeEvent.bookingsCount >= 0"><strong>Bookings:</strong> {{ activeEvent.bookingsCount }}</p>
          <p class="desc">{{ activeEvent.description }}</p>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailsVisible = false">Close</el-button>
        <el-button type="primary" @click="navigateTo(activeEvent)">Navigate</el-button>
        <el-button v-if="!isBooked(activeEvent?.id)" type="success" @click="book(activeEvent)">Book</el-button>
        <el-button v-else type="warning" @click="cancel(activeEvent)">Cancel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { useEventsStore } from '../stores/events.js'
import L from 'leaflet'
import { User } from '@element-plus/icons-vue'
import 'leaflet/dist/leaflet.css'

const store = useEventsStore()

const suburb = ref(store.filterSuburb)
const type = ref(store.filterType)
const suburbs = computed(() => store.suburbs)
const types = computed(() => store.types)
const list = computed(() => store.filteredEvents)

const mapRef = ref(null)
let map, markersLayer

const detailsVisible = ref(false)
const activeEvent = ref(null)

function applyFilters() {
  store.setFilter({ suburb: suburb.value, type: type.value })
  renderMarkers()
}

function clearAll() {
  suburb.value = ''
  type.value = ''
  store.clearFilters()
  renderMarkers()
}

function navigateTo(e) {
  if (!e) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.lat + ',' + e.lng)}&destination_place_id=&travelmode=walking`
  window.open(url, '_blank')
}

function openDetails(e) {
  activeEvent.value = e
  detailsVisible.value = true
}

function book(e) {
  if (!e) return
  store.bookEvent(e.id)
}

function cancel(e) {
  if (!e) return
  store.cancelBooking(e.id)
}

function isBooked(eventId) {
  return store.myEvents.includes(eventId)
}

function renderMarkers() {
  if (!map) return
  if (markersLayer) {
    markersLayer.clearLayers()
  } else {
    markersLayer = L.layerGroup().addTo(map)
  }
  list.value.forEach(e => {
    const m = L.marker([e.lat, e.lng]).addTo(markersLayer)
    m.on('click', () => openDetails(e))
    m.bindTooltip(`${e.name}\n${formatDateTime(e.time)}`, { permanent: false })
  })
  if (list.value.length) {
    const bounds = L.latLngBounds(list.value.map(e => [e.lat, e.lng]))
    map.fitBounds(bounds, { padding: [30, 30] })
  }
}

onMounted(async () => {
  await Promise.all([
    store.refreshApproved(),
    store.refreshMyBookings()
  ])
  map = L.map(mapRef.value, { zoomControl: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  map.setView([-37.8136, 144.9631], 11) // Melbourne default
  renderMarkers()
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

watch(list, renderMarkers)

// Timestamp-friendly formatters
function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string' || typeof val === 'number') return new Date(val)
  if (val?.toDate) return val.toDate() // Firestore Timestamp
  if (val?.seconds) return new Date(val.seconds * 1000)
  return null
}

function pad(n) { return n < 10 ? '0' + n : '' + n }
function formatDateTime(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.events-page {
  padding: 16px;
}
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.split {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 16px;
  align-items: start;
}
.left {
  min-width: 0;
}
.right {
  min-width: 0;
}
.map {
  width: 100%;
  height: calc(100vh - 220px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
.event-card + .event-card { margin-top: 12px; }
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.event-meta { color:#666; font-size: 13px; display:flex; gap:10px; }
.event-actions { margin-top: 10px; display:flex; gap:8px; }

@media (max-width: 900px) {
  .split { grid-template-columns: 1fr; }
  .map { height: 360px; }
}

@media (max-width: 600px) {
  .filters { flex-wrap: wrap; }
  .map { height: 320px; }
}
</style>


