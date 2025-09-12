<template>
  <div class="vitamins-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/learn">Learn</router-link>
        <el-icon><ArrowRight /></el-icon>
        <span>Vitamins</span>
      </div>
      <h1 class="page-title">Vitamins</h1>
      <p class="page-description">
        Essential micronutrients that support various bodily functions: fat-soluble and water-soluble vitamins
      </p>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Filter by Vitamin Type</h3>
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
          <span>All Vitamins</span>
          <div class="count">{{ counts.all }}</div>
        </div>
        
        <div 
          class="filter-tab fat-soluble"
          :class="{ active: activeFilter === 'fat-soluble' }"
          @click="setFilter('fat-soluble')"
        >
          <el-icon><Sunny /></el-icon>
          <span>Fat-Soluble (A,D,E,K)</span>
          <div class="count">{{ counts['fat-soluble'] }}</div>
        </div>
        
        <div 
          class="filter-tab water-soluble"
          :class="{ active: activeFilter === 'water-soluble' }"
          @click="setFilter('water-soluble')"
        >
          <el-icon><Cloudy /></el-icon>
          <span>Water-Soluble (B,C)</span>
          <div class="count">{{ counts['water-soluble'] }}</div>
        </div>
      </div>

      <!-- Specific Vitamin Filters -->
      <div class="vitamin-specific-filters" v-if="activeFilter !== 'all'">
        <h4>Specific Vitamins</h4>
        <div class="vitamin-chips">
          <div 
            v-for="vitamin in getSpecificVitamins()"
            :key="vitamin.key"
            class="vitamin-chip"
            :class="{ active: specificFilter === vitamin.key }"
            @click="setSpecificFilter(vitamin.key)"
          >
            {{ vitamin.name }}
            <span class="chip-count">{{ vitamin.count }}</span>
          </div>
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
            <el-option label="Difficulty" value="difficulty" />
            <el-option label="Importance" value="importance" />
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
          @click="loadVitaminArticles"
          :loading="loading"
        >
          Retry
        </el-button>
      </div>
    </div>

    <!-- Vitamin Chart Section -->
    <div class="vitamin-chart-section">
      <h2 class="section-title">Vitamin Quick Reference</h2>
      <div class="chart-grid">
        <!-- Fat-Soluble Vitamins -->
        <div class="chart-category fat-soluble">
          <h3>Fat-Soluble Vitamins</h3>
          <div class="vitamins-list">
            <div class="vitamin-item">
              <strong>Vitamin A</strong>
              <span>Vision, immune function</span>
            </div>
            <div class="vitamin-item">
              <strong>Vitamin D</strong>
              <span>Bone health, immunity</span>
            </div>
            <div class="vitamin-item">
              <strong>Vitamin E</strong>
              <span>Antioxidant protection</span>
            </div>
            <div class="vitamin-item">
              <strong>Vitamin K</strong>
              <span>Blood clotting, bones</span>
            </div>
          </div>
        </div>

        <!-- Water-Soluble Vitamins -->
        <div class="chart-category water-soluble">
          <h3>Water-Soluble Vitamins</h3>
          <div class="vitamins-list">
            <div class="vitamin-item">
              <strong>Vitamin C</strong>
              <span>Immunity, collagen</span>
            </div>
            <div class="vitamin-item">
              <strong>B-Complex</strong>
              <span>Energy metabolism</span>
            </div>
            <div class="vitamin-item">
              <strong>Folate (B9)</strong>
              <span>DNA synthesis</span>
            </div>
            <div class="vitamin-item">
              <strong>B12</strong>
              <span>Nerve function, red blood cells</span>
            </div>
          </div>
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
  Sunny, 
  Cloudy, 
  Document 
} from '@element-plus/icons-vue'
import ArticleCard from '../components/ArticleCard.vue'
import { 
  getAllVitaminArticles, 
  getVitaminArticlesCounts,
  sortVitaminArticles,
  filterVitaminArticles
} from '../services/vitaminService.js'

const router = useRouter()

// Reactive data
const activeFilter = ref('all')
const specificFilter = ref('')
const sortBy = ref('date')
const loading = ref(false)
const error = ref(null)

// Use Firebase data for vitamins
const allArticles = ref([])
const counts = ref({
  all: 0,
  'fat-soluble': 0,
  'water-soluble': 0,
  'vitamin-a': 0,
  'vitamin-d': 0,
  'vitamin-e': 0,
  'vitamin-k': 0,
  'vitamin-c': 0,
  'vitamin-b': 0,
  'vitamin-b9': 0,
  'vitamin-b12': 0,
  'vitamin-b1': 0
})

