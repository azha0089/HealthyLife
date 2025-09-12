<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>User Registration</h1>
        <p>Create your new account and start your health journey</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="0px"
        size="large"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="Enter your email"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="Enter your password"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="registerForm.role"
            placeholder="Select user role"
            style="width: 100%"
            prefix-icon="User"
          >
            <el-option label="Regular User" value="user" />
            <el-option label="Administrator" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            I have read and agree to the
            <a href="#" class="agreement-link" @click.prevent>Terms of Service</a>
            and
            <a href="#" class="agreement-link" @click.prevent>Privacy Policy</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            Register
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="login-link">Sign in now</router-link>
        </p>
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
const registerFormRef = ref()
const loading = ref(false)

// Form data
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  agreement: false
})

// Custom validators
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter password again'))
  } else if (value !== registerForm.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please read and agree to the terms of service'))
  } else {
    callback()
  }
}

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
    },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
      message: 'Password must contain letters and numbers',
      trigger: ['blur', 'change']
    }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: ['blur', 'change'] }
  ],
  role: [
    { required: true, message: 'Please select user role', trigger: 'change' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

// Handle registration
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true
    const result = await authStore.register(
      registerForm.email, 
      registerForm.password, 
      registerForm.role
    )
    
    if (result.success) {
      ElMessage.success('Registration successful, logging you in...')
      
      // Redirect to appropriate page based on user role
      setTimeout(() => {
        if (result.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }, 1000)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('Registration failed, please try again later')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.register-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

.agreement-link {
  color: #667eea;
  text-decoration: none;
}

.agreement-link:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  color: #666;
}
</style>
