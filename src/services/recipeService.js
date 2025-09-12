// Firebase service for recipes
import { firestore } from '../firebase.js'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore'

// Collection reference
const COLLECTION_NAME = 'recipe'

/**
 * Fetch all recipes from Firestore
 * @param {number} limitCount - Limit the number of recipes returned (optional)
 * @returns {Promise<Array>} Array of recipes
 */
export const getAllRecipes = async (limitCount = 100) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      orderBy('id', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // Firestore document ID
      id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
    }))
  } catch (error) {
    console.error('Error fetching recipes:', error)
    throw new Error('Failed to fetch recipes. Please try again later.')
  }
}

/**
 * Fetch recipes by category
 * @param {string} category - The recipe category ('breakfast', 'lunch', 'dinner', 'dessert')
 * @returns {Promise<Array>} Array of filtered recipes
 */
export const getRecipesByCategory = async (category) => {
  try {
    // Solution A: First get all recipes of this category, then sort on client side
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('category', '==', category)
    )
    const querySnapshot = await getDocs(q)
    const recipes = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // Firestore document ID
      id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
    }))
    
    // Sort by ID descending on client side
    return recipes.sort((a, b) => {
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idB - idA
    })
  } catch (error) {
    console.error(`Error fetching ${category} recipes:`, error)
    
    // If still failing, try query without sorting
    try {
      console.log(`Trying fallback query for ${category} recipes...`)
      const fallbackQ = query(
        collection(firestore, COLLECTION_NAME),
        where('category', '==', category)
      )
      const fallbackSnapshot = await getDocs(fallbackQ)
      return fallbackSnapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id,
        id: doc.data().id || doc.id
      }))
    } catch (fallbackError) {
      console.error(`Fallback query also failed:`, fallbackError)
      throw new Error(`Failed to fetch ${category} recipes. Please try again later.`)
    }
  }
}

/**
 * Fetch a single recipe by ID
 * @param {string|number} id - The recipe ID (can be numeric ID or Firestore document ID)
 * @returns {Promise<Object|null>} The recipe data or null if not found
 */
export const getRecipeById = async (id) => {
  try {
    console.log('getRecipeById: Searching for recipe with ID:', id)
    
    // First, try to get the recipe by document ID (assuming id is a Firestore document ID)
    let docRef = doc(firestore, COLLECTION_NAME, String(id))
    let docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      console.log('getRecipeById: Found recipe by document ID')
      return {
        ...docSnap.data(),
        docId: docSnap.id, // Firestore document ID
        id: docSnap.data().id || docSnap.id // Recipe ID (numeric) or fallback to docId
      }
    }
    
    // If not found by document ID, search by numeric ID field
    console.log('getRecipeById: Not found by document ID, searching by numeric ID field')
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('id', '==', parseInt(id) || String(id)),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      console.log('getRecipeById: Found recipe by numeric ID field')
      return {
        ...doc.data(),
        docId: doc.id, // Firestore document ID
        id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
      }
    }
    
    console.log('getRecipeById: No recipe found with ID:', id)
    return null
  } catch (error) {
    console.error('Error fetching recipe:', error)
    throw new Error('Failed to fetch recipe. Please try again later.')
  }
}

/**
 * Fetch popular recipes
 * @param {number} limitCount - Number of recipes to fetch (default: 5)
 * @returns {Promise<Array>} Array of popular recipes
 */
export const getPopularRecipes = async (limitCount = 5) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      orderBy('rating.average', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // Firestore document ID
      id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
    }))
  } catch (error) {
    console.error('Error fetching popular recipes:', error)
    throw new Error('Failed to fetch popular recipes. Please try again later.')
  }
}

/**
 * Fetch related recipes
 * @param {Object} recipe - The current recipe object
 * @param {number} limitCount - Number of recipes to fetch (default: 3)
 * @returns {Promise<Array>} Array of related recipes
 */
export const getRelatedRecipes = async (recipe, limitCount = 3) => {
  try {
    // Find related recipes by same category or tags
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('category', '==', recipe.category),
      where('id', '!=', recipe.id),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // Firestore document ID
      id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
    }))
  } catch (error) {
    console.error('Error fetching related recipes:', error)
    throw new Error('Failed to fetch related recipes. Please try again later.')
  }
}

