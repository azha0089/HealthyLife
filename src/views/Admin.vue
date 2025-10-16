<template>
  <div class="admin-container">
    <!-- 左侧导航栏 -->
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        mode="vertical"
        @select="handleMenuSelect"
      >
        <el-menu-item index="dashboard">
          <el-icon><Odometer /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        
        <el-menu-item index="users" @click="navigateToUserManagement">
          <el-icon><User /></el-icon>
          <span>User Management</span>
        </el-menu-item>
        
        <!-- <el-menu-item index="content">
          <el-icon><Document /></el-icon>
          <span>Content Management</span>
        </el-menu-item> -->
        
        <el-menu-item index="recipes" @click="navigateToRecipeManagement">
          <el-icon><ForkSpoon /></el-icon>
          <span>Recipe Management</span>
        </el-menu-item>
        <el-menu-item index="macro-articles" @click="navigateToMacroManagement">
          <el-icon><TrendCharts /></el-icon>
          <span>Macro Articles Management</span>
        </el-menu-item>
        <el-menu-item index="vitamin-articles" @click="navigateToVitaminManagement">
          <el-icon><MagicStick /></el-icon>
          <span>Vitamin Articles Management</span>
        </el-menu-item>
        <el-menu-item index="events" @click="navigateToEvents">
          <el-icon><Calendar /></el-icon>
          <span>Events Management</span>
        </el-menu-item>
        
        <!-- <el-menu-item index="settings">
          <el-icon><Setting /></el-icon>
          <span>System Settings</span>
        </el-menu-item> -->
      </el-menu>
      
      <!-- 退出登录按钮 -->
      <div class="sidebar-footer">
        <el-button 
          type="danger" 
          style="width: 100%;" 
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span>Logout</span>
        </el-button>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="admin-content">
      <!-- 路由视图，用于显示子路由内容 -->
      <router-view v-if="$route.path !== '/admin'" />
      
      <!-- 仪表盘 -->
      <div v-if="$route.path === '/admin' && activeMenu === 'dashboard'" class="content-section">
        <div class="content-header">
          <h3>System Overview</h3>
        </div>
        
        <div class="dashboard-cards">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ totalUsers }}</div>
              <div class="stats-label">Total Users</div>
            </div>
            <el-icon class="stats-icon"><User /></el-icon>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ adminUsers }}</div>
              <div class="stats-label">Administrators</div>
            </div>
            <el-icon class="stats-icon"><Avatar /></el-icon>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ regularUsers }}</div>
              <div class="stats-label">Regular Users</div>
            </div>
            <el-icon class="stats-icon"><UserFilled /></el-icon>
          </el-card>
        </div>

        <div class="charts-grid">
          <el-card class="chart-card">
            <div class="chart-title">User Registrations (Last 30 days)</div>
            <div ref="chartUsersRef" class="chart-box"></div>
          </el-card>
          <el-card class="chart-card">
            <div class="chart-title">Event Type Distribution</div>
            <div ref="chartEventTypeRef" class="chart-box"></div>
          </el-card>
          <el-card class="chart-card">
            <div class="chart-title">Top Events by Bookings</div>
            <div ref="chartTopEventsRef" class="chart-box"></div>
          </el-card>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-if="$route.path === '/admin' && activeMenu === 'users'" class="content-section">
        <div class="content-header">
          <h3>User Management</h3>
          <div class="header-actions">
            <el-button type="primary" @click="navigateToUserManagement">
              <el-icon><User /></el-icon>
              Manage Users
            </el-button>
          </div>
        </div>
        
        <div style="padding: 24px; text-align: center;">
          <el-card style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center;">
              <el-icon style="font-size: 64px; color: #409eff; margin-bottom: 16px;"><User /></el-icon>
              <h3 style="margin: 16px 0;">User Management System</h3>
              <p style="color: #666; margin-bottom: 24px;">
                Manage all your users in one place. Add, edit, delete, and organize user accounts.
              </p>
              <el-button type="primary" size="large" @click="navigateToUserManagement">
                <el-icon><User /></el-icon>
                Open User Manager
              </el-button>
            </div>
          </el-card>
        </div>

      </div>


      <!-- 内容管理 -->
      <div v-if="$route.path === '/admin' && activeMenu === 'content'" class="content-section">
        <div class="content-header">
          <h3>Content Management</h3>
        </div>
        <el-empty description="Content management features under development..." />
      </div>

        <!-- 菜谱管理 -->
      <div v-if="$route.path === '/admin' && activeMenu === 'recipes'" class="content-section">
        <div class="content-header">
          <h3>Recipe Management</h3>
          <div class="header-actions">
            <el-button type="primary" @click="navigateToRecipeManagement">
              <el-icon><ForkSpoon /></el-icon>
              Manage Recipes
            </el-button>
          </div>
        </div>
        
        <div style="padding: 24px; text-align: center;">
          <el-card style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center;">
              <el-icon style="font-size: 64px; color: #409eff; margin-bottom: 16px;"><ForkSpoon /></el-icon>
              <h3 style="margin: 16px 0;">Recipe Management System</h3>
              <p style="color: #666; margin-bottom: 24px;">
                Manage all your recipes in one place. Add, edit, delete, and organize your recipe collection.
              </p>
              <el-button type="primary" size="large" @click="navigateToRecipeManagement">
                <el-icon><ForkSpoon /></el-icon>
                Open Recipe Manager
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
        
        <!-- 系统设置 -->
      <div v-if="$route.path === '/admin' && activeMenu === 'settings'" class="content-section">
        <div class="content-header">
          <h3>System Settings</h3>
        </div>
        <el-empty description="System settings features under development..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Odometer, Document, Setting, Avatar, UserFilled, Refresh, Plus, Search, SwitchButton, ForkSpoon,
  TrendCharts, MagicStick, Operation, DataBoard, Calendar
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth.js'
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser as deleteUserService,
  getUserStats,
  batchUpdateUserRole
} from '../services/userService.js'

