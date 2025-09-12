import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '../firebase.js'

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
