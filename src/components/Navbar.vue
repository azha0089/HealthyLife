<template>
  <div class="navbar-container">

    <div class="navbar-wrapper">
      <div class="desktop-menu">
        <!-- Logo/Brand -->
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <el-icon class="brand-icon"><Apple /></el-icon>
            <span class="brand-text">HealthyLife</span>
          </router-link>
        </div>

    
        <el-menu
          :default-active="activeIndex"
          class="navbar-main-menu"
          mode="horizontal"
          background-color="transparent"
          text-color="#333"
          active-text-color="#409eff"
          router
          @select="handleSelect"
        >
          <el-menu-item index="/" route="/">
            <el-icon><House /></el-icon>
            <span>Home</span>
          </el-menu-item>

          <el-sub-menu index="learn">
            <template #title>
              <el-icon><Reading /></el-icon>
              <span>Learn</span>
            </template>
            <el-menu-item index="/learn/macro" route="/learn/macro">
              <el-icon><Operation /></el-icon>
              <span>Macro</span>
            </el-menu-item>
            <el-menu-item index="/learn/vitamins" route="/learn/vitamins">
              <el-icon><MagicStick /></el-icon>
              <span>Vitamins</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Recipes -->
          <el-menu-item index="/recipes" route="/recipes">
            <el-icon><ForkSpoon /></el-icon>
            <span>Recipes</span>
          </el-menu-item>

          <el-menu-item index="/events" route="/events">
            <el-icon><Calendar /></el-icon>
            <span>Events</span>
          </el-menu-item>

          <el-menu-item index="/profile" route="/profile">
            <el-icon><User /></el-icon>
            <span>Profile</span>
          </el-menu-item>
        </el-menu>

        <div class="navbar-right-menu">
          <!-- Not logged in state -->
          <template v-if="!authStore.isAuthenticated">
            <el-button type="text" @click="$router.push('/login')">
              <el-icon><Key /></el-icon>
              <span>login</span>
            </el-button>
            <el-button type="primary" @click="$router.push('/register')">
              register
            </el-button>
          </template>
          
          <template v-else>
            <el-dropdown @command="handleUserCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" :src="userAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="user-email">{{ authStore.currentUser?.email }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    about me
                  </el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" command="admin">
                    <el-icon><Setting /></el-icon>
                    adminDashBoard
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    login-out
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile navbar -->
    <div class="mobile-navbar">
      <!-- Mobile header bar -->
      <div class="mobile-header">
        <div class="mobile-brand">
          <router-link to="/" class="brand-link">
            <el-icon class="brand-icon"><Apple /></el-icon>
            <span class="brand-text">HealthyLife</span>
          </router-link>
        </div>
        <el-button 
          type="text" 
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
        >
          <el-icon :size="24"><Menu /></el-icon>
        </el-button>
      </div>

      <!-- Mobile drawer menu -->
      <el-drawer
        v-model="mobileMenuVisible"
        title="Navigation Menu"
        direction="ltr"
        size="280px"
        :with-header="false"
      >
        <div class="mobile-drawer-content">
          <!-- Mobile brand -->
          <div class="mobile-drawer-header">
            <router-link to="/" class="brand-link" @click="closeMobileMenu">
              <el-icon class="brand-icon"><Apple /></el-icon>
              <span class="brand-text">HealthyLife</span>
            </router-link>
          </div>

          <!-- Mobile menu -->
          <el-menu
            :default-active="activeIndex"
            class="mobile-menu"
            mode="vertical"
            background-color="transparent"
            text-color="#333"
            active-text-color="#409eff"
            router
            @select="handleMobileSelect"
          >
            <el-menu-item index="/" route="/">
              <el-icon><House /></el-icon>
              <span>Home</span>
            </el-menu-item>

            <!-- Learn submenu -->
            <el-sub-menu index="learn">
              <template #title>
                <el-icon><Reading /></el-icon>
                <span>Learn</span>
              </template>
              <el-menu-item index="/learn/macro" route="/learn/macro">
                <el-icon><Operation /></el-icon>
                <span>Macro</span>
              </el-menu-item>
              <el-menu-item index="/learn/vitamins" route="/learn/vitamins">
                <el-icon><MagicStick /></el-icon>
                <span>Vitamins</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- Recipes -->
            <el-menu-item index="/recipes" route="/recipes">
              <el-icon><ForkSpoon /></el-icon>
              <span>Recipes</span>
            </el-menu-item>

                         <el-menu-item index="/events" route="/events">
               <el-icon><Calendar /></el-icon>
               <span>Events</span>
             </el-menu-item>

             <el-menu-item index="/profile" route="/profile">
               <el-icon><User /></el-icon>
               <span>Profile</span>
             </el-menu-item>

             <el-divider />

             <!-- Mobile login/logout buttons -->
             <template v-if="!authStore.isAuthenticated">
               <el-menu-item @click="$router.push('/login')">
                 <el-icon><Key /></el-icon>
                 <span>Login</span>
               </el-menu-item>
               <el-menu-item @click="$router.push('/register')">
                 <el-icon><UserFilled /></el-icon>
                 <span>Register</span>
               </el-menu-item>
             </template>
             <template v-else>
               <el-menu-item v-if="authStore.isAdmin" @click="$router.push('/admin')">
                 <el-icon><Setting /></el-icon>
                 <span>Admin Panel</span>
               </el-menu-item>
               <el-menu-item @click="handleLogout">
                 <el-icon><SwitchButton /></el-icon>
                 <span>Logout</span>
               </el-menu-item>
             </template>
          </el-menu>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  House, Reading, ForkSpoon, Calendar, Key, User, Apple,
  Operation, MagicStick, Sunrise, Sunny, Orange, Document, Menu,
  ArrowDown, Setting, SwitchButton, UserFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileMenuVisible = ref(false)