const router = useRouter()
const authStore = useAuthStore()
const activeMenu = ref('dashboard')
const loading = ref(false)
const users = ref([])

// Search and filter
const searchQuery = ref('')
const filterRole = ref('')

// User statistics
const userStats = ref({
  total: 0,
  admin: 0,
  user: 0,
  recentRegistrations: 0
})

// Selected users
const selectedUsers = ref([])

// Add user dialog
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref()
const addForm = ref({
  email: '',
  displayName: '',
  role: 'user'
})

// Edit user dialog
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref()
const editForm = ref({
  uid: '',
  email: '',
  displayName: '',
  role: 'user'
})

// Form validation rules
const addFormRules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email format', trigger: ['blur', 'change'] }
  ],
  role: [
    { required: true, message: 'Please select a role', trigger: 'change' }
  ]
}

const editFormRules = {
  role: [
    { required: true, message: 'Please select a role', trigger: 'change' }
  ]
}

// Computed properties
const filteredUsers = computed(() => {
  let result = users.value

  // Role filter
  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.email.toLowerCase().includes(query) ||
      (user.displayName && user.displayName.toLowerCase().includes(query))
    )
  }

  return result
})

// Calculate statistics
const totalUsers = computed(() => users.value.length)
const adminUsers = computed(() => users.value.filter(user => user.role === 'admin').length)
const regularUsers = computed(() => users.value.filter(user => user.role === 'user').length)

// Handle menu selection
const handleMenuSelect = (index) => {
  activeMenu.value = index
  
  // Navigate to corresponding pages for certain menu items
  if (index === 'recipes') {
    navigateToRecipeManagement()
    return
  } else if (index === 'users') {
    navigateToUserManagement()
    return
  } else if (index === 'macro-articles') {
    navigateToMacroManagement()
    return
  } else if (index === 'vitamin-articles') {
    navigateToVitaminManagement()
    return
  } else if (index === 'events') {
    navigateToEvents()
    return
  }
  
  // Load data if needed
  if (index === 'users' && users.value.length === 0) {
    fetchUsers()
  }
  if (index === 'dashboard') {
    // refresh charts data whenever returning to dashboard
    loadEventsForCharts().then(refreshCharts)
    if (router.currentRoute.value.path !== '/admin') {
      router.push('/admin')
    }
  }
}