// Computed properties for filtering
const fatSolubleArticles = computed(() => 
  allArticles.value.filter(article => article.subcategory === 'fat-soluble')
)

const waterSolubleArticles = computed(() => 
  allArticles.value.filter(article => article.subcategory === 'water-soluble')
)

const filteredArticles = computed(() => {
  const filters = {
    subcategory: activeFilter.value,
    vitaminType: specificFilter.value
  }
  return filterVitaminArticles(allArticles.value, filters)
})

const sortedArticles = computed(() => {
  return sortVitaminArticles(filteredArticles.value, sortBy.value)
})

// Methods
const setFilter = (filter) => {
  activeFilter.value = filter
  specificFilter.value = '' // Clear specific filter when changing main filter
}

const setSpecificFilter = (vitamin) => {
  specificFilter.value = specificFilter.value === vitamin ? '' : vitamin
}

const clearFilters = () => {
  activeFilter.value = 'all'
  specificFilter.value = ''
}

const getSpecificVitamins = () => {
  if (activeFilter.value === 'fat-soluble') {
    return [
      { key: 'vitamin-a', name: 'Vitamin A', count: counts.value['vitamin-a'] },
      { key: 'vitamin-d', name: 'Vitamin D', count: counts.value['vitamin-d'] },
      { key: 'vitamin-e', name: 'Vitamin E', count: counts.value['vitamin-e'] },
      { key: 'vitamin-k', name: 'Vitamin K', count: counts.value['vitamin-k'] }
    ]
  } else if (activeFilter.value === 'water-soluble') {
    return [
      { key: 'vitamin-c', name: 'Vitamin C', count: counts.value['vitamin-c'] },
      { key: 'vitamin-b', name: 'B-Complex', count: counts.value['vitamin-b'] },
      { key: 'vitamin-b9', name: 'B9 (Folate)', count: counts.value['vitamin-b9'] },
      { key: 'vitamin-b12', name: 'B12', count: counts.value['vitamin-b12'] },
      { key: 'vitamin-b1', name: 'B1 (Thiamine)', count: counts.value['vitamin-b1'] }
    ]
  }
  return []
}

const getFilterTitle = () => {
  if (specificFilter.value) {
    const vitamin = getSpecificVitamins().find(v => v.key === specificFilter.value)
    return `${vitamin?.name} Articles`
  }
  
  const titles = {
    all: 'All Vitamins',
    'fat-soluble': 'Fat-Soluble Vitamins (A, D, E, K)',
    'water-soluble': 'Water-Soluble Vitamins (B, C)'
  }
  return titles[activeFilter.value] || 'Articles'
}

const navigateToArticle = (article) => {
  router.push(`/learn/vitamins/${article.id}`)
}

const loadVitaminArticles = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('Loading vitamin articles from Firestore...')
    const [articles, articleCounts] = await Promise.all([
      getAllVitaminArticles(),
      getVitaminArticlesCounts()
    ])
    
    allArticles.value = articles
    counts.value = articleCounts
    
    console.log('✅ Vitamin articles loaded successfully:', articles.length)
  } catch (err) {
    error.value = err.message
    console.error('❌ Error loading vitamin articles:', err)
    ElMessage.error('Failed to load vitamin articles. Please refresh the page.')
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Vitamins page mounted')
  await loadVitaminArticles()
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
.vitamins-page {
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.filter-tab.fat-soluble.active {
  background: #fff8e1;
  border-color: #ffa726;
  color: #f57c00;
}

.filter-tab.water-soluble.active {
  background: #e8f5e8;
  border-color: #66bb6a;
  color: #388e3c;
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

/* Vitamin Specific Filters */
.vitamin-specific-filters {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.vitamin-specific-filters h4 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vitamin-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.vitamin-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f2f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
  border: 2px solid transparent;
}

.vitamin-chip:hover {
  background: #e3f2fd;
  border-color: #90caf9;
}

.vitamin-chip.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.chip-count {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  font-size: 0.75rem;
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

/* Vitamin Chart Section */
.vitamin-chart-section {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.chart-category {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.chart-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.chart-category.fat-soluble::before {
  background: linear-gradient(90deg, #ffa726, #ff7043);
}

.chart-category.water-soluble::before {
  background: linear-gradient(90deg, #66bb6a, #42a5f5);
}

.chart-category h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.2rem;
}

.vitamins-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vitamin-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.vitamin-item strong {
  color: #333;
  font-weight: 600;
}

.vitamin-item span {
  color: #666;
  font-size: 0.85rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-tabs {
    grid-template-columns: 1fr;
  }
  
  .vitamin-chips {
    gap: 0.5rem;
  }
  
  .vitamin-chip {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
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
  
  .chart-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
