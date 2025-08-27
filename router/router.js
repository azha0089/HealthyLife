import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { ElMessage } from 'element-plus'

// Import page components
import Home from '../views/Home.vue'
import Learn from '../views/Learn.vue'
import Macro from '../views/Macro.vue'
import Vitamins from '../views/Vitamins.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import VitaminsArticleDetail from '../views/VitaminsArticleDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'

const Events = { template: '<div class="page-container"><h2>Events</h2><p>Latest health activity information</p></div>' }
const Profile = { template: '<div class="page-container"><h2>Profile</h2><p>User profile information</p></div>' }

// Recipes sub-pages
const Breakfast = { template: '<div class="page-container"><h2>Breakfast Recipes</h2><p>Healthy and delicious breakfast options</p></div>' }
const Lunch = { template: '<div class="page-container"><h2>Lunch Recipes</h2><p>Nutritionally balanced lunch recommendations</p></div>' }
const Vegan = { template: '<div class="page-container"><h2>Vegan Recipes</h2><p>Pure plant-based cooking guide</p></div>' }
const RecipeDetail = { template: '<div class="page-container"><h2>Recipe Details</h2><p>Detailed preparation steps and nutritional information</p></div>' }

const routes = [
  // Public routes
  { 
    path: '/login', 
    component: Login, 
    name: 'Login',
    meta: { requiresAuth: false, hideNavbar: true }
  },
  { 
    path: '/register', 
    component: Register, 
    name: 'Register',
    meta: { requiresAuth: false, hideNavbar: true }
  },
  
  // Routes that require login
  { 
    path: '/', 
    component: Home, 
    name: 'Home',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/events', 
    component: Events, 
    name: 'Events',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/profile', 
    component: Profile, 
    name: 'Profile',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  
  // Learn routes
  { 
    path: '/learn', 
    component: Learn, 
    name: 'Learn',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/learn/macro', 
    component: Macro, 
    name: 'Macro',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/learn/macro/:id', 
    component: ArticleDetail, 
    name: 'MacroArticleDetail',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/learn/vitamins', 
    component: Vitamins, 
    name: 'Vitamins',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/learn/vitamins/:id', 
    component: VitaminsArticleDetail, 
    name: 'VitaminsArticleDetail',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  
  // Recipes routes (require login)
  { 
    path: '/recipes/breakfast', 
    component: Breakfast, 
    name: 'Breakfast',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/recipes/lunch', 
    component: Lunch, 
    name: 'Lunch',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/recipes/vegan', 
    component: Vegan, 
    name: 'Vegan',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/recipes/detail', 
    component: RecipeDetail, 
    name: 'RecipeDetail',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  
  // Admin-only routes
  { 
    path: '/admin', 
    component: Admin, 
    name: 'Admin',
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  
  // Redirects
  { path: '/recipes', redirect: '/recipes/breakfast' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // If route doesn't require authentication, proceed directly
  if (to.meta.requiresAuth === false) {
    // If logged-in user accesses login/register pages, redirect to homepage
    if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      if (authStore.userRole === 'admin') {
        next('/admin')
      } else {
        next('/')
      }
    } else {
      next()
    }
    return
  }
  
  // Check if authentication is required
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    ElMessage.warning('Please login first')
    next('/login')
    return
  }
  
  // Check role permissions
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    ElMessage.error('You do not have permission to access this page')
    // Redirect to appropriate page based on user role
    if (authStore.userRole === 'admin') {
      next('/admin')
    } else {
      next('/')
    }
    return
  }
  
  next()
})

export default router
