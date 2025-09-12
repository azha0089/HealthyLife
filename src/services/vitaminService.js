// Firebase service for vitamin articles
import { firestore } from '../firebase.js'
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore'

// Collection reference
const COLLECTION_NAME = 'vitaminArticles'

/**
 * Fetch all vitamin articles from Firestore
 * @returns {Promise<Array>} Array of vitamin articles
 */
export const getAllVitaminArticles = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, COLLECTION_NAME))
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error('Error fetching vitamin articles:', error)
    throw new Error('Failed to fetch vitamin articles. Please try again later.')
  }
}

/**
 * Fetch vitamin articles by subcategory (fat-soluble or water-soluble)
 * @param {string} subcategory - The subcategory to filter by ('fat-soluble', 'water-soluble')
 * @returns {Promise<Array>} Array of filtered vitamin articles
 */
export const getVitaminArticlesByCategory = async (subcategory) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('subcategory', '==', subcategory),
      orderBy('importance', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error(`Error fetching ${subcategory} vitamin articles:`, error)
    throw new Error(`Failed to fetch ${subcategory} vitamin articles. Please try again later.`)
  }
}

/**
 * Fetch vitamin articles by specific vitamin type
 * @param {string} vitaminType - The vitamin type to filter by ('vitamin-c', 'vitamin-d', etc.)
 * @returns {Promise<Array>} Array of filtered vitamin articles
 */
export const getVitaminArticlesByType = async (vitaminType) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('vitaminType', '==', vitaminType),
      orderBy('importance', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error(`Error fetching ${vitaminType} articles:`, error)
    throw new Error(`Failed to fetch ${vitaminType} articles. Please try again later.`)
  }
}

/**
 * Fetch a single vitamin article by ID (searches by data.id field, not document ID)
 * @param {string|number} id - The article ID
 * @returns {Promise<Object|null>} The article data or null if not found
 */
export const getVitaminArticleById = async (id) => {
  try {
    // Convert id to number for consistent comparison
    const numericId = parseInt(id)
    console.log('🔍 Searching for vitamin article with numeric ID:', numericId)
    
    // Query by the id field in the document data, not the document ID
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('id', '==', numericId)
    )
    const querySnapshot = await getDocs(q)
    console.log('📊 Vitamin query results count:', querySnapshot.docs.length)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        ...data, // This includes the original numeric id field
        firestoreId: doc.id // Keep Firestore document ID separate if needed
      }
    } else {
      console.log('No such vitamin article found!')
      return null
    }
  } catch (error) {
    console.error('Error fetching vitamin article:', error)
    throw new Error('Failed to fetch vitamin article. Please try again later.')
  }
}

/**
 * Fetch popular vitamin articles
 * @param {number} limitCount - Number of articles to fetch (default: 5)
 * @returns {Promise<Array>} Array of popular articles
 */
export const getPopularVitaminArticles = async (limitCount = 5) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      orderBy('importance', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error('Error fetching popular vitamin articles:', error)
    throw new Error('Failed to fetch popular vitamin articles. Please try again later.')
  }
}

/**
 * Search vitamin articles by title or content
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching articles
 */
export const searchVitaminArticles = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that fetches all articles and filters client-side
    // For production, consider using Algolia or another search service
    const allArticles = await getAllVitaminArticles()
    
    const searchTermLower = searchTerm.toLowerCase()
    return allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTermLower) ||
      article.excerpt.toLowerCase().includes(searchTermLower) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTermLower)) ||
      article.vitaminType.toLowerCase().includes(searchTermLower)
    )
  } catch (error) {
    console.error('Error searching vitamin articles:', error)
    throw new Error('Failed to search vitamin articles. Please try again later.')
  }
}

/**
 * Get vitamin articles count by category and type
 * @returns {Promise<Object>} Object with counts for each category and type
 */