// Get all users
const fetchUsers = async () => {
  try {
    loading.value = true
    users.value = await getAllUsers()
    
    // Update statistics
    await updateUserStats()
    
    console.log('Fetched user list:', users.value)
  } catch (error) {
    console.error('Failed to get users:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// Update user statistics
const updateUserStats = async () => {
  try {
    userStats.value = await getUserStats()
  } catch (error) {
    console.error('Failed to get user statistics:', error)
  }
}

// Refresh user data
const refreshUsers = () => {
  fetchUsers()
}

// Search handling
const handleSearch = () => {
  // Real-time search, handled by computed property filteredUsers
}

// Role filter handling
const handleRoleFilter = () => {
  // Real-time filtering, handled by computed property filteredUsers
}

// Table selection handling
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// Switch user role
const changeUserRole = async (user) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'set as administrator' : 'set as regular user'
    
    await ElMessageBox.confirm(
      `Are you sure you want to ${action} user ${user.email}?`,
      'Confirm Operation',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await updateUser(user.uid, { role: newRole })
    
    // Update local data
    const userIndex = users.value.findIndex(u => u.uid === user.uid)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
    
    // Update statistics
    await updateUserStats()
    
    ElMessage.success(`User role updated to ${newRole === 'admin' ? 'Administrator' : 'Regular User'}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to update user role:', error)
      ElMessage.error(error.message || 'Failed to update user role')
    }
  }
}

// Confirm delete user
const confirmDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete user ${user.email}? This operation cannot be undone!`,
      'Dangerous Operation',
      {
        confirmButtonText: 'Confirm Delete',
        cancelButtonText: 'Cancel',
        type: 'error',
      }
    )

    await deleteUserService(user.uid)
    
    // Remove from local data
    users.value = users.value.filter(u => u.uid !== user.uid)
    
    // Update statistics
    await updateUserStats()
    
    ElMessage.success('User deleted successfully')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
      ElMessage.error(error.message || 'Failed to delete user')
    }
  }
}

// Show add user dialog
const showAddDialog = () => {
  addDialogVisible.value = true
  // Reset form
  addForm.value = {
    email: '',
    displayName: '',
    role: 'user'
  }
  // Clear validation results
  nextTick(() => {
    addFormRef.value?.clearValidate()
  })
}

// Handle add user
const handleAddUser = async () => {
  try {
    // 表单验证
    const valid = await addFormRef.value.validate()
    if (!valid) return

    addLoading.value = true
    
    // 创建用户
    await createUser(addForm.value)
    
    ElMessage.success('User created successfully')
    
    // 关闭对话框
    addDialogVisible.value = false
    
    // 刷新用户列表
    await fetchUsers()
  } catch (error) {
    console.error('Failed to create user:', error)
    ElMessage.error(error.message || 'Failed to create user')
  } finally {
    addLoading.value = false
  }
}

// Handle add dialog close
const handleAddDialogClose = () => {
  addDialogVisible.value = false
  addForm.value = {
    email: '',
    displayName: '',
    role: 'user'
  }
}

// Show edit user dialog
const showEditDialog = (user) => {
  editDialogVisible.value = true
  editForm.value = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    role: user.role
  }
  // Clear validation results
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

// Handle edit user
const handleEditUser = async () => {
  try {
    // 表单验证
    const valid = await editFormRef.value.validate()
    if (!valid) return

    editLoading.value = true
    
    // Update user
    await updateUser(editForm.value.uid, {
      displayName: editForm.value.displayName || null,
      role: editForm.value.role
    })
    
    // Update local data
    const userIndex = users.value.findIndex(u => u.uid === editForm.value.uid)
    if (userIndex !== -1) {
      users.value[userIndex].displayName = editForm.value.displayName || null
      users.value[userIndex].role = editForm.value.role
    }
    
    // Update statistics
    await updateUserStats()
    
    ElMessage.success('User information updated successfully')
    
    // 关闭对话框
    editDialogVisible.value = false
  } catch (error) {
    console.error('Failed to update user:', error)
    ElMessage.error(error.message || 'Failed to update user')
  } finally {
    editLoading.value = false
  }
}

// Handle edit dialog close
const handleEditDialogClose = () => {
  editDialogVisible.value = false
  editForm.value = {
    uid: '',
    email: '',
    displayName: '',
    role: 'user'
  }
}

// Batch set role
const batchSetRole = async (role) => {
  try {
    if (selectedUsers.value.length === 0) {
      ElMessage.warning('Please select users to operate on')
      return
    }

    const userIds = selectedUsers.value.map(user => user.uid)
    const roleText = role === 'admin' ? 'administrators' : 'regular users'
    
    await ElMessageBox.confirm(
      `Are you sure you want to set the selected ${selectedUsers.value.length} users as ${roleText}?`,
      'Batch Operation Confirmation',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await batchUpdateUserRole(userIds, role)
    
    // Update local data
    selectedUsers.value.forEach(selectedUser => {
      const userIndex = users.value.findIndex(u => u.uid === selectedUser.uid)
      if (userIndex !== -1) {
        users.value[userIndex].role = role
      }
    })
    
    // Update statistics
    await updateUserStats()
    
    // Clear selection
    selectedUsers.value = []
    
    ElMessage.success(`Successfully set ${userIds.length} users as ${roleText}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch role update failed:', error)
      ElMessage.error(error.message || 'Batch role update failed')
    }
  }
}

// Batch delete users
const batchDeleteUsers = async () => {
  try {
    if (selectedUsers.value.length === 0) {
      ElMessage.warning('Please select users to delete')
      return
    }

    // Check if current user is included
    const currentUserId = authStore.currentUser?.uid
    const hasCurrentUser = selectedUsers.value.some(user => user.uid === currentUserId)
    
    if (hasCurrentUser) {
      ElMessage.error('Cannot delete current logged-in user')
      return
    }
    
    await ElMessageBox.confirm(
      `Are you sure you want to delete the selected ${selectedUsers.value.length} users? This operation cannot be undone!`,
      'Dangerous Operation',
      {
        confirmButtonText: 'Confirm Delete',
        cancelButtonText: 'Cancel',
        type: 'error',
      }
    )

    // Delete users one by one
    const deletePromises = selectedUsers.value.map(user => deleteUserService(user.uid))
    await Promise.all(deletePromises)
    
    // Remove from local data
    const deletedUserIds = selectedUsers.value.map(user => user.uid)
    users.value = users.value.filter(user => !deletedUserIds.includes(user.uid))
    
    // Update statistics
    await updateUserStats()
    
    // Clear selection
    selectedUsers.value = []
    
    ElMessage.success(`Successfully deleted ${deletedUserIds.length} users`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete users failed:', error)
      ElMessage.error(error.message || 'Batch delete users failed')
    }
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return 'Unknown'
  if (date.toDate) {
    // Firestore Timestamp
    return date.toDate().toLocaleString('zh-CN')
  }
  return new Date(date).toLocaleString('zh-CN')
}

// Navigate to recipe management page
const navigateToRecipeManagement = () => {
  router.push('/admin/recipes')
}

// Navigate to user management page
const navigateToUserManagement = () => {
  router.push('/admin/users')
}

// Navigate to macro articles management page
const navigateToMacroManagement = () => {
  // TODO: 实现宏营养文章管理页面路由
  ElMessage.info('Macro Articles Management page is under development')
}

// Navigate to vitamin articles management page
const navigateToVitaminManagement = () => {
  // TODO: 实现维生素文章管理页面路由
  ElMessage.info('Vitamin Articles Management page is under development')
}

// Navigate to events management page
const navigateToEvents = () => {
  router.push('/admin/events')
}

// Handle logout
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to logout?',
      'Confirm Logout',
      {
        confirmButtonText: 'Logout',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await authStore.logout()
    ElMessage.success('Logout successful')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Logout error:', error)
      ElMessage.error('Logout failed')
    }
  }
}

// Get data when component is mounted
onMounted(() => {
  // Default to dashboard, get user data for statistics
  fetchUsers()
  initCharts()
  loadEventsForCharts().then(refreshCharts)
})

onBeforeUnmount(() => {
  disposeCharts()
})

// --- Charts (ECharts via CDN) ---
const chartUsersRef = ref(null)
const chartEventTypeRef = ref(null)
const chartTopEventsRef = ref(null)
let chartUsers, chartEventType, chartTopEvents

async function ensureEcharts() {
  if (window.echarts) return window.echarts
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
  return window.echarts
}

async function initCharts() {
  try {
    const echarts = await ensureEcharts()
    await nextTick()
    if (chartUsersRef.value && !chartUsers) chartUsers = echarts.init(chartUsersRef.value)
    if (chartEventTypeRef.value && !chartEventType) chartEventType = echarts.init(chartEventTypeRef.value)
    if (chartTopEventsRef.value && !chartTopEvents) chartTopEvents = echarts.init(chartTopEventsRef.value)
    await refreshCharts()
    window.addEventListener('resize', handleResize)
  } catch (_) {}
}

function disposeCharts() {
  try { chartUsers?.dispose() } catch (_) {}
  try { chartEventType?.dispose() } catch (_) {}
  try { chartTopEvents?.dispose() } catch (_) {}
  chartUsers = chartEventType = chartTopEvents = null
  window.removeEventListener('resize', handleResize)
}

function handleResize() {
  try { chartUsers?.resize() } catch (_) {}
  try { chartEventType?.resize() } catch (_) {}
  try { chartTopEvents?.resize() } catch (_) {}
}

async function refreshCharts() {
  // Build data from current state (users + events)
  const registrations = buildUserRegistrationsSeries(users.value)
  const typeDist = buildEventTypeDistribution()
  const topEvents = buildTopEventsByBookings()

  chartUsers?.setOption({
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: registrations.labels },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: registrations.values, areaStyle: {} }],
    tooltip: { trigger: 'axis' }
  })

  chartEventType?.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: '65%',
      data: typeDist.map(([name, value]) => ({ name, value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } }
    }]
  })

  chartTopEvents?.setOption({
    grid: { left: 120, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: topEvents.map(e => e.name) },
    series: [{ type: 'bar', data: topEvents.map(e => e.count) }],
    tooltip: { trigger: 'axis' }
  })
}

function formatDateYMD(d) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

function buildUserRegistrationsSeries(allUsers) {
  const today = new Date()
  const dates = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    dates.push(formatDateYMD(d))
  }
  const counts = Object.fromEntries(dates.map(d => [d, 0]))
  for (const u of allUsers || []) {
    const created = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null)
    if (!created || isNaN(created)) continue
    const key = formatDateYMD(created)
    if (counts[key] !== undefined) counts[key]++
  }
  return { labels: dates, values: dates.map(d => counts[d] || 0) }
}

function buildEventTypeDistribution() {
  const groups = {}
  for (const e of users.value?.length >= 0 ? eventsForCharts.value : []) {
    const key = e.type || 'Unknown'
    groups[key] = (groups[key] || 0) + 1
  }
  return Object.entries(groups)
}

// Prepare events data from AdminEvents route state when loaded, fallback to service if needed
import { listApprovedEvents } from '../services/eventsService'
const eventsForCharts = ref([])

async function loadEventsForCharts() {
  try {
    eventsForCharts.value = await listApprovedEvents()
  } catch (_) {
    eventsForCharts.value = []
  }
}

function buildTopEventsByBookings() {
  const rows = (eventsForCharts.value || []).map(e => ({ name: e.name || e.title || e.id, count: e.bookingsCount || 0 }))
  rows.sort((a,b) => b.count - a.count)
  return rows.slice(0, 10)
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh; /* 占满整个屏幕高度 */
  background-color: #f5f5f5;
  position: fixed; /* 固定定位，确保占满整个屏幕 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}

/* 左侧导航栏 */
.admin-sidebar {
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  text-align: center;
}

.sidebar-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  background-color: transparent;
  flex: 1; /* 填充剩余空间 */
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 6px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f0f9ff;
  color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: white;
}

/* 侧边栏底部退出按钮 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  margin-top: auto; /* 推到底部 */
}

.sidebar-footer .el-button {
  height: 45px;
  font-size: 14px;
  font-weight: 500;
}

/* 右侧内容区域 */
.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-width: 0; /* 确保内容区域可以收缩 */
}

.content-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 40px); /* 调整高度计算以适应全屏布局 */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e6e6e6;
}

.content-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

/* 仪表盘样式 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 24px;
}

.stats-card {
  position: relative;
  overflow: hidden;
}

.stats-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.stats-icon {
  font-size: 40px;
  color: #409eff;
  opacity: 0.3;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 24px 24px 24px;
}

.chart-card .el-card__body { padding: 12px; }
.chart-title { font-size: 14px; color: #666; margin: 4px 8px 8px; }
.chart-box { width: 100%; height: 280px; }

/* 表格样式 */
.el-table {
  margin: 24px;
  border-radius: 6px;
  overflow: hidden;
}

/* 搜索和筛选样式 */
.search-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

/* 用户统计样式 */
.user-stats {
  padding: 20px 24px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #f9f9f9;
}

.user-stats .stat-item {
  text-align: center;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-stats .stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.user-stats .stat-label {
  font-size: 12px;
  color: #666;
}

/* 头部操作按钮 */
.header-actions {
  display: flex;
  gap: 10px;
}

/* 批量操作样式 */
.batch-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #f5f7fa;
  border-top: 1px solid #e6e6e6;
  margin-top: 20px;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    height: 100vh; /* 移动端也保持全屏高度 */
  }
  
  .admin-sidebar {
    width: 100%;
    height: auto;
    max-height: 180px; /* 增加高度以容纳退出按钮 */
    flex-direction: row; /* 移动端改为水平布局 */
  }
  
  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    flex: 1;
  }
  
  .sidebar-footer {
    padding: 10px;
    min-width: 80px;
    border-top: none;
    border-left: 1px solid #e6e6e6;
  }
  
  .sidebar-footer .el-button {
    height: 40px;
    width: 100%;
  }
  
  .sidebar-menu .el-menu-item {
    white-space: nowrap;
    flex-shrink: 0;
    margin: 4px;
  }
  
  .admin-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px; /* 移动端减少内边距 */
  }
  
  .content-section {
    min-height: calc(100vh - 200px); /* 适应移动端布局（考虑增加的侧边栏高度）*/
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .el-table {
    margin: 12px;
  }
}
</style>