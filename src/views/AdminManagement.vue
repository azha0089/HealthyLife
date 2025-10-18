<template>
  <div class="admin-management">
    <div class="page-header">
      <div class="header-left">
        <h2>Admin Management</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">Admin</el-breadcrumb-item>
          <el-breadcrumb-item>Admin Management</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          Add Admin
        </el-button>
        <el-button type="primary" @click="fetchAdmins">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </div>

    <el-alert
      title="Only super admin (admin@admin.com) can access this page"
      type="warning"
      show-icon
      class="mb16"
    />

    <el-card class="table-card">
      <el-table :data="admins" :loading="loading" stripe style="width:100%">
        <el-table-column type="index" width="60" />
        <el-table-column prop="email" label="Email" min-width="220" />
        <el-table-column prop="displayName" label="Display Name" min-width="160">
          <template #default="{ row }">{{ row.displayName || 'Not Set' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="Updated" width="180">
          <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)" :disabled="row.email?.toLowerCase()===SUPER_ADMIN_EMAIL">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="Add Admin" width="500px">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="110px">
        <el-form-item label="Email" prop="email">
          <el-input v-model="addForm.email" placeholder="admin email" />
        </el-form-item>
        <el-form-item label="Display Name">
          <el-input v-model="addForm.displayName" placeholder="optional" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible=false">Cancel</el-button>
          <el-button type="primary" :loading="addLoading" @click="handleAdd">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="Edit Admin" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="110px">
        <el-form-item label="Email">
          <el-input :value="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="Display Name">
          <el-input v-model="editForm.displayName" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible=false">Cancel</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleEdit">Save</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { SUPER_ADMIN_EMAIL } from '../stores/auth.js'
import { getUsersByRole, updateUser, deleteUser as deleteUserService, createUser } from '../services/userService.js'

const admins = ref([])
const loading = ref(false)

const addDialogVisible = ref(false)
const addFormRef = ref()
const addLoading = ref(false)
const addForm = ref({ email: '', displayName: '' })

const editDialogVisible = ref(false)
const editFormRef = ref()
const editLoading = ref(false)
const editForm = ref({ uid: '', email: '', displayName: '' })

const addFormRules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur','change'] }
  ]
}
const editFormRules = {}

const fetchAdmins = async () => {
  try {
    loading.value = true
    admins.value = await getUsersByRole('admin')
  } catch (e) {
    ElMessage.error('Failed to load admins')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  addDialogVisible.value = true
  addForm.value = { email: '', displayName: '' }
  nextTick(()=>addFormRef.value?.clearValidate?.())
}

const handleAdd = async () => {
  try {
    const valid = await addFormRef.value.validate()
    if (!valid) return
    addLoading.value = true
    // 创建为 admin 角色
    await createUser({ email: addForm.value.email, displayName: addForm.value.displayName, role: 'admin' })
    ElMessage.success('Admin created')
    addDialogVisible.value = false
    fetchAdmins()
  } catch (e) {
    if (e?.message) ElMessage.error(e.message); else ElMessage.error('Failed to create admin')
  } finally {
    addLoading.value = false
  }
}

const showEditDialog = (row) => {
  editDialogVisible.value = true
  editForm.value = { uid: row.uid, email: row.email, displayName: row.displayName || '' }
  nextTick(()=>editFormRef.value?.clearValidate?.())
}

const handleEdit = async () => {
  try {
    editLoading.value = true
    await updateUser(editForm.value.uid, { displayName: editForm.value.displayName })
    ElMessage.success('Updated')
    editDialogVisible.value = false
    fetchAdmins()
  } catch (e) {
    ElMessage.error(e?.message || 'Failed to update')
  } finally {
    editLoading.value = false
  }
}

const confirmDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`Delete admin ${row.email}?`, 'Confirm', { type: 'warning' })
    await deleteUserService(row.uid)
    ElMessage.success('Deleted')
    fetchAdmins()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e?.message || 'Failed to delete')
  }
}

function formatDate(date) {
  if (!date) return '—'
  if (date.toDate) return date.toDate().toLocaleString('en-US')
  const d = new Date(date); return isNaN(d) ? '—' : d.toLocaleString('en-US')
}

onMounted(fetchAdmins)
</script>

<style scoped>
.admin-management{ padding:24px; }
.page-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.header-actions{ display:flex; gap:12px; }
.mb16{ margin-bottom:16px; }
.table-card{ margin-top:12px; }
.dialog-footer{ display:flex; justify-content:flex-end; gap:10px; }
</style>
