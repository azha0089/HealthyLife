import { firestore } from '../firebase'
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, increment
} from 'firebase/firestore'

const eventsCol = collection(firestore, 'events')

export async function listApprovedEvents() {
  const q = query(eventsCol, where('status', '==', 'approved'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function listPendingEvents() {
  const q = query(eventsCol, where('status', '==', 'pending'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createEventSubmission(data, organizerId, createdBy = 'user') {
  const payload = {
    name: data.name,
    time: data.time, // store as string for now
    type: data.type,
    suburb: data.suburb,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    description: data.description || '',
    status: 'pending',
    organizerId: organizerId || null,
    createdBy,
    bookingsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  const ref = await addDoc(eventsCol, payload)
  return ref.id
}

export async function createApprovedEvent(data, organizerId, createdBy = 'admin') {
  const payload = {
    name: data.name,
    time: data.time,
    type: data.type,
    suburb: data.suburb,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    description: data.description || '',
    status: 'approved',
    organizerId: organizerId || null,
    createdBy,
    bookingsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  const ref = await addDoc(eventsCol, payload)
  return ref.id
}

export async function approveEvent(eventId) {
  const ref = doc(eventsCol, eventId)
  await updateDoc(ref, { status: 'approved', updatedAt: serverTimestamp() })
}

export async function rejectEvent(eventId) {
  const ref = doc(eventsCol, eventId)
  await updateDoc(ref, { status: 'rejected', updatedAt: serverTimestamp() })
}

export async function updateEvent(eventId, updates) {
  const ref = doc(eventsCol, eventId)
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
}

export async function deleteEventById(eventId) {
  const ref = doc(eventsCol, eventId)
  await deleteDoc(ref)
}

// Booking helpers: store both under event and under user for easy querying
export async function bookEvent(eventId, userId) {
  if (!eventId || !userId) return
  // events/{eventId}/bookings/{userId}
  const bookingRef = doc(firestore, 'events', eventId, 'bookings', userId)
  await setDoc(bookingRef, { userId, createdAt: serverTimestamp() })
  // users/{userId}/bookings/{eventId}
  const userBookingRef = doc(firestore, 'users', userId, 'bookings', eventId)
  await setDoc(userBookingRef, { eventId, createdAt: serverTimestamp() })
  // increment counter
  await updateDoc(doc(eventsCol, eventId), { bookingsCount: increment(1) })
}

export async function cancelBooking(eventId, userId) {
  if (!eventId || !userId) return
  await deleteDoc(doc(firestore, 'events', eventId, 'bookings', userId))
  await deleteDoc(doc(firestore, 'users', userId, 'bookings', eventId))
  await updateDoc(doc(eventsCol, eventId), { bookingsCount: increment(-1) })
}

export async function getEventById(eventId) {
  const d = await getDoc(doc(eventsCol, eventId))
  return d.exists() ? { id: d.id, ...d.data() } : null
}

export async function listUserBookings(userId) {
  const q = collection(firestore, 'users', userId, 'bookings')
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) // id is eventId
}


