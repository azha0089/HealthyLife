// Firebase用户管理服务
import { firestore } from '../firebase.js'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore'

// 集合引用
const USERS_COLLECTION = 'users'

/**
 * 获取所有用户
 * @returns {Promise<Array>} 用户列表
 */
export const getAllUsers = async () => {
  try {
    const q = query(
      collection(firestore, USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('获取用户列表失败')
  }
}

/**
 * 根据ID获取单个用户
 * @param {string} userId - 用户ID
 * @returns {Promise<Object|null>} 用户信息
 */
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(firestore, USERS_COLLECTION, userId))
    
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('获取用户信息失败')
  }
}

/**
 * 添加新用户
 * @param {Object} userData - 用户数据
 * @param {string} userData.email - 邮箱
 * @param {string} userData.role - 角色 (user/admin)
 * @param {string} [userData.displayName] - 显示名称
 * @returns {Promise<Object>} 创建结果
 */
export const createUser = async (userData) => {
  try {
    // 验证必填字段
    if (!userData.email || !userData.role) {
      throw new Error('邮箱和角色为必填字段')
    }

    // 验证角色值
    if (!['user', 'admin'].includes(userData.role)) {
      throw new Error('角色只能是 user 或 admin')
    }

    // 检查邮箱是否已存在
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('该邮箱已被注册')
    }

    // 准备用户数据
    const newUser = {
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // 添加到Firestore
    const docRef = await addDoc(collection(firestore, USERS_COLLECTION), newUser)
    
    console.log('User created with ID:', docRef.id)
    
    return {
      success: true,
      uid: docRef.id,
      message: '用户创建成功'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error(error.message || '创建用户失败')
  }
}

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateUser = async (userId, updateData) => {
  try {
    if (!userId) {
      throw new Error('用户ID为必填字段')
    }

    // 过滤掉空值和不允许更新的字段
    const allowedFields = ['displayName', 'role']
    const filteredData = {}
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key]
      }
    })

    // 验证角色值
    if (filteredData.role && !['user', 'admin'].includes(filteredData.role)) {
      throw new Error('角色只能是 user 或 admin')
    }

    // 添加更新时间
    filteredData.updatedAt = serverTimestamp()

    // 更新Firestore文档
    const userRef = doc(firestore, USERS_COLLECTION, userId)
    await updateDoc(userRef, filteredData)
    
    console.log('User updated:', userId)
    
    return {
      success: true,
      message: '用户信息更新成功'
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error(error.message || '更新用户信息失败')
  }
}

/**
 * 删除用户
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('用户ID为必填字段')
    }

    // 删除Firestore文档
    const userRef = doc(firestore, USERS_COLLECTION, userId)
    await deleteDoc(userRef)
    
    console.log('User deleted:', userId)
    
    return {
      success: true,
      message: '用户删除成功'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error(error.message || '删除用户失败')
  }
}

/**
 * 根据邮箱查找用户
 * @param {string} email - 邮箱
 * @returns {Promise<Object|null>} 用户信息
 */
export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(firestore, USERS_COLLECTION),
      where('email', '==', email)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        uid: doc.id,
        ...doc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error finding user by email:', error)
    throw new Error('查找用户失败')
  }
}

/**
 * 根据角色获取用户列表
 * @param {string} role - 角色 (user/admin)
 * @returns {Promise<Array>} 用户列表
 */
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(firestore, USERS_COLLECTION),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw new Error('获取用户列表失败')
  }
}

/**
 * 批量更新用户角色
 * @param {Array<string>} userIds - 用户ID数组
 * @param {string} newRole - 新角色
 * @returns {Promise<Object>} 更新结果
 */
export const batchUpdateUserRole = async (userIds, newRole) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('用户ID数组不能为空')
    }

    if (!['user', 'admin'].includes(newRole)) {
      throw new Error('角色只能是 user 或 admin')
    }

    const updatePromises = userIds.map(userId => 
      updateUser(userId, { role: newRole })
    )

    await Promise.all(updatePromises)
    
    return {
      success: true,
      message: `成功更新 ${userIds.length} 个用户的角色`
    }
  } catch (error) {
    console.error('Error batch updating user roles:', error)
    throw new Error(error.message || '批量更新用户角色失败')
  }
}

/**
 * 获取用户统计信息
 * @returns {Promise<Object>} 统计信息
 */
export const getUserStats = async () => {
  try {
    const allUsers = await getAllUsers()
    
    const stats = {
      total: allUsers.length,
      admin: allUsers.filter(user => user.role === 'admin').length,
      user: allUsers.filter(user => user.role === 'user').length,
      activeToday: 0, // 可以根据需要实现今日活跃用户统计
      recentRegistrations: allUsers.filter(user => {
        if (!user.createdAt) return false
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
        const daysDiff = (new Date() - createdDate) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7 // 最近7天注册的用户
      }).length
    }
    
    return stats
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw new Error('获取用户统计失败')
  }
}