/**
 * Search recipes by title, description, ingredients, or tags
 * @param {Array} recipes - Array of recipes to search through
 * @param {string} searchTerm - The search term
 * @returns {Array} Array of matching recipes
 */
export const searchRecipes = (recipes, searchTerm) => {
  if (!searchTerm) return recipes
  
  const searchTermLower = searchTerm.toLowerCase()
  return recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTermLower) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTermLower)) ||
    recipe.ingredients.some(ingredient => 
      ingredient.name.toLowerCase().includes(searchTermLower)
    ) ||
    recipe.tags.some(tag => 
      tag.toLowerCase().includes(searchTermLower)
    )
  )
}

/**
 * Filter recipes based on criteria
 * @param {Array} recipes - Array of recipes to filter
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered recipes array
 */
export const filterRecipes = (recipes, filters) => {
  return recipes.filter(recipe => {
    // Budget filter
    if (filters.budget.length > 0 && !filters.budget.includes(recipe.budget)) {
      return false
    }
    
    // Time filter
    if (filters.time.length > 0) {
      const timeMatch = filters.time.some(timeFilter => {
        if (timeFilter === 'under30' && recipe.totalTime <= 30) return true
        if (timeFilter === '30to60' && recipe.totalTime > 30 && recipe.totalTime <= 60) return true
        if (timeFilter === 'over60' && recipe.totalTime > 60) return true
        return false
      })
      if (!timeMatch) return false
    }
    
    // Calories filter
    if (filters.calories.length > 0) {
      const calorieMatch = filters.calories.some(calorieFilter => {
        if (calorieFilter === 'under300' && recipe.calories <= 300) return true
        if (calorieFilter === '300to600' && recipe.calories > 300 && recipe.calories <= 600) return true
        if (calorieFilter === 'over600' && recipe.calories > 600) return true
        return false
      })
      if (!calorieMatch) return false
    }
    
    // Difficulty filter
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(recipe.difficulty)) {
      return false
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasAllTags = filters.tags.every(tag => recipe.tags.includes(tag))
      if (!hasAllTags) return false
    }
    
    return true
  })
}

/**
 * Get recipe counts by category
 * @returns {Promise<Object>} Object with counts for each category
 */
export const getRecipesCounts = async () => {
  try {
    const allRecipes = await getAllRecipes()
    
    const counts = {
      all: allRecipes.length,
      breakfast: allRecipes.filter(recipe => recipe.category === 'breakfast').length,
      lunch: allRecipes.filter(recipe => recipe.category === 'lunch').length,
      vegan: allRecipes.filter(recipe => recipe.category === 'vegan').length,

    }
    
    return counts
  } catch (error) {
    console.error('Error getting recipe counts:', error)
    throw new Error('Failed to get recipe counts.')
  }
}

/**
 * Get paginated recipes
 * @param {number} pageSize - Number of recipes per page
 * @param {Object} lastVisible - Last document from previous batch
 * @returns {Promise<Object>} Object containing recipes and last visible document
 */
export const getPaginatedRecipes = async (pageSize = 10, lastVisible = null) => {
  try {
    let q
    
    if (lastVisible) {
      q = query(
        collection(firestore, COLLECTION_NAME),
        orderBy('id', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      )
    } else {
      q = query(
        collection(firestore, COLLECTION_NAME),
        orderBy('id', 'desc'),
        limit(pageSize)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    
    const recipes = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // Firestore document ID
      id: doc.data().id || doc.id // Recipe ID (numeric) or fallback to docId
    }))
    
    return {
      recipes,
      lastVisible: lastVisibleDoc
    }
  } catch (error) {
    console.error('Error fetching paginated recipes:', error)
    throw new Error('Failed to fetch more recipes. Please try again later.')
  }
}

