<template>
  <div class="page-container my-events">
  <!-- Showing only events I joined -->

    <div class="split">
      <div class="left">
        <el-empty v-if="eventsList.length === 0" description="No events" />
        <el-card v-for="e in eventsList" :key="e.id" class="event-card" :class="{ conflict: isConflict(e) }" shadow="hover">
          <div class="event-header">
            <strong>{{ e.name }}</strong>
            <div class="tags">
              <el-tag size="small">{{ e.type }}</el-tag>
              <el-tag v-if="isConflict(e)" size="small" type="danger" effect="dark">Conflict</el-tag>
            </div>
          </div>
          <div class="event-meta">
            <span>{{ formatDateTime(e.time) }}</span>
            <span>{{ e.suburb }}</span>
          </div>
        </el-card>
      </div>
      <div class="right">
        <div class="calendar">
          <el-calendar v-model="calendarValue">
            <template #date-cell="{ data }">
              <div class="cell" :class="{ has: hasEvent(data.day), conflict: isConflictDay(data.day) }">
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
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '../stores/events'
import { useAuthStore } from '../stores/auth'

const store = useEventsStore()
const auth = useAuthStore()

const eventsList = computed(() => store.myBookedEvents)

// Build a map: date (YYYY-MM-DD) -> events[] for that day, based on the visible list
const conflictsByDay = computed(() => {
  const map = new Map()
  for (const e of eventsList.value) {
    const day = formatDate(e.time)
    if (!day) continue
    if (!map.has(day)) map.set(day, [])
    map.get(day).push(e)
  }
  return map
})

function isConflict(event) {
  const day = formatDate(event?.time)
  if (!day) return false
  const arr = conflictsByDay.value.get(day) || []
  return arr.length >= 2
}

const calendarValue = ref(new Date())

function hasEvent(dayStr) {
  const day = dayStr.slice(0, 10)
  return eventsList.value.some(e => formatDate(e.time) === day)
}

function isConflictDay(dayStr) {
  const day = dayStr.slice(0, 10)
  const arr = conflictsByDay.value.get(day) || []
  return arr.length >= 2
}

onMounted(async () => {
  await Promise.all([
    store.refreshApproved(),
    store.refreshMyBookings()
  ])
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
function formatDate(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function formatDateTime(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return ''
  return `${formatDate(val)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.my-events { padding: 16px; }
.filters { margin-bottom: 12px; }
.split { display:grid; grid-template-columns: 420px 1fr; gap: 16px; align-items:start; }
.left, .right { min-width: 0; }
.event-card + .event-card { margin-top: 12px; }
.event-card.conflict { border: 2px solid #f56c6c; box-shadow: 0 0 0 2px rgba(245,108,108,0.15) inset; }
.event-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.event-header .tags { display:flex; gap:6px; align-items:center; }
.event-meta { color:#666; font-size:13px; display:flex; gap:10px; }
.calendar :deep(.el-calendar-table) { height: auto; }
.cell { width:100%; height:100%; padding:4px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.cell.has { background:#f0f9eb; border:1px solid #c2e7b0; }
.cell.conflict { background:#fff2f0; border:1px solid #ffccc7; color:#cf1322; font-weight:600; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
</style>


