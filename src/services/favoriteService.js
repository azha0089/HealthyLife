// Firebase favorites service
import { firestore } from '../firebase.js'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'

// Collection references
const FAVORITES_COLLECTION = 'favorites'
const RECIPES_COLLECTION = 'recipe'

/**
 * Add recipe to favorites
 * @param {string|number} recipeId - Recipe ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Favorite result
 */
export const addToFavorites = async (recipeId, userId) => {
  if (!recipeId || !userId) {
    throw new Error('Recipe ID and User ID are required')
  }

  try {
    const recipeIdStr = String(recipeId)
    console.log('addToFavorites: Adding favorite for:', { 
      originalRecipeId: recipeId, 
      recipeIdStr, 
      userId 
    })
    
    // Use the passed recipeId directly (usually Firestore document ID)
    console.log('addToFavorites: Using recipe ID as-is:', recipeIdStr)
    
    // Check if already favorited (check current format first, then possible legacy format)
    let existingQuery = query(
      collection(firestore, FAVORITES_COLLECTION),
      where('userId', '==', userId),
      where('recipeId', '==', recipeIdStr)
    )
    
    let existingSnapshot = await getDocs(existingQuery)
    
    // If not found, check for legacy "recipe_" prefix format
    if (existingSnapshot.empty && !recipeIdStr.startsWith('recipe_')) {
      const legacyRecipeId = `recipe_${recipeIdStr}`
      existingQuery = query(
        collection(firestore, FAVORITES_COLLECTION),
        where('userId', '==', userId),
        where('recipeId', '==', legacyRecipeId)
      )
      existingSnapshot = await getDocs(existingQuery)
    }
    
    console.log('addToFavorites: Checking existing favorites:', { 
      recipeId: recipeIdStr,
      docCount: existingSnapshot.docs.length,
      docs: existingSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    })
    
    if (!existingSnapshot.empty) {
      console.error('addToFavorites: Recipe already in favorites')
      throw new Error('Recipe already in favorites')
    }

    // Add to favorites, use the passed recipeId directly
    const docData = {
      userId,
      recipeId: recipeIdStr,
      createdAt: serverTimestamp()
    }
    
    console.log('addToFavorites: Adding document with data:', docData)
    const docRef = await addDoc(collection(firestore, FAVORITES_COLLECTION), docData)

    console.log('addToFavorites: Successfully added to favorites with ID:', docRef.id)
    return {
      success: true,
      favoriteId: docRef.id,
      message: 'Recipe added to favorites successfully'
    }
  } catch (error) {
    console.error('Error adding to favorites:', error)
    throw new Error(error.message || 'Failed to add to favorites')
  }
}

/**
 * Remove recipe from favorites
 * @param {string|number} recipeId - Recipe ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Remove result
 */
export const removeFromFavorites = async (recipeId, userId) => {
  if (!recipeId || !userId) {
    throw new Error('Recipe ID and User ID are required')
  }

  try {
    const recipeIdStr = String(recipeId)
    console.log('removeFromFavorites: Removing favorite for:', { 
      originalRecipeId: recipeId, 
      recipeIdStr, 
      userId 
    })
    
    // First try direct match
    let favoriteQuery = query(
      collection(firestore, FAVORITES_COLLECTION),
      where('userId', '==', userId),
      where('recipeId', '==', recipeIdStr)
    )
    
    let favoriteSnapshot = await getDocs(favoriteQuery)
    
    // If not found, try other possible formats
    if (favoriteSnapshot.empty) {
      console.log('removeFromFavorites: Direct match failed, trying alternative formats')
      
      // Try legacy "recipe_" + id format (backward compatibility)
      const legacyRecipeId = recipeIdStr.startsWith('recipe_') ? recipeIdStr : `recipe_${recipeIdStr}`
      favoriteQuery = query(
        collection(firestore, FAVORITES_COLLECTION),
        where('userId', '==', userId),
        where('recipeId', '==', legacyRecipeId)
      )
      
      favoriteSnapshot = await getDocs(favoriteQuery)
      
      console.log('removeFromFavorites: Legacy format query result:', { 
        legacyRecipeId,
        found: !favoriteSnapshot.empty
      })
    }
    
    console.log('removeFromFavorites: Final query result:', { 
      docCount: favoriteSnapshot.docs.length,
      docs: favoriteSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    })
    
    if (favoriteSnapshot.empty) {
      console.error('removeFromFavorites: Recipe not found in favorites')
      throw new Error('Recipe not found in favorites')
    }

    // Delete favorite record
    const favoriteDoc = favoriteSnapshot.docs[0]
    console.log('removeFromFavorites: Deleting document:', favoriteDoc.id)
    await deleteDoc(favoriteDoc.ref)

    console.log('removeFromFavorites: Successfully removed from favorites')
    return {
      success: true,
      message: 'Recipe removed from favorites successfully'
    }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    throw new Error(error.message || 'Failed to remove from favorites')
  }
}

/**
 * Check if recipe is favorited
 * @param {string|number} recipeId - Recipe ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether it's favorited
 */
