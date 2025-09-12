import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router/router.js'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Initialize authentication state and wait for it to complete
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  // Mount app after auth initialization is complete
  app.mount('#app')
})
