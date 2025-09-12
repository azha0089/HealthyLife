// Firebase service for macro articles
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
const COLLECTION_NAME = 'macroArticles'

/**
 * Fetch all macro articles from Firestore
 * @returns {Promise<Array>} Array of macro articles
 */
export const getAllMacroArticles = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, COLLECTION_NAME))
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error('Error fetching macro articles:', error)
    throw new Error('Failed to fetch articles. Please try again later.')
  }
}

/**
 * Fetch macro articles by subcategory
 * @param {string} subcategory - The subcategory to filter by ('protein', 'fats', 'carbs')
 * @returns {Promise<Array>} Array of filtered macro articles
 */
export const getMacroArticlesByCategory = async (subcategory) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('subcategory', '==', subcategory),
      orderBy('publishDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error(`Error fetching ${subcategory} articles:`, error)
    throw new Error(`Failed to fetch ${subcategory} articles. Please try again later.`)
  }
}

/**
 * Fetch a single macro article by ID (searches by data.id field, not document ID)
 * @param {string|number} id - The article ID
 * @returns {Promise<Object|null>} The article data or null if not found
 */
export const getMacroArticleById = async (id) => {
  try {
    // Convert id to number for consistent comparison
    const numericId = parseInt(id)
    console.log('🔍 Searching for article with numeric ID:', numericId)
    
    // Query by the id field in the document data, not the document ID
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('id', '==', numericId)
    )
    const querySnapshot = await getDocs(q)
    console.log('📊 Query results count:', querySnapshot.docs.length)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        ...data, // This includes the original numeric id field
        firestoreId: doc.id // Keep Firestore document ID separate if needed
      }
    } else {
      console.log('No such article found!')
      return null
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    throw new Error('Failed to fetch article. Please try again later.')
  }
}

/**
 * Fetch popular macro articles
 * @param {number} limitCount - Number of articles to fetch (default: 5)
 * @returns {Promise<Array>} Array of popular articles
 */
export const getPopularMacroArticles = async (limitCount = 5) => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      orderBy('popularity', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data(), // This includes the original numeric id field
      firestoreId: doc.id // Keep Firestore document ID separate if needed
    }))
  } catch (error) {
    console.error('Error fetching popular articles:', error)
    throw new Error('Failed to fetch popular articles. Please try again later.')
  }
}

/**
 * Search macro articles by title or content
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching articles
 */
export const searchMacroArticles = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that fetches all articles and filters client-side
    // For production, consider using Algolia or another search service
    const allArticles = await getAllMacroArticles()

    const searchTermLower = searchTerm.toLowerCase()
    return allArticles.filter(article =>
      article.title.toLowerCase().includes(searchTermLower) ||
      article.excerpt.toLowerCase().includes(searchTermLower) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching articles:', error)
    throw new Error('Failed to search articles. Please try again later.')
  }
}

/**
 * Get articles count by category
 * @returns {Promise<Object>} Object with counts for each category
 */
export const getMacroArticlesCounts = async () => {
  try {
    const allArticles = await getAllMacroArticles()

    const counts = {
      all: allArticles.length,
      protein: allArticles.filter(article => article.subcategory === 'protein').length,
      fats: allArticles.filter(article => article.subcategory === 'fats').length,
      carbs: allArticles.filter(article => article.subcategory === 'carbs').length
    }

    return counts
  } catch (error) {
    console.error('Error getting article counts:', error)
    throw new Error('Failed to get article counts.')
  }
}