export const getVitaminArticlesCounts = async () => {
  try {
    const allArticles = await getAllVitaminArticles()
    
    const counts = {
      all: allArticles.length,
      'fat-soluble': allArticles.filter(article => article.subcategory === 'fat-soluble').length,
      'water-soluble': allArticles.filter(article => article.subcategory === 'water-soluble').length,
      // Specific vitamin types
      'vitamin-a': allArticles.filter(article => article.vitaminType === 'vitamin-a').length,
      'vitamin-d': allArticles.filter(article => article.vitaminType === 'vitamin-d').length,
      'vitamin-e': allArticles.filter(article => article.vitaminType === 'vitamin-e').length,
      'vitamin-k': allArticles.filter(article => article.vitaminType === 'vitamin-k').length,
      'vitamin-c': allArticles.filter(article => article.vitaminType === 'vitamin-c').length,
      'vitamin-b': allArticles.filter(article => article.vitaminType === 'vitamin-b').length,
      'vitamin-b9': allArticles.filter(article => article.vitaminType === 'vitamin-b9').length,
      'vitamin-b12': allArticles.filter(article => article.vitaminType === 'vitamin-b12').length,
      'vitamin-b1': allArticles.filter(article => article.vitaminType === 'vitamin-b1').length
    }
    
    return counts
  } catch (error) {
    console.error('Error getting vitamin article counts:', error)
    throw new Error('Failed to get vitamin article counts.')
  }
}

/**
 * Get related vitamin articles (same subcategory or high importance)
 * @param {Object} article - The current article
 * @param {number} limitCount - Number of related articles to return (default: 3)
 * @returns {Promise<Array>} Array of related articles
 */
export const getRelatedVitaminArticles = async (article, limitCount = 3) => {
  try {
    const allArticles = await getAllVitaminArticles()
    
    // Filter out the current article and sort by relevance
    const relatedArticles = allArticles
      .filter(a => a.id !== article.id)
      .sort((a, b) => {
        // Prioritize same subcategory (fat-soluble vs water-soluble)
        if (a.subcategory === article.subcategory && b.subcategory !== article.subcategory) {
          return -1
        }
        if (b.subcategory === article.subcategory && a.subcategory !== article.subcategory) {
          return 1
        }
        // Then sort by importance
        return b.importance - a.importance
      })
      .slice(0, limitCount)
    
    return relatedArticles
  } catch (error) {
    console.error('Error fetching related vitamin articles:', error)
    throw new Error('Failed to fetch related articles.')
  }
}

/**
 * Sort vitamin articles by different criteria
 * @param {Array} articles - Array of articles to sort
 * @param {string} sortBy - Sort criteria ('date', 'readTime', 'difficulty', 'importance')
 * @returns {Array} Sorted articles array
 */
export const sortVitaminArticles = (articles, sortBy) => {
  const sortedList = [...articles]
  
  switch (sortBy) {
    case 'date':
      return sortedList.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    case 'readTime':
      return sortedList.sort((a, b) => {
        const aTime = parseInt(a.readTime.split(' ')[0])
        const bTime = parseInt(b.readTime.split(' ')[0])
        return aTime - bTime
      })
    case 'difficulty':
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
      return sortedList.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    case 'importance':
      return sortedList.sort((a, b) => b.importance - a.importance)
    case 'title':
      return sortedList.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sortedList
  }
}

/**
 * Filter vitamin articles by multiple criteria
 * @param {Array} articles - Array of articles to filter
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered articles array
 */
export const filterVitaminArticles = (articles, filters = {}) => {
  let filtered = [...articles]
  
  if (filters.subcategory && filters.subcategory !== 'all') {
    filtered = filtered.filter(article => article.subcategory === filters.subcategory)
  }
  
  if (filters.vitaminType) {
    filtered = filtered.filter(article => article.vitaminType === filters.vitaminType)
  }
  
  if (filters.difficulty) {
    filtered = filtered.filter(article => article.difficulty === filters.difficulty)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(article => 
      filters.tags.some(tag => article.tags.includes(tag))
    )
  }
  
  if (filters.author) {
    filtered = filtered.filter(article => 
      article.author.toLowerCase().includes(filters.author.toLowerCase())
    )
  }
  
  if (filters.minImportance) {
    filtered = filtered.filter(article => article.importance >= filters.minImportance)
  }
  
  return filtered
}
