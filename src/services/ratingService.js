// 精简版Firebase评分服务
import { firestore } from '../firebase.js'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'

// 集合引用
const RATINGS_COLLECTION = 'ratings'
const RECIPES_COLLECTION = 'recipe'

/**
 * 获取菜谱的Firestore文档引用
 * @param {string|number} recipeId - 菜谱ID（数字ID或文档ID）
 * @returns {Promise<DocumentReference|null>} 文档引用或null
 */
const getRecipeDocRef = async (recipeId) => {
  try {
    // 首先尝试作为文档ID直接获取
    const directRef = doc(firestore, RECIPES_COLLECTION, String(recipeId))
    const directSnap = await getDoc(directRef)
    
    if (directSnap.exists()) {
      return directRef
    }
    
    // 如果直接获取失败，通过数字ID查询
    const q = query(
      collection(firestore, RECIPES_COLLECTION),
      where('id', '==', parseInt(recipeId) || String(recipeId)),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].ref
    }
    
    return null
  } catch (error) {
    console.error('Error getting recipe doc ref:', error)
    return null
  }
}

/**
 * 提交或更新用户评分（使用事务确保数据一致性）
 * @param {string|number} recipeId - 菜谱ID
 * @param {string} userId - 用户ID
 * @param {number} rating - 评分值 (1-5)
 * @returns {Promise<Object>} 评分结果和更新后的菜谱统计
 */
export const submitRating = async (recipeId, userId, rating) => {
  if (!recipeId || !userId || !rating || rating < 1 || rating > 5) {
    throw new Error('Invalid rating parameters')
  }

  try {
    // 获取正确的菜谱文档引用
    const recipeRef = await getRecipeDocRef(recipeId)
    if (!recipeRef) {
      throw new Error('Recipe not found')
    }
    
    return await runTransaction(firestore, async (transaction) => {
      // 检查用户是否已经评分过这个菜谱
      const existingRatingQuery = query(
        collection(firestore, RATINGS_COLLECTION),
        where('recipeId', '==', String(recipeId)),
        where('userId', '==', userId)
      )
      
      const existingRatingSnapshot = await getDocs(existingRatingQuery)
      const recipeDoc = await transaction.get(recipeRef)

      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found')
      }

      const recipeData = recipeDoc.data()
      const currentRating = recipeData.rating || { average: 0, count: 0 }

      let ratingDoc
      let oldRating = 0

      if (!existingRatingSnapshot.empty) {
        // 更新现有评分
        ratingDoc = existingRatingSnapshot.docs[0]
        oldRating = ratingDoc.data().rating
        
        transaction.update(ratingDoc.ref, {
          rating: rating,
          updatedAt: serverTimestamp()
        })
      } else {
        // 创建新评分
        const newRatingRef = doc(collection(firestore, RATINGS_COLLECTION))
        transaction.set(newRatingRef, {
          recipeId: String(recipeId),
          userId,
          rating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        ratingDoc = { id: newRatingRef.id }
      }

      // 重新计算菜谱评分统计
      const allRatingsQuery = query(
        collection(firestore, RATINGS_COLLECTION),
        where('recipeId', '==', String(recipeId))
      )
      
      const allRatingsSnapshot = await getDocs(allRatingsQuery)
      let totalRating = 0
      let ratingCount = 0

      // 计算所有评分（包括刚提交的）
      allRatingsSnapshot.forEach(doc => {
        const data = doc.data()
        if (doc.id === ratingDoc.id || data.userId === userId) {
          // 使用新的评分值
          totalRating += rating
        } else {
          totalRating += data.rating
        }
        ratingCount++
      })

      // 如果是新评分，需要增加计数
      if (existingRatingSnapshot.empty) {
        ratingCount = currentRating.count + 1
        totalRating = (currentRating.average * currentRating.count) + rating
      } else {
        ratingCount = currentRating.count
        totalRating = (currentRating.average * currentRating.count) - oldRating + rating
      }

      const newAverage = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0

      // 更新菜谱评分统计
      transaction.update(recipeRef, {
        rating: {
          average: newAverage,
          count: ratingCount
        },
        updatedAt: serverTimestamp()
      })

      return {
        success: true,
        ratingId: ratingDoc.id,
        userRating: rating,
        recipeStats: {
          average: newAverage,
          count: ratingCount
        }
      }
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    throw new Error('Failed to submit rating. Please try again.')
  }
}

/**
 * 获取用户对特定菜谱的评分
 * @param {string|number} recipeId - 菜谱ID
 * @param {string} userId - 用户ID
 * @returns {Promise<number|null>} 用户评分或null（如果未找到）
 */
export const getUserRating = async (recipeId, userId) => {
  if (!recipeId || !userId) {
    return null
  }

  try {
    const q = query(
      collection(firestore, RATINGS_COLLECTION),
      where('recipeId', '==', String(recipeId)),
      where('userId', '==', userId),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().rating
    }
    
    return null
  } catch (error) {
    console.error('Error getting user rating:', error)
    return null
  }
}

/**
 * 获取菜谱的所有评分
 * @param {string|number} recipeId - 菜谱ID
 * @param {number} limitCount - 限制返回的评分数量（默认50）
 * @returns {Promise<Array>} 评分数组
 */
export const getRecipeRatings = async (recipeId, limitCount = 50) => {
  if (!recipeId) {
    return []
  }

  try {
    const q = query(
      collection(firestore, RATINGS_COLLECTION),
      where('recipeId', '==', String(recipeId)),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting recipe ratings:', error)
    return []
  }
}