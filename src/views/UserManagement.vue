<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-left">
        <h2>User Management</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">Admin</el-breadcrumb-item>
          <el-breadcrumb-item>User Management</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          Add User
        </el-button>
        <el-button type="primary" @click="refreshUsers">
          <el-icon><Refresh /></el-icon>
          Refresh Data
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-input
            v-model="searchQuery"
            placeholder="Search email or display name"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
<!--        <el-col :xs="24" :sm="12" :md="8" :lg="6">-->
<!--          <el-select v-model="filterRole" placeholder="Filter by role" clearable @change="handleRoleFilter" style="width: 100%">-->
<!--            <el-option label="All" value="" />-->
<!--            <el-option label="admin" value="admin" />-->
<!--            <el-option label="user" value="user" />-->
<!--          </el-select>-->
<!--        </el-col>-->
      </el-row>
    </div>

    <!-- 用户统计 -->
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.total }}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.admin }}</span>
            <span class="stat-label">Administrators</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.user }}</span>
            <span class="stat-label">Regular Users</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.recentRegistrations }}</span>
            <span class="stat-label">New Users (Last 7 Days)</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户表格 -->
    <el-card class="table-card">
      <el-table
        :data="filteredUsers"
        :loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="email" label="Email" min-width="200" sortable />
        <el-table-column prop="displayName" label="Display Name" width="150">
          <template #default="{ row }">
            {{ row.displayName || 'Not Set' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="Role" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? 'admin' : 'user' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Registration Time" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="Last Updated" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="showEditDialog(row)"
            >
              Edit
            </el-button>

            <el-button
              size="small"
              type="danger"
              @click="confirmDeleteUser(row)"
              :disabled="row.uid === authStore.currentUser?.uid"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 批量操作 -->
    <div v-if="selectedUsers.length > 0" class="batch-actions">
      <el-alert
        :title="`Selected ${selectedUsers.length} users`"
        type="info"
        show-icon
        :closable="false"
      />
      <div class="batch-buttons">
        <el-button size="small" @click="batchSetRole('admin')">
          Batch Set as Admin
        </el-button>
        <el-button size="small" @click="batchSetRole('user')">
          Batch Set as User
        </el-button>
        <el-button size="small" type="danger" @click="batchDeleteUsers">
          Batch Delete
        </el-button>
        <el-button size="small" type="primary" @click="showBulkEmailDialog">
          Bulk Email
        </el-button>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="Add New User"
      width="500px"
      :before-close="handleAddDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="addForm.email"
            placeholder="Please enter user email"
            clearable
          />
        </el-form-item>
        <el-form-item label="Display Name" prop="displayName">
          <el-input
            v-model="addForm.displayName"
            placeholder="Please enter display name (optional)"
            clearable
          />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="addForm.role" placeholder="Please select role">
            <el-option label="user" value="user" />

          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleAddDialogClose">Cancel</el-button>
          <el-button type="primary" @click="handleAddUser" :loading="addLoading">
            Add User
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="Edit User Information"
      width="500px"
      :before-close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="Email">
          <el-input :value="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="Display Name" prop="displayName">
          <el-input
            v-model="editForm.displayName"
            placeholder="Please enter display name"
            clearable
          />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditDialogClose">Cancel</el-button>
          <el-button type="primary" @click="handleEditUser" :loading="editLoading">
            Save Changes
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 群发邮件对话框 -->
    <el-dialog
      v-model="bulkEmailDialogVisible"
      title="Bulk Email"
      width="600px"
    >
      <el-form label-width="90px">
        <el-form-item label="Recipients">
          <el-tag type="info">{{ selectedUsers.length }} selected</el-tag>
        </el-form-item>
        <el-form-item label="Subject">
          <el-input v-model="bulkEmailForm.subject" placeholder="Enter email subject" clearable />
        </el-form-item>
        <el-form-item label="Message">
          <el-input
            v-model="bulkEmailForm.body"
            type="textarea"
            :rows="8"
            placeholder="Enter email content"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bulkEmailDialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="bulkEmailLoading" @click="handleSendBulkEmail">
            Send
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Avatar, UserFilled, Refresh, Plus, Search
} from '@element-plus/icons-vue'
import { useAuthStore, SUPER_ADMIN_EMAIL } from '../stores/auth.js'
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser as deleteUserService,
  getUserStats,
  batchUpdateUserRole
} from '../services/userService.js'
import { sendEmail, buildAuthEmailTemplate } from '../services/emailService.js'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL)
const loading = ref(false)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

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

