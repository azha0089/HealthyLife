<template>
  <div class="lunch-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Sunny /></el-icon>
          Lunch Recipes
        </h1>
        <p class="page-description">
          Nutritionally balanced lunch recipes that keep you energized throughout the day. 
          Perfect for meal prep, work lunches, and family dining.
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ filteredRecipes.length }}</span>
          <span class="stat-label">Recipes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ averageTime }}</span>
          <span class="stat-label">Avg Time (min)</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ averageCalories }}</span>
          <span class="stat-label">Avg Calories</span>
        </div>
      </div>
    </div>

    <!-- Recipe Filter -->
    <RecipeFilter v-model:filters="filters" />

    <!-- Sort Options -->
    <div class="sort-section">
      <div class="sort-controls">
        <label class="sort-label">Sort by:</label>
        <el-select v-model="sortBy" placeholder="Sort by" style="width: 180px">
          <el-option label="Most Popular" value="rating" />
          <el-option label="Quickest" value="time" />
          <el-option label="Lowest Calories" value="calories" />
          <el-option label="Newest" value="newest" />
          <el-option label="A-Z" value="alphabetical" />
        </el-select>
      </div>
      
      <div class="view-controls">
        <el-button-group>
          <el-button 
            :type="viewMode === 'grid' ? 'primary' : 'default'"
            @click="viewMode = 'grid'"
            icon="Grid"
          >
            Grid
          </el-button>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : 'default'"
            @click="viewMode = 'list'"
            icon="List"
          >
            List
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Results Info -->
    <div class="results-info">
      <p>
        Showing {{ filteredRecipes.length }} of {{ lunchRecipes.length }} lunch recipes
        <span v-if="hasActiveFilters" class="filter-indicator">
          with active filters
        </span>
      </p>
    </div>

    <!-- Recipe Grid/List -->
    <div class="recipes-container">
      <div 
        class="recipes-grid" 
        :class="{ 'list-view': viewMode === 'list', 'grid-view': viewMode === 'grid' }"
      >
        <RecipeCard 
          v-for="recipe in sortedRecipes" 
          :key="recipe.id"
          :recipe="recipe"
          :class="{ 'list-card': viewMode === 'list' }"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredRecipes.length === 0" class="empty-state">
        <el-empty description="No lunch recipes found">
          <template #image>
            <el-icon size="80" color="#c0c4cc"><Sunny /></el-icon>
          </template>
          <el-button type="primary" @click="clearFilters">
            Clear Filters
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- Load More Button (for future pagination) -->
    <div v-if="filteredRecipes.length > 0 && filteredRecipes.length >= 6" class="load-more-section">
      <el-button size="large" type="primary" plain>
        Load More Recipes
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { getRecipesByCategory, filterRecipes, searchRecipes } from '../data/recipeData.js'
import RecipeCard from '../components/RecipeCard.vue'
import RecipeFilter from '../components/RecipeFilter.vue'
import { Sunny, Grid, List } from '@element-plus/icons-vue'

// Reactive data
const sortBy = ref('rating')
const viewMode = ref('grid')
const filters = reactive({
  search: '',
  budget: [],
  time: [],
  calories: [],
  difficulty: [],
  tags: []
})

// Get lunch recipes
const lunchRecipes = getRecipesByCategory('lunch')

// Computed properties
const filteredRecipes = computed(() => {
  let recipes = [...lunchRecipes]
  
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
      return recipes.sort((a, b) => b.id - a.id)
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
         filters.tags.length > 0
})

const averageTime = computed(() => {
  if (lunchRecipes.length === 0) return 0
  const total = lunchRecipes.reduce((sum, recipe) => sum + recipe.totalTime, 0)
  return Math.round(total / lunchRecipes.length)
})

const averageCalories = computed(() => {
  if (lunchRecipes.length === 0) return 0
  const total = lunchRecipes.reduce((sum, recipe) => sum + recipe.calories, 0)
  return Math.round(total / lunchRecipes.length)
})

// Methods
const clearFilters = () => {
  filters.search = ''
  filters.budget = []
  filters.time = []
  filters.calories = []
  filters.difficulty = []
  filters.tags = []
}
</script>

<style scoped>
.lunch-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  color: #409eff;
  font-weight: 500;
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
  .lunch-page {
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
}
</style>
