<template>
  <div class="layout-container">

    <!-- Auth Loading State -->
    <div v-if="!authStore.authInitialized" class="auth-loading">
      <div class="loading-content">
        <el-icon class="loading-icon" size="50"><Loading /></el-icon>
        <h2>Loading...</h2>
        <p>Initializing your session</p>
      </div>
    </div>

    <!-- Main Layout -->
    <template v-else>
      <header v-if="!hideNavbar" class="layout-header">
        <Navbar />
      </header>


      <main class="layout-main" :class="{ 'no-navbar': hideNavbar }">
        <div class="content-wrapper" :class="{ 'full-height': hideNavbar }">
          <router-view />
        </div>
      </main>


      <footer v-if="!hideNavbar" class="layout-footer">
        <div class="footer-content">
          <p>&copy; 2025 HealthyLife. All rights reserved.</p>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Navbar from '../components/Navbar.vue'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const authStore = useAuthStore()

// Calculate whether to hide navbar
const hideNavbar = computed(() => {
  return route.meta?.hideNavbar === true
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* Auth Loading Styles */
.auth-loading {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  animation: spin 2s linear infinite;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.loading-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allow flex items to scale correctly */
}

.content-wrapper {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

/* Styles when there is no navbar */
.layout-main.no-navbar {
  min-height: 100vh;
}

.content-wrapper.full-height {
  max-width: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.layout-footer {
  background-color: #ffffff;
  border-top: 1px solid #e6e6e6;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* Mobile adaptation */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .footer-content {
    padding: 1rem;
  }
}

/* Tablet adaptation */
@media (max-width: 1024px) and (min-width: 769px) {
  .content-wrapper {
    padding: 1.5rem;
  }
}
</style>