// User avatar (using default avatar here)
const userAvatar = ref('')

// Calculate current active menu item
const activeIndex = computed(() => route.path)

// Handle desktop menu selection
const handleSelect = (key, keyPath) => {
  console.log('Selected menu:', key, keyPath)
}

// Handle mobile menu selection
const handleMobileSelect = (key, keyPath) => {
  console.log('Mobile Selected menu:', key, keyPath)
  // Close drawer after selecting menu item
  setTimeout(() => {
    mobileMenuVisible.value = false
  }, 300)
}

// Handle user dropdown menu commands
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('Successfully logged out')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('Failed to logout')
  }
}

// Toggle mobile menu display
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
}

// Close mobile menu
const closeMobileMenu = () => {
  mobileMenuVisible.value = false
}

// Listen for route changes, close mobile menu
watch(() => route.path, () => {
  mobileMenuVisible.value = false
})
</script>

<style scoped>
.navbar-container {
  position: relative;
  z-index: 1000;
}

/* Navbar wrapper */
.navbar-wrapper {
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Desktop navbar styles */
.desktop-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  width: 100%;
  min-height: 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-main-menu {
  flex: 1;
  border: none;
  background: transparent;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.navbar-right-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 30px;
  padding-right: 30px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  min-width: 180px;
  justify-content: flex-start;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-email {
  font-size: 14px;
  color: #333;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.navbar-brand {
  flex-shrink: 0;
  padding: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #409eff;
  font-weight: 600;
  font-size: 1.2rem;
}

.brand-icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
}

.brand-text {
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.5px;
}

/* Element Plus Menu style reset */
.navbar-main-menu.el-menu--horizontal {
  border: none;
  background: transparent;
}

.navbar-right-menu.el-menu--horizontal {
  border: none;
  background: transparent;
}

/* Mobile navbar styles */
.mobile-navbar {
  display: none;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mobile-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #409eff;
  font-weight: 600;
  font-size: 1.1rem;
}

.mobile-menu-toggle {
  padding: 0.5rem;
  color: #333;
}

.mobile-drawer-content {
  padding: 1rem 0;
}

.mobile-drawer-header {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 1rem;
}

.mobile-drawer-header .brand-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #409eff;
  font-weight: 600;
  font-size: 1.2rem;
}

.mobile-menu {
  border: none;
}

.mobile-menu .el-menu-item,
.mobile-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  padding: 0 1rem;
}

/* Small tablet adaptation (ensure all parent navigation is visible) */
@media (max-width: 900px) and (min-width: 769px) {
  .navbar-main-menu {
    gap: 0.5rem;
  }
  
  .navbar-main-menu > .el-menu-item span,
  .navbar-main-menu > .el-sub-menu .el-sub-menu__title span,
  .navbar-right-menu > .el-menu-item span {
    display: none;
  }
  
  .navbar-main-menu > .el-menu-item .el-icon,
  .navbar-main-menu > .el-sub-menu .el-sub-menu__title .el-icon,
  .navbar-right-menu > .el-menu-item .el-icon {
    margin-right: 0;
    font-size: 1.2rem;
  }
  
  .navbar-main-menu > .el-menu-item,
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title,
  .navbar-right-menu > .el-menu-item {
    padding: 0 0.4rem;
    min-width: auto;
    margin: 0 0.1rem;
    font-size: 1.2rem !important;
    font-weight: 500 !important;
  }
  
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title span {
    font-size: 1.2rem !important;
    font-weight: 500 !important;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }
  
  .mobile-navbar {
    display: block;
  }
}

