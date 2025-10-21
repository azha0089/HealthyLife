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

// Unique super admin email
export const SUPER_ADMIN_EMAIL = 'arkingz2001@gmail.com'

// Prefer env var; fallback to your provided Apps Script URL
const EMAIL_WEBAPP_URL =
  import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL ||
  'https://script.google.com/macros/s/AKfycbztBRp0dJbw9DsFNoCL-hkeuypwsBPeVP1K35DYK8ttBTTsCSTHw4Vwa6I1sGw1cvS4Ow/exec'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    authInitialized: false
  }),

  getters: {
    currentUser: (state) => state.user,

    userRole: (state) => {
      return state.user?.role || localStorage.getItem('role') || null
    },

    // ✅ 调试输出超级管理员判断
    isSuperAdmin: (state) => {
      const email = state.user?.email || null
      const match =
        email && email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

      console.log('--- [DEBUG] Super Admin Check ---')
      console.log('Current user email:', email)
      console.log('Super admin email:', SUPER_ADMIN_EMAIL)
      console.log('Match result:', match)
      console.log('---------------------------------')

      return match
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
    // --- Login with Google ---
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

        // ✅ 打印登录邮箱 & 超管匹配
        console.log('[Google Login] User logged in:', this.user.email)
        console.log(
          'Is super admin?',
          this.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        )

        // Fire-and-forget login email
        try {
          const html = buildAuthEmailTemplate({
            title: 'Login Successful',
            greeting: `Hi ${this.user.displayName || this.user.email},`,
            contentLines: [
              'You have successfully signed in to HealthyLife.',
              'If this was not you, please change your password immediately.'
            ]
          })
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
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // --- Login with Email ---
    async login(email, password) {
      try {
        this.loading = true
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )
        const firebaseUser = userCredential.user

        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
        let userData = userDoc.data()
        localStorage.setItem('role', userData?.role)

        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: userData?.role || 'user'
        }
        this.isAuthenticated = true

        // ✅ 调试输出邮箱匹配状态
        console.log('[Email Login] User logged in:', this.user.email)
        console.log('Super admin email:', SUPER_ADMIN_EMAIL)
        console.log(
          'Is super admin?',
          this.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        )

        return { success: true, user: this.user }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // --- Register ---
    async register(email, password, role = 'user') {
      try {
        this.loading = true
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
        const firebaseUser = userCredential.user
        const userDocData = {
          email: firebaseUser.email,
          role,
          createdAt: new Date(),
          displayName: firebaseUser.displayName || null
        }
        await setDoc(doc(firestore, 'users', firebaseUser.uid), userDocData)
        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role
        }
        this.isAuthenticated = true
        return { success: true, user: this.user }
      } catch (error) {
        console.error('Registration error:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    // --- Logout ---
    async logout() {
      try {
        await signOut(auth)
        console.log('[Auth] Logged out successfully.')
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('role')
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        return { success: false, message: 'Logout failed' }
      }
    },

    async signOut() {
      return await this.logout()
    },

    // --- Auth state listener ---
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
              let userData = userDoc.data()

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

              // ✅ 输出当前登录邮箱与超级管理员比较
              console.log('[Auth Initialized]')
              console.log('Current user email:', this.user.email)
              console.log('Super admin email:', SUPER_ADMIN_EMAIL)
              console.log(
                'Is super admin:',
                this.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
              )
            } catch (error) {
              console.error('Error fetching user data:', error)
              this.user = null
              this.isAuthenticated = false
            }
          } else {
            this.user = null
            this.isAuthenticated = false
          }

          this.authInitialized = true
          resolve()
        })
      })
    },

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
