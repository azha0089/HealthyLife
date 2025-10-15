import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '../firebase.js'
import { sendEmail, buildAuthEmailTemplate } from '../services/emailService.js'

// Prefer env var; fallback to your provided Apps Script URL to ensure it works immediately
const EMAIL_WEBAPP_URL = import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL ||
  'https://script.google.com/macros/s/AKfycbztBRp0dJbw9DsFNoCL-hkeuypwsBPeVP1K35DYK8ttBTTsCSTHw4Vwa6I1sGw1cvS4Ow/exec'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    authInitialized: false // Add authentication initialization state
  }),

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => {
      // Get from state first, then from localStorage
      return state.user?.role || localStorage.getItem('role') || null
    },
    isAdmin: (state) => {
      const role = state.user?.role || localStorage.getItem('role')
      return role === 'admin'
    },
    isUser: (state) => {
      const role = state.user?.role || localStorage.getItem('role')
      return role === 'user'
    }
  },

  actions: {
    // Login with Google
    async loginWithGoogle() {
      try {
        this.loading = true

        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        const firebaseUser = result.user

        const userRef = doc(firestore, 'users', firebaseUser.uid)
        const userDoc = await getDoc(userRef)
        let userData = userDoc.data()

        if (!userDoc.exists()) {
          const newUser = {
            email: firebaseUser.email,
            role: 'user',
            createdAt: new Date(),
            displayName: firebaseUser.displayName || null
          }
          await setDoc(userRef, newUser)
          userData = newUser
        }

        localStorage.setItem('role', userData?.role)

        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: userData?.role || 'user'
        }
        this.isAuthenticated = true

        // Fire-and-forget welcome/login email
        try {
          const html = buildAuthEmailTemplate({
            title: 'Login Successful',
            greeting: `Hi ${this.user.displayName || this.user.email},`,
            contentLines: [
              'You have successfully signed in to HealthyLife.',
              'If this was not you, please change your password immediately.'
            ]
          })
          console.debug('[auth] login: preparing to send login email', { to: this.user.email, url: EMAIL_WEBAPP_URL })
          sendEmail({
            to: this.user.email,
            subject: 'HealthyLife - Login notification',
            html,
            webAppUrl: EMAIL_WEBAPP_URL
          }).catch(() => {})
        } catch (_) {}

        return { success: true, user: this.user }
      } catch (error) {
        console.error('Google login error:', error)

        let message = 'Login failed, please try again later'
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            message = 'Login popup closed'
            break
          case 'auth/cancelled-popup-request':
            message = 'Login popup was cancelled'
            break
          case 'auth/popup-blocked':
            message = 'Popup was blocked by the browser'
            break
          case 'auth/operation-not-allowed':
            message = 'Google Sign-In is disabled for this project'
            break
        }

        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    // Login
    async login(email, password) {
      try {
        this.loading = true

        // Firebase login
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        // Get user role information from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
        let userData = userDoc.data()

         console.log("User data is ",userData)
         // Store role in localStorage
         localStorage.setItem("role",userData?.role )

        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: userData?.role || 'user'
        }
        this.isAuthenticated = true

        // Fire-and-forget welcome/login email
        try {
          const html = buildAuthEmailTemplate({
            title: 'Login Successful',
            greeting: `Hi ${this.user.displayName || this.user.email},`,
            contentLines: [
              'You have successfully signed in to HealthyLife with Google.',
              'If this was not you, please secure your account.'
            ]
          })
          console.debug('[auth] loginWithGoogle: preparing to send login email', { to: this.user.email, url: EMAIL_WEBAPP_URL })
          sendEmail({
            to: this.user.email,
            subject: 'HealthyLife - Google Sign-in notification',
            html,
            webAppUrl: EMAIL_WEBAPP_URL
          }).catch(() => {})
        } catch (_) {}

        return { success: true, user: this.user }
      } catch (error) {
        console.error('Login error:', error)

        let message = 'Login failed, please try again later'

        // Firebase error handling
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'User not found'
            break
          case 'auth/wrong-password':
            message = 'Incorrect password'
            break
          case 'auth/invalid-email':
            message = 'Invalid email format'
            break
          case 'auth/too-many-requests':
            message = 'Too many failed attempts, please try again later'
            break
          case 'auth/invalid-credential':
            message = 'Email or password is incorrect'
            break
          case 'auth/configuration-not-found':
            message = 'Firebase Authentication not configured. Please check Firebase Console.'
            break
        }

        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    // Register
    async register(email, password, role = 'user') {
      try {
        this.loading = true

        // Step 1: Create user account with Firebase registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        // Step 2: Create user document in Firestore, including role information
        const userDocData = {
          email: firebaseUser.email,
          role: role,
          createdAt: new Date(),
          displayName: firebaseUser.displayName || null
        }

        await setDoc(doc(firestore, 'users', firebaseUser.uid), userDocData)

        // Step 3: Set local user state
        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: role
        }
        this.isAuthenticated = true

        // Fire-and-forget welcome email after registration
        try {
          const html = buildAuthEmailTemplate({
            title: 'Welcome to HealthyLife',
            greeting: `Hi ${this.user.displayName || this.user.email},`,
            contentLines: [
              'Your account has been created successfully.',
              'Enjoy exploring recipes, nutrition, and more!'
            ]
          })
          console.debug('[auth] register: preparing to send welcome email', { to: this.user.email, url: EMAIL_WEBAPP_URL })
          sendEmail({
            to: this.user.email,
            subject: 'Welcome to HealthyLife',
            html,
            webAppUrl: EMAIL_WEBAPP_URL
          }).catch(() => {})
        } catch (_) {}

        return { success: true, user: this.user }
      } catch (error) {
        console.error('Registration error:', error)

        let message = 'Registration failed, please try again later'

        // Firebase error handling
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'This email is already registered'
            break
          case 'auth/invalid-email':
            message = 'Invalid email format'
            break
          case 'auth/weak-password':
            message = 'Password is too weak'
            break
          case 'auth/operation-not-allowed':
            message = 'Registration is temporarily disabled'
            break
          case 'auth/configuration-not-found':
            message = 'Firebase Authentication not configured. Please check Firebase Console.'
            break
        }

        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    // Logout
    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.isAuthenticated = false
        // Clear user data from localStorage
        localStorage.removeItem('role')
        // Note: Don't reset authInitialized, as the authentication system is still initialized
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        return { success: false, message: 'Logout failed' }
      }
    },

    // Logout (alias)
    async signOut() {
      return await this.logout()
    },

    // Initialize authentication state monitoring
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User logged in, get user data from Firestore
            try {
              const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
              let userData = userDoc.data()

              // If user document doesn't exist (compatible with legacy users), create default document
              if (!userDoc.exists()) {
                const defaultUserData = {
                  email: firebaseUser.email,
                  role: 'user',
                  createdAt: new Date(),
                  displayName: firebaseUser.displayName || null
                }
                await setDoc(doc(firestore, 'users', firebaseUser.uid), defaultUserData)
                userData = defaultUserData
              }

              this.user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: userData.role
              }
              this.isAuthenticated = true
            } catch (error) {
              console.error('Error fetching user data:', error)
              this.user = null
              this.isAuthenticated = false
            }
          } else {
            // User not logged in
            this.user = null
            this.isAuthenticated = false
          }
          
          // Mark authentication initialization complete
          this.authInitialized = true
          resolve()
        })
      })
    },

    // Update user profile
    async updateUserProfile(displayName) {
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName })
          this.user = { ...this.user, displayName }
          return { success: true }
        }
        return { success: false, message: 'No user logged in' }
      } catch (error) {
        console.error('Update profile error:', error)
        return { success: false, message: 'Failed to update profile' }
      }
    }
  }
})
