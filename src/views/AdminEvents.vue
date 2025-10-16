<template>
  <div class="page-container admin-events">
    <h2>Admin - Event Submissions</h2>
    <div class="toolbar">
      <el-button type="primary" @click="showCreate = true">Create Event</el-button>
      <el-button @click="store.refreshPending()">Refresh Pending</el-button>
    </div>

    <el-empty v-if="pending.length === 0" description="No pending submissions" />
    <el-card v-for="s in pending" :key="s.id" class="submission-card" shadow="hover">
      <div class="header">
        <strong>{{ s.name }}</strong>
        <el-tag size="small" type="warning">{{ s.type }}</el-tag>
      </div>
      <div class="meta">
        <span>{{ formatDateTime(s.time) }}</span>
        <span>{{ s.suburb }}</span>
        <span>{{ s.address }}</span>
        <span v-if="s.createdBy">By: {{ s.createdBy }}</span>
      </div>
      <div class="desc">{{ s.description }}</div>
      <div class="actions">
        <el-button type="success" size="small" @click="approve(s.id)">Approve</el-button>
        <el-button type="danger" size="small" @click="reject(s.id)">Reject</el-button>
      </div>
    </el-card>

    <el-dialog v-model="showCreate" title="Create Event" width="680px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="Name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Time"><el-date-picker v-model="form.time" type="datetime" style="width:100%" /></el-form-item>
        <el-form-item label="Suburb">
          <el-select v-model="form.suburb" placeholder="Select suburb" filterable clearable style="width: 100%">
            <el-option v-for="s in suburbOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="Address"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="Type">
          <el-select v-model="form.type">
            <el-option v-for="t in store.types" :key="t" :label="t" :value="t" />
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
        <el-form-item label="Desc"><el-input type="textarea" :rows="3" v-model="form.description" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate=false">Cancel</el-button>
        <el-button type="primary" @click="createNow">Create</el-button>
      </template>
    </el-dialog>

    <div class="section-split" />

    <div class="section-header">
      <h3>Approved Events</h3>
      <div class="actions">
        <el-button @click="store.refreshApproved()">Refresh</el-button>
      </div>
    </div>
    <div class="approved-split">
      <div class="left">
        <el-empty v-if="approved.length === 0" description="No approved events" />
        <el-card v-for="e in approved" :key="e.id" class="submission-card" shadow="hover">
          <div class="header">
            <strong>{{ e.name }}</strong>
            <el-tag type="success" size="small">{{ e.type }}</el-tag>
          </div>
          <div class="meta">
            <span>{{ formatDateTime(e.time) }}</span>
            <span>{{ e.suburb }}</span>
            <span>{{ e.address }}</span>
            <span v-if="e.bookingsCount >= 0">Bookings: {{ e.bookingsCount }}</span>
            <span v-if="e.createdBy">By: {{ e.createdBy }}</span>
          </div>
          <div class="desc">{{ e.description }}</div>
          <div class="actions">
            <el-popconfirm title="Delete this event?" confirm-button-text="Delete" cancel-button-text="Cancel" @confirm="del(e.id)">
              <template #reference>
                <el-button type="danger" size="small">Delete</el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>
      <div class="right">
        <div class="calendar">
          <el-calendar v-model="calendarValue">
            <template #date-cell="{ data }">
              <div class="cal-cell" :class="{ has: hasEvent(data.day) }">
                <span>{{ new Date(data.day).getDate() }}</span>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, onBeforeUnmount, watch } from 'vue'
import { useEventsStore } from '../stores/events'
import { ElMessage } from 'element-plus'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const store = useEventsStore()
const pending = computed(() => store.pendingSubmissions)
const approved = computed(() => store.events)
const showCreate = ref(false)
const form = reactive({ name:'', time:'', suburb:'', address:'', type:'', lat:null, lng:null, description:'' })
const suburbOptions = [
  'Melbourne CBD','Southbank','Docklands','Carlton','Fitzroy','Richmond','St Kilda','Camberwell','Hawthorn','Kew','Box Hill','Burwood','Glen Waverley','Doncaster','South Yarra','Prahran','Toorak'
]
const mapRef = ref(null)
let map, marker
const calendarValue = ref(new Date())

onMounted(() => {
  store.refreshPending()
  store.refreshApproved()
  // init map once dialog open handled in nextTick; here prepare center
})

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string' || typeof val === 'number') return new Date(val)
  if (val?.toDate) return val.toDate()
  if (val?.seconds) return new Date(val.seconds * 1000)
  return null
}
function pad(n) { return n < 10 ? '0' + n : '' + n }
function formatDateTime(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

function hasEvent(dayStr) {
  const day = dayStr.slice(0, 10)
  return approved.value.some(e => formatDate(e.time) === day)
}

function approve(id) {
  if (store.approveSubmission(id)) {
    ElMessage.success('Approved')
  }
}

function reject(id) {
  store.rejectSubmission(id)
  ElMessage.info('Rejected')
}

async function createNow() {
  if (!form.name || !form.time || !form.type || !form.suburb || form.lat == null || form.lng == null) {
    ElMessage.warning('Please complete all fields')
    return
  }
  await store.adminCreateEvent({ ...form })
  showCreate.value = false
  ElMessage.success('Created')
}

async function del(id) {
  await store.adminDeleteEvent(id)
  ElMessage.success('Deleted')
}

// Watch dialog open to mount map
watch(showCreate, (v) => {
  if (v) {
    setTimeout(() => {
      if (!map && mapRef.value) {
        map = L.map(mapRef.value, { zoomControl: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)
        map.setView([-37.8136, 144.9631], 11)
        map.on('click', (e) => {
          const { lat, lng } = e.latlng
          form.lat = lat
          form.lng = lng
          if (!marker) marker = L.marker([lat, lng]).addTo(map)
          else marker.setLatLng([lat, lng])
        })
      }
    }, 50)
  }
})

onBeforeUnmount(() => { if (map) map.remove() })
</script>

<style scoped>
.admin-events { padding: 16px; }
.toolbar { margin-bottom: 12px; display:flex; gap:8px; }
.section-header { display:flex; justify-content:space-between; align-items:center; margin: 16px 0 8px; }
.section-split { height: 1px; background: #eee; margin: 16px 0; }
.submission-card + .submission-card { margin-top: 12px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.meta { color:#666; font-size:13px; display:flex; gap:10px; margin-bottom:6px; }
.desc { margin-bottom: 8px; }
.actions { display:flex; gap:8px; }
.map-picker { width:100%; }
.map { width:100%; height: 260px; border-radius:8px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.coords { margin-top: 8px; color:#555; font-size:13px; }
.hint { margin-top: 4px; color:#888; font-size:12px; }
.approved-split { display:grid; grid-template-columns: 1fr 420px; gap:16px; align-items:start; }
.left, .right { min-width:0; }
.calendar :deep(.el-calendar-table) { height: auto; }
.cal-cell { width:100%; height:100%; padding:4px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.cal-cell.has { background:#f0f9ff; border:1px solid #b3e5fc; }
</style>