export const isFavorited = async (recipeId, userId) => {
  if (!recipeId || !userId) {
    console.log('isFavorited: Missing recipeId or userId', { recipeId, userId })
    return false
  }

  try {
    const recipeIdStr = String(recipeId)
    console.log('isFavorited: Checking favorite status for:', { 
      originalRecipeId: recipeId, 
      recipeIdStr, 
      userId 
    })
    
    // First try direct match
    let favoriteQuery = query(
      collection(firestore, FAVORITES_COLLECTION),
      where('userId', '==', userId),
      where('recipeId', '==', recipeIdStr),
      limit(1)
    )
    
    let favoriteSnapshot = await getDocs(favoriteQuery)
    
    // If not found, try other possible formats
    if (favoriteSnapshot.empty) {
      console.log('isFavorited: Direct match failed, trying alternative formats')
      
      // Try legacy "recipe_" + id format (backward compatibility)
      const legacyRecipeId = recipeIdStr.startsWith('recipe_') ? recipeIdStr : `recipe_${recipeIdStr}`
      favoriteQuery = query(
        collection(firestore, FAVORITES_COLLECTION),
        where('userId', '==', userId),
        where('recipeId', '==', legacyRecipeId),
        limit(1)
      )
      
      favoriteSnapshot = await getDocs(favoriteQuery)
      
      console.log('isFavorited: Legacy format query result:', { 
        legacyRecipeId,
        found: !favoriteSnapshot.empty
      })
    }
    
    const isFav = !favoriteSnapshot.empty
    
    console.log('isFavorited: Final query result:', { 
      isFav, 
      docCount: favoriteSnapshot.docs.length,
      firstDocData: favoriteSnapshot.docs[0]?.data()
    })
    
    return isFav
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
}

/**
 * Get all user's favorite recipes
 * @param {string} userId - User ID
 * @param {number} limitCount - Limit return count
 * @returns {Promise<Array>} List of favorite recipes
 */
export const getUserFavorites = async (userId, limitCount = 50) => {
  if (!userId) {
    return []
  }

  try {
    console.log('getUserFavorites: Fetching favorites for user:', userId)
    
    // Get user's favorite records (temporarily remove orderBy to avoid index error)
    const favoritesQuery = query(
      collection(firestore, FAVORITES_COLLECTION),
      where('userId', '==', userId),
      limit(limitCount)
    )
    
    const favoritesSnapshot = await getDocs(favoritesQuery)
    console.log('getUserFavorites: Found', favoritesSnapshot.docs.length, 'favorite records')
    
    if (favoritesSnapshot.empty) {
      console.log('getUserFavorites: No favorites found')
      return []
    }

    // Get list of favorite recipe IDs
    const recipeIds = favoritesSnapshot.docs.map(doc => doc.data().recipeId)
    console.log('getUserFavorites: Recipe IDs from favorites:', recipeIds)
    
    // Get recipe details
    const recipes = []
    for (const recipeId of recipeIds) {
      try {
        console.log(`getUserFavorites: Fetching recipe with ID ${recipeId}`)
        
        // Use document ID directly to get recipe
        const recipeDocRef = doc(firestore, RECIPES_COLLECTION, recipeId)
        const recipeDocSnap = await getDoc(recipeDocRef)
        
        if (recipeDocSnap.exists()) {
          const recipeData = recipeDocSnap.data()
          console.log(`getUserFavorites: Found recipe:`, recipeData.title)
          
          const favoriteData = favoritesSnapshot.docs.find(
            doc => doc.data().recipeId === recipeId
          ).data()
          
          recipes.push({
            ...recipeData,
            docId: recipeDocSnap.id, // Firestore document ID
            id: recipeData.id || recipeDocSnap.id, // Recipe numeric ID, use document ID if none
            favoriteId: favoritesSnapshot.docs.find(
              doc => doc.data().recipeId === recipeId
            ).id,
            favoritedAt: favoriteData.createdAt
          })
        } else {
          console.warn(`Recipe with ID ${recipeId} not found in Firestore`)
        }
      } catch (error) {
        console.error(`Error fetching recipe ${recipeId}:`, error)
      }
    }

    // Sort by favorite time (newest first)
    recipes.sort((a, b) => {
      if (!a.favoritedAt || !b.favoritedAt) return 0
      const timeA = a.favoritedAt.toMillis ? a.favoritedAt.toMillis() : new Date(a.favoritedAt).getTime()
      const timeB = b.favoritedAt.toMillis ? b.favoritedAt.toMillis() : new Date(b.favoritedAt).getTime()
      return timeB - timeA // Descending order
    })

    console.log('getUserFavorites: Returning', recipes.length, 'favorite recipes')
    return recipes
  } catch (error) {
    console.error('Error getting user favorites:', error)
    return []
  }
}

/**
 * Toggle favorite status (favorite/unfavorite)
 * @param {string|number} recipeId - Recipe ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Operation result
 */
export const toggleFavorite = async (recipeId, userId) => {
  if (!recipeId || !userId) {
    throw new Error('Recipe ID and User ID are required')
  }

  try {
    const isCurrentlyFavorited = await isFavorited(recipeId, userId)
    
    if (isCurrentlyFavorited) {
      const result = await removeFromFavorites(recipeId, userId)
      return {
        ...result,
        isFavorited: false,
        action: 'removed'
      }
    } else {
      const result = await addToFavorites(recipeId, userId)
      return {
        ...result,
        isFavorited: true,
        action: 'added'
      }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    throw error
  }
}