/* Medium screen adaptation */
@media (max-width: 1200px) and (min-width: 1025px) {
  .navbar-main-menu {
    gap: 1.5rem;
  }
  
  .navbar-right-menu {
    margin-left: 20px;
    padding-right: 25px;
  }
  
  .user-email {
    max-width: 100px;
  }
  
  .navbar-main-menu > .el-menu-item,
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title,
  .navbar-right-menu > .el-menu-item {
    margin: 0 0.4rem;
    padding: 0 0.9rem;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
  }
  
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title span {
    font-size: 0.9rem !important;
    font-weight: 500 !important;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .desktop-menu {
    padding: 0 0.5rem;
  }
  
  .navbar-main-menu {
    gap: 1rem;
  }
  
  .navbar-right-menu {
    margin-left: 15px;
    padding-right: 20px;
  }
  
  .user-email {
    max-width: 80px;
  }
  
  .user-dropdown {
    min-width: 140px;
  }
  
  .navbar-main-menu > .el-menu-item,
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title,
  .navbar-right-menu > .el-menu-item {
    margin: 0 0.2rem;
    padding: 0 0.6rem;
    font-size: 0.85rem !important;
    font-weight: 500 !important;
  }
  
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title span {
    font-size: 0.85rem !important;
    font-weight: 500 !important;
  }
  
  .brand-text {
    font-size: 1rem;
  }
  
  .brand-icon {
    font-size: 1.3rem;
  }
}

@media (min-width: 769px) {
  .mobile-navbar {
    display: none;
  }
  
  .desktop-menu {
    display: flex;
  }
}

/* Custom style enhancements */
.el-menu--horizontal {
  border: none;
  background: transparent;
}

/* Menu item styles */
.navbar-main-menu > .el-menu-item,
.navbar-main-menu > .el-sub-menu > .el-sub-menu__title,
.navbar-right-menu > .el-menu-item {
  height: 60px;
  line-height: 60px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  margin: 0 0.8rem;
  border-radius: 4px 4px 0 0;
  padding: 0 1.2rem;
  font-size: 1rem !important;
  font-weight: 500 !important;
  white-space: nowrap;
  min-width: auto;
}

/* Ensure submenu title font matches regular menu items */
.navbar-main-menu > .el-sub-menu > .el-sub-menu__title {
  font-family: inherit !important;
  font-style: normal !important;
  font-variant: normal !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

/* Text styles within submenu titles */
.navbar-main-menu > .el-sub-menu > .el-sub-menu__title span {
  font-size: 1rem !important;
  font-weight: 500 !important;
  font-family: inherit !important;
}

/* Menu item hover and active styles */
.navbar-main-menu > .el-menu-item:hover,
.navbar-main-menu > .el-sub-menu:hover > .el-sub-menu__title,
.navbar-right-menu > .el-menu-item:hover {
  background-color: #f8f9fa;
  border-bottom-color: #409eff;
}

.navbar-main-menu > .el-menu-item.is-active,
.navbar-right-menu > .el-menu-item.is-active {
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: 600;
}

/* Clean up unused styles */

/* Submenu style optimization */
.el-menu--popup {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  margin-top: 2px;
}

.el-menu--popup .el-menu-item {
  padding: 0 20px;
  font-size: 0.9rem;
  height: 42px;
  line-height: 42px;
}

.el-menu--popup .el-menu-item:hover {
  background-color: #f5f7fa;
}

.el-menu-item [class^="el-icon"] {
  margin-right: 6px;
}

/* Ultra-wide screen optimization */
@media (min-width: 1401px) {
  .navbar-main-menu {
    gap: 3rem;
  }
  
  .navbar-main-menu > .el-menu-item,
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title,
  .navbar-right-menu > .el-menu-item {
    margin: 0 1rem;
    padding: 0 1.5rem;
    font-size: 1.1rem !important;
    font-weight: 500 !important;
  }
  
  .navbar-main-menu > .el-sub-menu > .el-sub-menu__title span {
    font-size: 1.1rem !important;
    font-weight: 500 !important;
  }
}

/* Ensure menu items are not compressed */
.navbar-main-menu > .el-menu-item,
.navbar-main-menu > .el-sub-menu {
  flex-shrink: 0;
  flex-grow: 0;
}

.navbar-right-menu > .el-menu-item {
  flex-shrink: 0;
  flex-grow: 0;
}

/* Ensure navbar can display all items on small screens */
.navbar-wrapper {
  min-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.navbar-wrapper::-webkit-scrollbar {
  height: 0;
  background: transparent;
}

/* Submenu arrow styles */
.el-sub-menu__icon-arrow {
  margin-left: 4px;
  color: #909399;
  transition: transform 0.3s ease;
}

.el-sub-menu.is-opened .el-sub-menu__icon-arrow {
  transform: rotateZ(180deg);
}

/* Mobile drawer styles */
:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 0;
}

:deep(.el-drawer__body) {
  padding: 0;
}
</style>
