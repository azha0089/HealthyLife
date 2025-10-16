import { defineStore } from 'pinia'
import {
  listApprovedEvents,
  listPendingEvents,
  createEventSubmission,
  approveEvent,
  rejectEvent,
  createApprovedEvent,
  updateEvent,
  deleteEventById,
  bookEvent as svcBook,
  cancelBooking as svcCancel,
  listUserBookings
} from '../services/eventsService'
import { useAuthStore } from './auth'

// Simple in-memory id generator
let nextId = 1000
const generateId = () => `${Date.now()}_${nextId++}`

export const useEventsStore = defineStore('events', {
  state: () => ({
    // Filter state
    filterSuburb: '',
    filterType: '', // 'Sport' | 'Food Bank' | 'Healthy Seminar'

    // Approved events to display
    events: [],
    pendingSubmissions: [],
    myEvents: []
  }),

  getters: {
    suburbs(state) {
      return Array.from(new Set(state.events.map(e => e.suburb))).sort()
    },
    types() {
      return ['Sport', 'Food Bank', 'Healthy Seminar']
    },
    filteredEvents(state) {
      return state.events.filter(e => {
        const suburbOk = !state.filterSuburb || e.suburb === state.filterSuburb
        const typeOk = !state.filterType || e.type === state.filterType
        return suburbOk && typeOk
      })
    },
    myBookedEvents(state) {
      const set = new Set(state.myEvents)
      return state.events.filter(e => set.has(e.id))
    }
  },

  actions: {
    setFilter({ suburb, type }) {
      if (suburb !== undefined) this.filterSuburb = suburb
      if (type !== undefined) this.filterType = type
    },

    clearFilters() {
      this.filterSuburb = ''
      this.filterType = ''
    },

    async refreshApproved() {
      this.events = await listApprovedEvents()
    },

    async refreshPending() {
      this.pendingSubmissions = await listPendingEvents()
    },

    async refreshMyBookings() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) { this.myEvents = []; return }
      const rows = await listUserBookings(auth.user.uid)
      this.myEvents = rows.map(r => r.id)
    },

    async bookEvent(eventId) {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      await svcBook(eventId, auth.user.uid)
      await this.refreshMyBookings()
      await this.refreshApproved()
    },

    async cancelBooking(eventId) {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      await svcCancel(eventId, auth.user.uid)
      await this.refreshMyBookings()
      await this.refreshApproved()
    },

    async submitEvent(form) {
      const auth = useAuthStore()
      const id = await createEventSubmission(form, auth.user?.uid || null, auth.isAdmin ? 'admin' : 'user')
      await this.refreshPending()
      return id
    },

    // Admin approve
    async approveSubmission(submissionId) {
      await approveEvent(submissionId)
      await this.refreshPending()
      await this.refreshApproved()
      return true
    },

    async rejectSubmission(submissionId) {
      await rejectEvent(submissionId)
      await this.refreshPending()
    },

    // Admin CRUD helpers
    async adminCreateEvent(form) {
      const auth = useAuthStore()
      const id = await createApprovedEvent(form, auth.user?.uid || null, auth.isAdmin ? 'admin' : 'user')
      await this.refreshApproved()
      return id
    },

    async adminUpdateEvent(eventId, updates) {
      await updateEvent(eventId, updates)
      await this.refreshApproved()
    },

    async adminDeleteEvent(eventId) {
      await deleteEventById(eventId)
      await this.refreshApproved()
    }
  }
})


