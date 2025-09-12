<template>
  <div class="macro-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/learn">Learn</router-link>
        <el-icon><ArrowRight /></el-icon>
        <span>Macronutrients</span>
      </div>
      <h1 class="page-title">Macronutrients</h1>
      <p class="page-description">
        Essential nutrients your body needs in large amounts: proteins, fats, and carbohydrates
      </p>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Filter by Category</h3>
        <el-button 
          type="text" 
          @click="clearFilters"
          v-if="activeFilter !== 'all'"
        >
          Clear Filters
        </el-button>
      </div>
      
      <div class="filter-tabs">
        <div 
          class="filter-tab"
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          <el-icon><List /></el-icon>
          <span>All Macros</span>
          <div class="count">{{ counts.all }}</div>
        </div>
        
        <div 
          class="filter-tab"
          :class="{ active: activeFilter === 'protein' }"
          @click="setFilter('protein')"
        >
          <el-icon><Trophy /></el-icon>
          <span>Protein</span>
          <div class="count">{{ counts.protein }}</div>
        </div>
        
        <div 
          class="filter-tab"
          :class="{ active: activeFilter === 'fats' }"
          @click="setFilter('fats')"
        >
          <el-icon><Star /></el-icon>
          <span>Fats</span>
          <div class="count">{{ counts.fats }}</div>
        </div>
        
        <div 
          class="filter-tab"
          :class="{ active: activeFilter === 'carbs' }"
          @click="setFilter('carbs')"
        >
          <el-icon><Lightning /></el-icon>
          <span>Carbohydrates</span>
          <div class="count">{{ counts.carbs }}</div>
        </div>
      </div>
    </div>

    <!-- Articles Grid -->
    <div class="articles-section">
      <div class="articles-header">
        <h2>{{ getFilterTitle() }}</h2>
        <div class="sort-options">
          <el-select v-model="sortBy" placeholder="Sort by" size="small">
            <el-option label="Latest" value="date" />
            <el-option label="Reading Time" value="readTime" />
            <el-option label="Popularity" value="popularity" />
          </el-select>
        </div>
      </div>
      
      <!-- Loading State -->
      <div class="loading-state" v-if="loading">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>
      
      <!-- Articles Grid -->
      <div class="articles-grid" v-else-if="filteredArticles.length > 0">
        <article-card
          v-for="article in sortedArticles"
          :key="article.id"
          :article="article"
          @click="navigateToArticle(article)"
        />
      </div>
      
      <!-- Empty State -->
      <div class="empty-state" v-else>
        <el-icon size="64" color="#d9d9d9"><Document /></el-icon>
        <h3>No articles found</h3>
        <p v-if="error">{{ error }}</p>
        <p v-else>Try adjusting your filters or check back later for new content.</p>
        <el-button 
          v-if="error" 
          type="primary" 
          @click="loadArticles"
          :loading="loading"
        >
          Retry
        </el-button>
      </div>
    </div>

    <!-- Quick Facts Section -->
    <div class="quick-facts-section">
      <h2 class="section-title">Quick Facts</h2>
      <div class="facts-grid">
        <div class="fact-card protein">
          <h3>Protein</h3>
          <div class="fact-content">
            <div class="fact-number">4</div>
            <div class="fact-label">calories per gram</div>
          </div>
          <p>Essential for muscle repair and growth</p>
        </div>
        
        <div class="fact-card fats">
          <h3>Fats</h3>
          <div class="fact-content">
            <div class="fact-number">9</div>
            <div class="fact-label">calories per gram</div>
          </div>
          <p>Important for hormone production</p>
        </div>
        
        <div class="fact-card carbs">
          <h3>Carbohydrates</h3>
          <div class="fact-content">
            <div class="fact-number">4</div>
            <div class="fact-label">calories per gram</div>
          </div>
          <p>Primary source of energy for the body</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowRight, 
  List, 
  Trophy, 
  Star, 
  Lightning, 
  Document 
} from '@element-plus/icons-vue'
import ArticleCard from '../components/ArticleCard.vue'
import { useMacroArticles } from '../composables/useMacroArticles.js'

const router = useRouter()

// Use Firebase composable for macro articles
const {
  articles: allArticles,
  loading,
  error,
  counts,
  proteinArticles,
  fatArticles,
  carbArticles,
  fetchAllArticles,
  sortArticles
} = useMacroArticles()

// Reactive data
const activeFilter = ref('all')
const sortBy = ref('date')

// Computed properties for filtering
const filteredArticles = computed(() => {
  if (activeFilter.value === 'all') return allArticles.value
  return allArticles.value.filter(article => article.subcategory === activeFilter.value)
})

const sortedArticles = computed(() => {
  return sortArticles(filteredArticles.value, sortBy.value)
})

// Methods
const setFilter = (filter) => {
  activeFilter.value = filter
}

const clearFilters = () => {
  activeFilter.value = 'all'
}

const getFilterTitle = () => {
  const titles = {
    all: 'All Macronutrients',
    protein: 'Protein Articles',
    fats: 'Fats Articles',
    carbs: 'Carbohydrate Articles'
  }
  return titles[activeFilter.value] || 'Articles'
}

const navigateToArticle = (article) => {
  router.push(`/learn/macro/${article.id}`)
}

const loadArticles = async () => {
  try {
    await fetchAllArticles()
  } catch (err) {
    ElMessage.error('Failed to load articles. Please refresh the page.')
    console.error('Error loading articles:', err)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Macro page mounted')
  await loadArticles()
})

// Watch for errors and show messages
const unwatchError = computed(() => {
  if (error.value) {
    ElMessage.error(error.value)
  }
})

onUnmounted(() => {
  if (unwatchError.value) {
    unwatchError.value = null
  }
})
</script>

<style scoped>
.macro-page {
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.breadcrumb a {
  color: #409eff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
}

/* Filter Section */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-header h3 {
  margin: 0;
  color: #333;
}

.filter-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.filter-tab:hover {
  background: #e3f2fd;
  border-color: #90caf9;
}

.filter-tab.active {
  background: #e3f2fd;
  border-color: #409eff;
  color: #409eff;
}

.filter-tab .count {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Articles Section */
.articles-section {
  margin-bottom: 3rem;
}

.articles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.articles-header h2 {
  color: #333;
  margin: 0;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

/* Loading State */
.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: #999;
}

.empty-state p {
  margin-bottom: 1rem;
}

.empty-state .el-button {
  margin-top: 1rem;
}

/* Quick Facts Section */
.quick-facts-section {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.fact-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.fact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.fact-card.protein::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.fact-card.fats::before {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.fact-card.carbs::before {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.fact-card h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.fact-content {
  margin-bottom: 1rem;
}

.fact-number {
  font-size: 3rem;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.fact-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.fact-card p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-tabs {
    grid-template-columns: 1fr;
  }
  
  .articles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .facts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
