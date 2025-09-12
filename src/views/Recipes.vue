<template>
  <div class="recipes-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><KnifeFork /></el-icon>
          Recipe Collection
        </h1>
        <p class="page-description">
          Browse our extensive collection of recipes, filter by meal type, cooking time, and nutritional needs to find your perfect dish.
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ filteredRecipes.length }}</span>
          <span class="stat-label">Recipes</span>
        </div>
      </div>
    </div>

    <!-- Recipe Category Tabs -->
    <div class="category-tabs">
      <div
        class="category-tab"
        :class="{ active: activeCategory === 'all' }"
        @click="setCategory('all')"
      >
        <el-icon><Menu /></el-icon>
        <span>All Recipes</span>
        <div class="count">{{ counts.all }}</div>
      </div>
      <div
        class="category-tab"
        :class="{ active: activeCategory === 'breakfast' }"
        @click="setCategory('breakfast')"
      >
        <el-icon><Sunrise /></el-icon>
        <span>Breakfast</span>
        <div class="count">{{ counts.breakfast }}</div>
      </div>
      <div
        class="category-tab"
        :class="{ active: activeCategory === 'lunch' }"
        @click="setCategory('lunch')"
      >
        <el-icon><Sunny /></el-icon>
        <span>Lunch</span>
        <div class="count">{{ counts.lunch }}</div>
      </div>
      <div
        class="category-tab"
        :class="{ active: activeCategory === 'vegan' }"
        @click="setCategory('vegan')"
      >
        <el-icon><MoonNight /></el-icon>
        <span>Vegan</span>
        <div class="count">{{ counts.vegan }}</div>
      </div>

    </div>



    <!-- Results Info -->
    <div class="results-info">
      <p>
        Showing {{ filteredRecipes.length }} of {{ allRecipes.length }} recipes
        <span v-if="hasActiveFilters" class="filter-indicator">
          with active filters
        </span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
      <el-skeleton :rows="3" animated />
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Recipe Grid/List -->
    <div v-else class="recipes-container">
      <div
        class="recipes-grid"
        :class="{ 'list-view': viewMode === 'list', 'grid-view': viewMode === 'grid' }"
      >
        <RecipeCard
          v-for="recipe in sortedRecipes"
          :key="recipe.docId || recipe.id"
          :recipe="recipe"
          :class="{ 'list-card': viewMode === 'list' }"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredRecipes.length === 0" class="empty-state">
        <el-empty description="No recipes found matching your criteria">
          <template #image>
            <el-icon size="80" color="#c0c4cc"><KnifeFork /></el-icon>
          </template>
          <el-button type="primary" @click="clearFilters">
            Clear Filters
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="filteredRecipes.length > 0 && hasMoreRecipes" class="load-more-section">
      <el-button size="large" type="primary" plain @click="loadMoreRecipes" :loading="loadingMore">
        Load More Recipes
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import RecipeCard from '../components/RecipeCard.vue'
import RecipeFilter from '../components/RecipeFilter.vue'
import {
  Menu, Grid, List, Sunrise, Sunny,
  MoonNight, IceCream, KnifeFork
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getAllRecipes,
  getRecipesByCategory,
  getRecipesCounts,
  filterRecipes,
  searchRecipes
} from '../services/recipeService.js'

// Reactive data
const loading = ref(true)
const loadingMore = ref(false)
const sortBy = ref('rating')
const viewMode = ref('grid')
const activeCategory = ref('all')
const allRecipes = ref([])
const displayedRecipes = ref([])
const pageSize = ref(12)
const currentPage = ref(1)
const counts = ref({
  all: 0,
  breakfast: 0,
  lunch: 0,
  vegan: 0
})

const filters = reactive({
  search: '',
  budget: [],
  time: [],
  calories: [],
  difficulty: [],
  tags: []
})

// Computed properties
const filteredRecipes = computed(() => {
  let recipes = displayedRecipes.value

  // Apply category filter
  if (activeCategory.value !== 'all') {
    recipes = recipes.filter(recipe => recipe.category === activeCategory.value)
  }

  // Apply search filter
  if (filters.search) {
    recipes = searchRecipes(recipes, filters.search)
  }

  // Apply other filters
  recipes = filterRecipes(recipes, filters)

  return recipes
})

