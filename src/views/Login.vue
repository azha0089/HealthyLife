<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>User Login</h1>
        <p>Welcome back, please enter your account information</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0px"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="Enter your email"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Enter your password"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            Login
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register" class="register-link">Sign up now</router-link>
        </p>
      </div>

      <!-- Test account information -->
      <div class="test-accounts">
        <h3>Test Accounts</h3>
        <div class="account-item">
          <strong>Admin:</strong> admin@google.com / 123456
        </div>
        <div class="account-item">
          <strong>User:</strong> user@google.com / 123456
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref()
const loading = ref(false)

// Form data
const loginForm = reactive({
  email: '',
  password: ''
})

// Form validation rules
const rules = {
  email: [
    { required: true, message: 'Please enter email address', trigger: 'blur' },
    {
      type: 'email',
      message: 'Please enter a valid email format',
      trigger: ['blur', 'change']
    }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: 'Password length should be 6-20 characters',
      trigger: ['blur', 'change']
    }
  ]
}

// Handle login
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true
    const result = await authStore.login(loginForm.email, loginForm.password)

    if (result.success) {
      ElMessage.success('Login successful')

      // Redirect to appropriate page based on user role
      if (result.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('Login failed, please try again later')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

.test-accounts {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.test-accounts h3 {
  color: #333;
  font-size: 16px;
  margin: 0 0 15px 0;
}

.account-item {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.account-item:last-child {
  margin-bottom: 0;
}

.account-item strong {
  color: #333;
}
</style>
