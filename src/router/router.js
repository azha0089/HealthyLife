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
import Profile from '../views/Profile.vue'
import RecipeManagement from '../views/RecipeManagement.vue'
import UserManagement from '../views/UserManagement.vue'

const Events = { template: '<div class="page-container"><h2>Events</h2><p>Latest health activity information</p></div>' }

// Import recipe components
import Recipes from '../views/Recipes.vue'
import RecipeDetail from '../views/RecipeDetail.vue'

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
    path: '/recipes', 
    component: Recipes, 
    name: 'Recipes',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  { 
    path: '/recipes/:id', 
    component: RecipeDetail, 
    name: 'RecipeDetail',
    meta: { requiresAuth: true, roles: ['user', 'admin'] }
  },
  
  // Admin-only routes
  { 
    path: '/admin', 
    component: Admin, 
    name: 'Admin',
    meta: { requiresAuth: true, roles: ['admin'], hideNavbar: true },
    children: [
      {
        path: 'recipes',
        component: RecipeManagement,
        name: 'AdminRecipes',
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'users',
        component: UserManagement,
        name: 'AdminUsers',
        meta: { requiresAuth: true, roles: ['admin'] }
      }
    ]
  },
  
  // Redirects for old routes (to maintain compatibility)
  { path: '/recipes/breakfast', redirect: '/recipes' },
  { path: '/recipes/lunch', redirect: '/recipes' },
  { path: '/recipes/vegan', redirect: '/recipes' },
  { path: '/recipes/detail/:id', redirect: to => `/recipes/${to.params.id}` }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for authentication initialization to complete
  if (!authStore.authInitialized) {
    await authStore.initAuth()
  }
  
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