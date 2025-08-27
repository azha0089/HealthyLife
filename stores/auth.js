import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    // Mock user data
    users: [
      {
        email: 'user@google.com',
        password: '123456',
        role: 'user'
      },
      {
        email: 'admin@google.com',
        password: '123456',
        role: 'admin'
      }
    ]
  }),

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user'
  },

  actions: {
    // Login
    async login(email, password) {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const user = this.users.find(u => u.email === email && u.password === password)
        
        if (user) {
          this.user = { email: user.email, role: user.role }
          this.isAuthenticated = true
          
          // Save to localStorage
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('isAuthenticated', 'true')
          
          return { success: true, user: this.user }
        } else {
          return { success: false, message: 'Email or password is incorrect' }
        }
      } catch (error) {
        return { success: false, message: 'Login failed, please try again later' }
      }
    },

    // Register
    async register(email, password, role = 'user') {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if user already exists
        const existingUser = this.users.find(u => u.email === email)
        
        if (existingUser) {
          return { success: false, message: 'This email is already registered' }
        }
        
        // Add new user
        const newUser = { email, password, role }
        this.users.push(newUser)
        
        // Auto login
        this.user = { email: newUser.email, role: newUser.role }
        this.isAuthenticated = true
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('isAuthenticated', 'true')
        
        return { success: true, user: this.user }
      } catch (error) {
        return { success: false, message: 'Registration failed, please try again later' }
      }
    },

    // Logout
    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    },

    // Initialize authentication state
    initAuth() {
      const user = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      
      if (user && isAuthenticated === 'true') {
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    }
  }
})