// Bulk email dialog state
const bulkEmailDialogVisible = ref(false)
const bulkEmailLoading = ref(false)
const bulkEmailForm = ref({ subject: '', body: '' })
const EMAIL_WEBAPP_URL = import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbztBRp0dJbw9DsFNoCL-hkeuypwsBPeVP1K35DYK8ttBTTsCSTHw4Vwa6I1sGw1cvS4Ow/exec'

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

  // Always hide administrators in this view
  result = result.filter(user => user.role !== 'admin')

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user =>
      user.email.toLowerCase().includes(query) ||
      (user.displayName && user.displayName.toLowerCase().includes(query))
    )
  }

  // Calculate total for pagination
  totalUsers.value = result.length

  // Apply pagination
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return result.slice(startIndex, endIndex)
})

// Total users count for pagination
const totalUsers = ref(0)

// Calculate statistics
const calculateStats = () => {
  userStats.value.total = users.value.length
  userStats.value.admin = users.value.filter(user => user.role === 'admin').length
  userStats.value.user = users.value.filter(user => user.role === 'user').length

  // Calculate recent registrations (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  userStats.value.recentRegistrations = users.value.filter(user => {
    if (!user.createdAt) return false
    const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
    return createdDate > oneWeekAgo
  }).length
}

// Get all users
const fetchUsers = async () => {
  try {
    loading.value = true
    users.value = await getAllUsers()

    // Update statistics
    calculateStats()
    totalUsers.value = users.value.length

    console.log('Fetched user list:', users.value)
  } catch (error) {
    console.error('Failed to get users:', error)
    ElMessage.error('Failed to load users')
  } finally {
    loading.value = false
  }
}

// Refresh user data
const refreshUsers = () => {
  fetchUsers()
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1 // Reset pagination when searching
}

// Handle role filter
const handleRoleFilter = () => {
  currentPage.value = 1 // Reset pagination when filtering
}

// Handle pagination
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// Table selection handling
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// Show bulk email dialog
const showBulkEmailDialog = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('Please select users to email')
    return
  }
  bulkEmailForm.value = { subject: '', body: '' }
  bulkEmailDialogVisible.value = true
}

// Send bulk email
const handleSendBulkEmail = async () => {
  try {
    if (!bulkEmailForm.value.subject?.trim() || !bulkEmailForm.value.body?.trim()) {
      ElMessage.warning('Please enter subject and message')
      return
    }
    const recipients = selectedUsers.value.map(u => u.email).filter(e => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(e))
    if (recipients.length === 0) {
      ElMessage.error('No valid recipient emails')
      return
    }
    bulkEmailLoading.value = true
    let success = 0, failed = 0
    // Send one by one for reliability
    for (const email of recipients) {
      const html = buildAuthEmailTemplate({
        title: bulkEmailForm.value.subject,
        greeting: '',
        contentLines: bulkEmailForm.value.body.split(/\n+/)
      })
      const resp = await sendEmail({
        to: email,
        subject: bulkEmailForm.value.subject,
        html,
        webAppUrl: EMAIL_WEBAPP_URL
      })
      if (resp?.success) success++; else failed++
    }
    ElMessage.success(`Emails sent: ${success}, failed: ${failed}`)
    bulkEmailDialogVisible.value = false
  } catch (e) {
    ElMessage.error('Failed to send emails')
  } finally {
    bulkEmailLoading.value = false
  }
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
    calculateStats()

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
    calculateStats()

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
    // Form validation
    const valid = await addFormRef.value.validate()
    if (!valid) return

    addLoading.value = true

    // Create user
    await createUser(addForm.value)

    ElMessage.success('User created successfully')

    // Close dialog
    addDialogVisible.value = false

    // Refresh user list
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
    // Form validation
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
    calculateStats()

    ElMessage.success('User information updated successfully')

    // Close dialog
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
    calculateStats()

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
    calculateStats()

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
    return date.toDate().toLocaleString('en-US')
  }
  return new Date(date).toLocaleString('en-US')
}

// Get data when component is mounted
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stats-card {
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.table-card {
  margin-bottom: 24px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 24px;
}

.batch-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    margin-top: 16px;
    width: 100%;
  }

  .search-section .el-col {
    margin-bottom: 16px;
  }
}
</style>