// Export filter options
export const filterOptions = {
  budget: [
    { value: 'low', label: 'Budget-friendly ($)', color: '#52c41a' },
    { value: 'medium', label: 'Moderate ($$)', color: '#faad14' },
    { value: 'high', label: 'Gourmet ($$$)', color: '#f5222d' }
  ],
  time: [
    { value: 'under30', label: 'Under 30 minutes' },
    { value: '30to60', label: '30-60 minutes' },
    { value: 'over60', label: 'Over 60 minutes' }
  ],
  calories: [
    { value: 'under300', label: 'Low calorie (<300)' },
    { value: '300to600', label: 'Medium calorie (300-600)' },
    { value: 'over600', label: 'High calorie (>600)' }
  ],
  difficulty: [
    { value: 'easy', label: 'Easy', color: '#52c41a' },
    { value: 'medium', label: 'Medium', color: '#faad14' },
    { value: 'hard', label: 'Hard', color: '#f5222d' }
  ]
}

// Popular tags
export const popularTags = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'high-protein',
  'quick',
  'protein-rich',
  'healthy-fats',
  'meal-prep',
  'family-friendly',
  'budget-friendly'
]

/**
 * Add a new recipe to Firestore
 * @param {Object} recipeData - The recipe data to add
 * @returns {Promise<string>} The ID of the created recipe
 */
export const addRecipe = async (recipeData) => {
  try {
    // Generate a numeric ID for the recipe
    const allRecipes = await getAllRecipes(1)
    const maxId = allRecipes.length > 0 ? Math.max(...allRecipes.map(r => parseInt(r.data?.id || 0))) : 0
    const newId = maxId + 1

    // Prepare recipe data with proper structure
    const recipeToAdd = {
      ...recipeData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure rating structure exists
      rating: recipeData.rating || { average: 0, count: 0 },
      // Ensure arrays exist
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      tags: recipeData.tags || [],
      tips: recipeData.tips || [],
      // Ensure nutrition object exists
      nutrition: recipeData.nutrition || {
        calories: recipeData.calories || 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      }
    }

    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), recipeToAdd)
    console.log('Recipe added with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error adding recipe:', error)
    throw new Error('Failed to add recipe. Please try again later.')
  }
}

/**
 * Update an existing recipe in Firestore
 * @param {string} recipeId - The Firestore document ID of the recipe
 * @param {Object} recipeData - The updated recipe data
 * @returns {Promise<void>}
 */
export const updateRecipe = async (recipeId, recipeData) => {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, recipeId)
    
    // Prepare updated data
    const updateData = {
      ...recipeData,
      updatedAt: new Date(),
      // Ensure rating structure exists
      rating: recipeData.rating || { average: 0, count: 0 },
      // Ensure arrays exist
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      tags: recipeData.tags || [],
      tips: recipeData.tips || [],
      // Ensure nutrition object exists
      nutrition: recipeData.nutrition || {
        calories: recipeData.calories || 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      }
    }

    await updateDoc(docRef, updateData)
    console.log('Recipe updated successfully')
  } catch (error) {
    console.error('Error updating recipe:', error)
    throw new Error('Failed to update recipe. Please try again later.')
  }
}

/**
 * Delete a recipe from Firestore
 * @param {string} recipeId - The Firestore document ID of the recipe
 * @returns {Promise<void>}
 */
export const deleteRecipe = async (recipeId) => {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, recipeId)
    await deleteDoc(docRef)
    console.log('Recipe deleted successfully')
  } catch (error) {
    console.error('Error deleting recipe:', error)
    throw new Error('Failed to delete recipe. Please try again later.')
  }
}

/**
 * Batch delete multiple recipes
 * @param {Array<string>} recipeIds - Array of Firestore document IDs
 * @returns {Promise<void>}
 */
export const batchDeleteRecipes = async (recipeIds) => {
  try {
    const batch = writeBatch(firestore)
    
    recipeIds.forEach(recipeId => {
      const docRef = doc(firestore, COLLECTION_NAME, recipeId)
      batch.delete(docRef)
    })
    
    await batch.commit()
    console.log('Batch delete completed successfully')
  } catch (error) {
    console.error('Error batch deleting recipes:', error)
    throw new Error('Failed to delete recipes. Please try again later.')
  }
}