const sortedRecipes = computed(() => {
  const recipes = [...filteredRecipes.value]

  switch (sortBy.value) {
    case 'rating':
      return recipes.sort((a, b) => b.rating.average - a.rating.average)
    case 'time':
      return recipes.sort((a, b) => a.totalTime - b.totalTime)
    case 'calories':
      return recipes.sort((a, b) => a.calories - b.calories)
    case 'newest':
      return recipes.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
    case 'alphabetical':
      return recipes.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return recipes
  }
})

const hasActiveFilters = computed(() => {
  return filters.search ||
         filters.budget.length > 0 ||
         filters.time.length > 0 ||
         filters.calories.length > 0 ||
         filters.difficulty.length > 0 ||
         filters.tags.length > 0 ||
         activeCategory.value !== 'all'
})

const averageTime = computed(() => {
  if (allRecipes.value.length === 0) return 0
  const total = allRecipes.value.reduce((sum, recipe) => sum + recipe.totalTime, 0)
  return Math.round(total / allRecipes.value.length)
})

const averageCalories = computed(() => {
  if (allRecipes.value.length === 0) return 0
  const total = allRecipes.value.reduce((sum, recipe) => sum + recipe.calories, 0)
  return Math.round(total / allRecipes.value.length)
})

const hasMoreRecipes = computed(() => {
  return displayedRecipes.value.length < allRecipes.value.length
})

// Methods
const loadRecipes = async () => {
  loading.value = true

  try {
    console.log('Loading recipes from Firestore...')
    const [recipes, recipeCounts] = await Promise.all([
      getAllRecipes(),
      getRecipesCounts()
    ])

    allRecipes.value = recipes
    counts.value = recipeCounts

    // Initial display of first page
    displayedRecipes.value = recipes.slice(0, pageSize.value)

    console.log('✅ Successfully loaded recipes:', recipes.length)
  } catch (error) {
    console.error('❌ Failed to load recipes:', error)
    ElMessage.error('Failed to load recipes. Please refresh the page.')
  } finally {
    loading.value = false
  }
}

const loadMoreRecipes = async () => {
  if (loadingMore.value || displayedRecipes.value.length >= allRecipes.value.length) return

  loadingMore.value = true

  try {
    const nextPage = currentPage.value + 1
    const start = currentPage.value * pageSize.value
    const end = start + pageSize.value

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const nextItems = allRecipes.value.slice(start, end)
    displayedRecipes.value = [...displayedRecipes.value, ...nextItems]
    currentPage.value = nextPage
  } catch (error) {
    console.error('Failed to load more recipes:', error)
    ElMessage.error('Failed to load more recipes. Please try again.')
  } finally {
    loadingMore.value = false
  }
}

const setCategory = (category) => {
  activeCategory.value = category
}

const clearFilters = () => {
  filters.search = ''
  filters.budget = []
  filters.time = []
  filters.calories = []
  filters.difficulty = []
  filters.tags = []
  activeCategory.value = 'all'
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Recipe page mounted')
  await loadRecipes()
})
</script>

<style scoped>
.recipes-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #67c23a 0%, #19547b 100%);
  color: white;
  padding: 30px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="3" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></svg>');
  pointer-events: none;
}

.header-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  font-size: 2.5rem;
  color: #ffd700;
}

.page-description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
}

.header-stats {
  display: flex;
  gap: 30px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 4px;
}

/* Category Tabs */
.category-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-tab:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
}

.category-tab.active {
  border-color: #67c23a;
  background: #f0f9eb;
}

.category-tab .el-icon {
  font-size: 1.5rem;
  color: #67c23a;
}

.category-tab .count {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.05);
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.sort-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-weight: 500;
  color: #666;
}

.results-info {
  margin-bottom: 20px;
  color: #666;
}

.filter-indicator {
  color: #67c23a;
  font-weight: 500;
}

.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.recipes-container {
  min-height: 400px;
}

.recipes-grid {
  display: grid;
  gap: 24px;
}

.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.list-view {
  grid-template-columns: 1fr;
}

.list-view .recipe-card {
  display: flex;
  max-width: none;
}

.list-view .recipe-card .recipe-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.list-view .recipe-card .recipe-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.load-more-section {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .recipes-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .category-tabs {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .sort-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .grid-view {
    grid-template-columns: 1fr;
  }

  .list-view .recipe-card {
    flex-direction: column;
  }

  .list-view .recipe-card .recipe-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .header-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .category-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
