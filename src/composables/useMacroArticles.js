// Vue composable for macro articles using Firebase
import { ref, computed } from 'vue'
import { 
  getAllMacroArticles, 
  getMacroArticlesByCategory, 
  getMacroArticleById,
  getPopularMacroArticles,
  searchMacroArticles,
  getMacroArticlesCounts
} from '../services/macroService.js'

export function useMacroArticles() {
  // Reactive state
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const counts = ref({
    all: 0,
    protein: 0,
    fats: 0,
    carbs: 0
  })

  // Computed properties for filtering
  const proteinArticles = computed(() => 
    articles.value.filter(article => article.subcategory === 'protein')
  )

  const fatArticles = computed(() => 
    articles.value.filter(article => article.subcategory === 'fats')
  )

  const carbArticles = computed(() => 
    articles.value.filter(article => article.subcategory === 'carbs')
  )

  // Methods
  const fetchAllArticles = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await getAllMacroArticles()
      articles.value = data
      
      // Update counts
      counts.value = {
        all: data.length,
        protein: data.filter(article => article.subcategory === 'protein').length,
        fats: data.filter(article => article.subcategory === 'fats').length,
        carbs: data.filter(article => article.subcategory === 'carbs').length
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchArticlesByCategory = async (subcategory) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await getMacroArticlesByCategory(subcategory)
      return data
    } catch (err) {
      error.value = err.message
      console.error(`Error fetching ${subcategory} articles:`, err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchArticleById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await getMacroArticleById(id)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching article:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchPopularArticles = async (limit = 5) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await getPopularMacroArticles(limit)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching popular articles:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const searchArticles = async (searchTerm) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await searchMacroArticles(searchTerm)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error searching articles:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCounts = async () => {
    try {
      const data = await getMacroArticlesCounts()
      counts.value = data
      return data
    } catch (err) {
      console.error('Error fetching counts:', err)
      return counts.value
    }
  }

  // Sort articles by different criteria
  const sortArticles = (articlesList, sortBy) => {
    const sortedList = [...articlesList]
    
    switch (sortBy) {
      case 'date':
        return sortedList.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      case 'readTime':
        return sortedList.sort((a, b) => {
          const aTime = parseInt(a.readTime.split(' ')[0])
          const bTime = parseInt(b.readTime.split(' ')[0])
          return aTime - bTime
        })
      case 'popularity':
        return sortedList.sort((a, b) => b.popularity - a.popularity)
      case 'title':
        return sortedList.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sortedList
    }
  }

  // Filter articles by multiple criteria
  const filterArticles = (articlesList, filters = {}) => {
    let filtered = [...articlesList]
    
    if (filters.subcategory && filters.subcategory !== 'all') {
      filtered = filtered.filter(article => article.subcategory === filters.subcategory)
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
    
    return filtered
  }

  return {
    // State
    articles,
    loading,
    error,
    counts,
    
    // Computed
    proteinArticles,
    fatArticles,
    carbArticles,
    
    // Methods
    fetchAllArticles,
    fetchArticlesByCategory,
    fetchArticleById,
    fetchPopularArticles,
    searchArticles,
    fetchCounts,
    sortArticles,
    filterArticles
  }
}
