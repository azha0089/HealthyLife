<template>
  <div class="recipe-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Recipe Not Found -->
    <div v-else-if="!recipe" class="not-found">
      <el-result icon="error" title="Recipe Not Found" sub-title="The recipe you're looking for doesn't exist.">
        <template #extra>
          <el-button type="primary" @click="$router.push('/recipes/breakfast')">
            Browse Recipes
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- Recipe Content -->
    <div v-else class="recipe-content">
      <!-- Back Navigation -->
      <div class="back-nav" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <el-button @click="goBack" icon="ArrowLeft" type="text">Back to last  page</el-button>
        <div>
          <el-button :type="isSpeaking ? 'warning' : 'success'" @click="toggleReadAloud" aria-label="Read Aloud">{{ isSpeaking ? 'Stop' : 'Read Aloud' }}</el-button>
          <el-dropdown @command="handleExportCommand">
            <span class="el-dropdown-link">
              <el-icon><Download /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">Send to Email</el-dropdown-item>
                <el-dropdown-item command="download">Download (CSV)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Recipe Header -->
      <div class="recipe-header">
        <div class="recipe-image-container">
          <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
          <div class="image-overlay">
            <el-button
              :icon="isFavorite ? 'StarFilled' : 'Star'"
              circle
              size="large"
              class="favorite-btn"
              :class="{ 'favorited': isFavorite }"
              @click="toggleFavorite"
              :loading="favoriteLoading"
              v-if="authStore.isAuthenticated"
            />
          </div>
        </div>

        <div class="recipe-info">
          <div class="recipe-meta-top">

            <el-tag :type="getDifficultyType(recipe.difficulty)" size="large">
              {{ getDifficultyLabel(recipe.difficulty) }}
            </el-tag>
          </div>

          <h1 class="recipe-title">{{ recipe.title }}</h1>

          <div class="recipe-stats">
            <div class="stat-group">
              <div class="stat-item">
                <el-icon class="stat-icon"><Clock /></el-icon>
                <div class="stat-content">
                  <span class="stat-value">{{ recipe.totalTime }}</span>
                  <span class="stat-label">minutes</span>
                </div>
              </div>

              <div class="stat-item">
                <el-icon class="stat-icon"><Lightning /></el-icon>
                <div class="stat-content">
                  <span class="stat-value">{{ recipe.calories }}</span>
                  <span class="stat-label">calories</span>
                </div>
              </div>

              <div class="stat-item">
                <el-icon class="stat-icon"><User /></el-icon>
                <div class="stat-content">
                  <span class="stat-value">{{ recipe.servings }}</span>
                  <span class="stat-label">servings</span>
                </div>
              </div>
            </div>

            <!-- Rating and Reviews -->
            <div class="rating-section">
              <div class="current-rating">
                <el-rate
                  v-model="recipe.rating.average"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <span class="rating-count">({{ recipe.rating.count }} reviews)</span>
              </div>

              <!-- User Rating (if authenticated) -->
              <div v-if="authStore.isAuthenticated" class="user-rating">
                <span class="rating-label">Rate this recipe:</span>
                <el-rate
                  v-model="userRating"
                  @change="handleRatingChange"
                  :disabled="ratingLoading"
                  show-text
                  :texts="['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']"
                />
                <span v-if="ratingLoading" class="rating-loading">Submitting...</span>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="recipe-tags">
            <el-tag
              v-for="tag in recipe.tags"
              :key="tag"
              type="info"
              effect="plain"
            >
              {{ formatTag(tag) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Main Content Layout -->
      <div class="main-content">
        <!-- Left Column - Ingredients and Summary -->
        <div class="left-column">
          <!-- Time & Nutrition Summary -->
          <div class="summary-cards">
            <!-- Time Breakdown -->
            <div class="time-breakdown">
              <h3><el-icon><Clock /></el-icon> Time Breakdown</h3>
              <div class="time-items">
                <div class="time-item">
                  <span class="time-label">Prep Time:</span>
                  <span class="time-value">{{ recipe.prepTime }} </span>
                </div>
                <div class="time-item total-time">
                  <span class="time-label">Cook Time:</span>
                  <span class="time-value">{{ recipe.cookTime }} </span>
                </div>

                <div class="time-item total-time">
                  <span class="time-label">Total Time:</span>
                  <span class="time-value">{{ recipe.totalTime }} </span>
                </div>
              </div>
            </div>

            <!-- Nutrition Summary -->
            <div class="nutrition-summary">
              <h3><el-icon><DataLine /></el-icon> Nutrition Summary</h3>
              <div class="nutrition-highlights">
                <div
                  v-for="(value, key) in recipe.nutrition"
                  :key="key"
                  class="nutrition-highlight-item"
                  :class="key.toLowerCase()"
                >
                  <span class="highlight-value">{{ value }}</span>
                  <span class="highlight-label">{{ key }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ingredients Section -->
          <div class="ingredients-section">
            <div class="section-header">
              <h3><el-icon><Food /></el-icon> Ingredients</h3>
              <div class="servings-adjuster">
                <label>Adjust servings:</label>
                <el-input-number
                  v-model="adjustedServings"
                  :min="1"
                  :max="10"
                  size="small"
                  @change="adjustIngredients"
                />
              </div>
            </div>

            <div class="ingredients-grid">
              <div
                v-for="(ingredient, index) in adjustedIngredients"
                :key="index"
                class="ingredient-item"
                :class="{ 'checked': checkedIngredients.includes(index) }"
                @click="toggleIngredient(index)"
              >
                <el-checkbox
                  :model-value="checkedIngredients.includes(index)"
                  @change="toggleIngredient(index)"
                />
                <div class="ingredient-content">
                  <span class="ingredient-name">{{ ingredient.name }}</span>
                  <span class="ingredient-amount">{{ ingredient.amount }} {{ ingredient.unit }}</span>
                </div>
              </div>
            </div>

            <div class="shopping-actions">
              <el-button type="primary" icon="ShoppingCart">
                Add All to Shopping List
              </el-button>
            </div>
          </div>

          <!-- Tips -->
          <div v-if="recipe.tips && recipe.tips.length > 0" class="tips-section">
            <h3><el-icon><InfoFilled /></el-icon> Chef's Tips</h3>
            <ul class="tips-list">
              <li v-for="(tip, index) in recipe.tips" :key="index" class="tip-item">
                <el-icon class="tip-icon"><BulbFilled /></el-icon>
                <span>{{ tip }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Column - Instructions -->
        <div class="right-column">
          <!-- Instructions -->
          <div class="instructions-section">
            <h3><el-icon><List /></el-icon> Step-by-Step Instructions</h3>
            <ol class="instructions-list">
              <li
                v-for="(instruction, index) in recipe.steps"
                :key="index"
                class="instruction-item"
                :class="{ 'completed': completedSteps.includes(index) }"
              >
                <div class="instruction-content">
                  <div class="step-header">
                    <span class="step-number">{{ index + 1 }}</span>
                    <el-button
                      size="small"
                      type="success"
                      plain
                      @click="toggleStep(index)"
                      :icon="completedSteps.includes(index) ? 'Check' : 'Plus'"
                    >
                      {{ completedSteps.includes(index) ? 'Done' : 'Mark Done' }}
                    </el-button>
                  </div>
                  <p class="instruction-text">{{ instruction }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { getRecipeById, getRelatedRecipes } from '../services/recipeService.js'
import {
  submitRating,
  getUserRating,
  getRecipeRatings
} from '../services/ratingService.js'
import {
  toggleFavorite as toggleFavoriteService,
  isFavorited
} from '../services/favoriteService.js'
import RecipeCard from '../components/RecipeCard.vue'
import {
  ArrowLeft, Clock, Lightning, User, Star, StarFilled,
  Check, Plus, InfoFilled, ShoppingCart, DataLine, Food,
  List
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendEmail, buildAuthEmailTemplate } from '../services/emailService.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const loading = ref(true)
const recipe = ref(null)
const userRating = ref(0)
const adjustedServings = ref(1)
const completedSteps = ref([])
const checkedIngredients = ref([])
const ratingLoading = ref(false)
const userRatingLoaded = ref(false)
const favoriteStatus = ref(false)
const favoriteLoading = ref(false)

// Computed properties
const isFavorite = computed(() => {
  return favoriteStatus.value
})

const servingMultiplier = computed(() => {
  return recipe.value ? adjustedServings.value / recipe.value.servings : 1
})

const adjustedIngredients = computed(() => {
  if (!recipe.value) return []

  return recipe.value.ingredients.map(ingredient => ({
    ...ingredient,
    amount: ingredient.amount === 'to taste' ? ingredient.amount :
            (parseFloat(ingredient.amount) * servingMultiplier.value).toFixed(ingredient.amount.includes('.') ? 1 : 0)
  }))
})

// Methods
const loadRecipe = async () => {
  loading.value = true

  try {
    const recipeId = route.params.id
    console.log('Loading recipe with ID:', recipeId)

    recipe.value = await getRecipeById(recipeId)
    console.log('Recipe data loaded:', recipe.value)

    if (recipe.value) {
      // Initialize servings to recipe default
      adjustedServings.value = recipe.value.servings

      // Reset user interaction states
      completedSteps.value = []
      checkedIngredients.value = []

      // Load user rating and favorite status if authenticated
      if (authStore.isAuthenticated) {
        await Promise.all([
          loadUserRating(),
          loadFavoriteStatus()
        ])
      }
    } else {
      console.warn('Recipe not found or empty data returned')
    }
  } catch (error) {
    console.error('Error loading recipe:', error)
    ElMessage.error('Failed to load recipe')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/recipes')
}

const loadFavoriteStatus = async () => {
  if (!authStore.isAuthenticated || !recipe.value) {
    return
  }

  try {
    // 使用正确的菜谱ID格式，优先使用docId，然后是id
    const recipeId = recipe.value.docId || recipe.value.id
    console.log('loadFavoriteStatus: Checking favorite status for recipe:', {
      recipeId,
      docId: recipe.value.docId,
      id: recipe.value.id,
      userId: authStore.user.uid
    })
    
    const isFav = await isFavorited(recipeId, authStore.user.uid)
    favoriteStatus.value = isFav
    
    console.log('loadFavoriteStatus: Favorite status loaded:', isFav)
  } catch (error) {
    console.error('Error loading favorite status:', error)
  }
}

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Please log in to add favorites')
    return
  }

  if (!recipe.value) {
    return
  }

  favoriteLoading.value = true

  try {
    // 使用正确的菜谱ID格式，优先使用docId，然后是id
    const recipeId = recipe.value.docId || recipe.value.id
    console.log('toggleFavorite: Toggling favorite for recipe:', {
      recipeId,
      docId: recipe.value.docId,
      id: recipe.value.id,
      userId: authStore.user.uid,
      currentStatus: favoriteStatus.value
    })

    const result = await toggleFavoriteService(recipeId, authStore.user.uid)

    favoriteStatus.value = result.isFavorited
    
    console.log('toggleFavorite: Toggle result:', result)

    if (result.action === 'added') {
      ElMessage.success('Added to favorites!')
    } else {
      ElMessage.success('Removed from favorites!')
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    ElMessage.error('Failed to update favorites. Please try again.')
  } finally {
    favoriteLoading.value = false
  }
}

const loadUserRating = async () => {
  if (!authStore.isAuthenticated || !recipe.value) {
    return
  }

  try {
    // 使用正确的菜谱ID格式，优先使用docId，然后是id
    const recipeId = recipe.value.docId || recipe.value.id
    console.log('loadUserRating: Loading rating for recipe:', {
      recipeId,
      userId: authStore.user.uid
    })
    
    const rating = await getUserRating(recipeId, authStore.user.uid)
    if (rating !== null) {
      userRating.value = rating
    }
    userRatingLoaded.value = true
    
    console.log('loadUserRating: User rating loaded:', rating)
  } catch (error) {
    console.error('Error loading user rating:', error)
  }
}

const handleRatingChange = async (rating) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Please log in to rate this recipe')
    return
  }

  if (!rating || rating < 1 || rating > 5) {
    ElMessage.error('Invalid rating value')
    return
  }

  ratingLoading.value = true

  try {
    // 使用正确的菜谱ID格式，优先使用docId，然后是id
    const recipeId = recipe.value.docId || recipe.value.id
    console.log('handleRatingChange: User rated recipe:', recipeId, 'with', rating, 'stars')

    const result = await submitRating(recipeId, authStore.user.uid, rating)

    // Update local state with new rating stats
    if (recipe.value.rating) {
      recipe.value.rating.average = result.recipeStats.average
      recipe.value.rating.count = result.recipeStats.count
    } else {
      recipe.value.rating = {
        average: result.recipeStats.average,
        count: result.recipeStats.count
      }
    }

    // Update user rating
    userRating.value = rating

    ElMessage.success('Rating submitted successfully!')
  } catch (error) {
    console.error('Error submitting rating:', error)
    ElMessage.error('Failed to submit rating. Please try again.')

    // Revert rating on error
    await loadUserRating()
  } finally {
    ratingLoading.value = false
  }
}

const toggleStep = (stepIndex) => {
  const index = completedSteps.value.indexOf(stepIndex)
  if (index > -1) {
    completedSteps.value.splice(index, 1)
  } else {
    completedSteps.value.push(stepIndex)
  }
}

const toggleIngredient = (ingredientIndex) => {
  const index = checkedIngredients.value.indexOf(ingredientIndex)
  if (index > -1) {
    checkedIngredients.value.splice(index, 1)
  } else {
    checkedIngredients.value.push(ingredientIndex)
  }
}

const adjustIngredients = () => {
  // Ingredients are automatically adjusted via computed property
}

const getBudgetLabel = (budget) => {
  const labels = { low: '$', medium: '$$', high: '$$$' }
  return labels[budget] || budget
}

const getBudgetType = (budget) => {
  const types = { low: 'success', medium: 'warning', high: 'danger' }
  return types[budget] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

const getDifficultyType = (difficulty) => {
  const types = { easy: 'success', medium: 'warning', hard: 'danger' }
  return types[difficulty] || 'info'
}

const getCategoryName = (category) => {
  const names = {
    breakfast: 'Breakfast Recipes',
    lunch: 'Lunch Recipes',
    vegan: 'Vegan Recipes'
  }
  return names[category] || 'Recipes'
}

const formatTag = (tag) => {
  return tag.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Read Aloud (Web Speech API)
const isSpeaking = ref(false)
let utterance = null

function stripHtml(html) {
  const d = document.createElement('div')
  d.innerHTML = html || ''
  return d.innerText.replace(/\s+/g, ' ').trim()
}

function buildReadableText() {
  const parts = []
  if (recipe.value?.title) parts.push(recipe.value.title)
  const left = document.querySelector('.ingredients-section')?.innerText || ''
  const right = document.querySelector('.instructions-section')?.innerText || ''
  const body = [left, right].join('. ').replace(/\s+/g, ' ').trim()
  if (body) parts.push(body)
  return parts.join('. ')
}

function startReading() {
  try {
    if (!('speechSynthesis' in window)) return
    stopReading()
    utterance = new SpeechSynthesisUtterance(buildReadableText())
    utterance.onend = () => { isSpeaking.value = false }
    window.speechSynthesis.speak(utterance)
    isSpeaking.value = true
  } catch (_) {}
}

function stopReading() {
  try { window.speechSynthesis?.cancel() } catch (_) {}
  isSpeaking.value = false
}

function toggleReadAloud() {
  if (isSpeaking.value) stopReading(); else startReading()
}

onBeforeUnmount(() => stopReading())

// Export (CSV or Email)
function handleExportCommand(cmd) {
  if (cmd === 'email') return exportToEmail()
  if (cmd === 'download') return exportToDevice()
}

function asCsv() {
  if (!recipe.value) return ''
  const rows = [
    ['Title', 'Total Time', 'Calories', 'Servings'],
    [recipe.value.title, recipe.value.totalTime, recipe.value.calories, recipe.value.servings]
  ]
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
}

function downloadBlob(filename, content, type='text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportToDevice() {
  const csv = asCsv()
  downloadBlob(`${(recipe.value?.title || 'recipe').replace(/[^a-z0-9\-_]+/gi,'_')}.csv`, csv)
}

async function exportToEmail() {
  try {
    const to = ''
    const html = buildAuthEmailTemplate({
      title: 'Recipe Export',
      greeting: 'Your requested export is attached below.',
      contentLines: [recipe.value?.title || '']
    })
    const csv = asCsv()
    const base64 = btoa(unescape(encodeURIComponent(csv)))
    await sendEmail({
      to: to || prompt('Enter email address to send to:'),
      subject: `Export - ${(recipe.value?.title || 'Recipe')}`,
      html,
      attachments: [{ filename: 'recipe.csv', mimeType: 'text/csv', content: base64 }]
    })
    ElMessage.success('Export email sent (best-effort)')
  } catch (e) {
    ElMessage.error('Failed to send email')
  }
}

// Watch route changes
watch(() => route.params.id, () => {
  // Reset user rating and favorite status when navigating to different recipe
  userRating.value = 0
  userRatingLoaded.value = false
  favoriteStatus.value = false
  loadRecipe()
}, { immediate: true })

// Watch authentication state changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && recipe.value && !userRatingLoaded.value) {
    loadUserRating()
    loadFavoriteStatus()
  } else if (!isAuthenticated) {
    userRating.value = 0
    userRatingLoaded.value = false
    favoriteStatus.value = false
  }
})

// Lifecycle
onMounted(() => {// Initial load is handled by the watcher with immediate: true
})
</script>

<style scoped>
.recipe-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  padding: 40px;
}

.not-found {
  padding: 40px;
  text-align: center;
}

.back-nav {
  margin-bottom: 20px;
}

.recipe-header {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.recipe-image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #666;
}

.favorite-btn.favorited {
  color: #f56c6c;
}

.recipe-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recipe-meta-top {
  display: flex;
  gap: 12px;
}

.recipe-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.recipe-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-group {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 1.5rem;
  color: #409eff;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-count {
  color: #666;
  font-size: 0.9rem;
}

.user-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  font-size: 0.9rem;
  color: #666;
  margin-right: 8px;
}

.rating-loading {
  font-size: 0.8rem;
  color: #409eff;
  margin-left: 8px;
  font-style: italic;
}

.user-rating .el-rate {
  margin: 0 8px;
}

.user-rating .el-rate__text {
  font-size: 0.9rem;
  color: #666;
  margin-left: 8px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Summary Cards (Time & Nutrition) */
.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 10px;
}

.time-breakdown, .nutrition-summary {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-breakdown h3, .nutrition-summary h3 {
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-breakdown h3 .el-icon, .nutrition-summary h3 .el-icon {
  color: #409eff;
}

.time-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.time-item.total-time {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 16px;
  font-weight: 600;
}

.time-label {
  color: #666;
}

.time-value {
  color: #333;
  font-weight: 500;
}

/* Nutrition Summary */
.nutrition-highlights {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.nutrition-highlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  min-width: 80px;
  flex: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nutrition-highlight-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nutrition-highlight-item.calories .highlight-value {
  color: #f56c6c;
}

.nutrition-highlight-item.protein .highlight-value {
  color: #67c23a;
}

.nutrition-highlight-item.carbs .highlight-value {
  color: #e6a23c;
}

.nutrition-highlight-item.fat .highlight-value {
  color: #409eff;
}

.nutrition-highlight-item.fiber .highlight-value {
  color: #909399;
}

.nutrition-highlight-item.sugar .highlight-value {
  color: #f56c6c;
}

.highlight-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #409eff;
}

.highlight-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}

/* Ingredients Section */
.ingredients-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.ingredients-section h3 {
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ingredients-section h3 .el-icon {
  color: #67c23a;
}

.servings-adjuster {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.ingredient-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ingredient-item.checked {
  background: #f6ffed;
  text-decoration: line-through;
  opacity: 0.7;
  border-color: #b7eb8f;
}

.ingredient-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ingredient-name {
  font-weight: 500;
  color: #333;
}

.ingredient-amount {
  font-size: 0.85rem;
  color: #409eff;
}

.shopping-actions {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* Instructions Section */
.instructions-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.instructions-section h3 {
  margin: 0 0 24px 0;
  color: #333;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.instructions-section h3 .el-icon {
  color: #409eff;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

.instruction-item {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.instruction-item.completed {
  border-color: #52c41a;
  background: #f6ffed;
}

.instruction-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-number {
  background: #409eff;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.instruction-item.completed .step-number {
  background: #52c41a;
}

.instruction-text {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

/* Tips Section */
.tips-section {
  background: #fff7e6;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #faad14;
}

.tips-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-section h3 .el-icon {
  color: #faad14;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #666;
  line-height: 1.5;
}

.tip-icon {
  color: #faad14;
  margin-top: 2px;
}

/* Sidebar Column - Nutrition */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sticky-card {
  position: sticky;
  top: 20px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nutrition-card h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.3rem;
}

.nutrition-per-serving {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
  font-style: italic;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.nutrition-item.calories {
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.nutrition-item.calories .nutrition-value {
  font-size: 1.5rem;
  color: #409eff;
}

.nutrition-section {
  margin: 20px 0;
}

.nutrition-section h4 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 1rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.nutrition-item:last-child {
  border-bottom: none;
}

.nutrition-label {
  color: #666;
}

.nutrition-value {
  font-weight: 600;
  color: #333;
}

/* Nutrition Chart */
.nutrition-chart {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.nutrition-chart h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1rem;
  text-align: center;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  width: 60px;
  font-size: 0.9rem;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 6px;
}

.protein-bar {
  background: #52c41a;
}

.carbs-bar {
  background: #faad14;
}

.fat-bar {
  background: #f56c6c;
}

.bar-value {
  width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  text-align: right;
}

.related-recipes {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.related-recipes h3 {
  margin: 0 0 24px 0;
  color: #333;
  font-size: 1.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .recipe-header {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .ingredients-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: -1;
  }
}

@media (max-width: 768px) {
  .recipe-detail-page {
    padding: 16px;
  }

  .recipe-header {
    padding: 20px;
  }

  .recipe-title {
    font-size: 2rem;
  }

  .stat-group {
    flex-wrap: wrap;
    gap: 20px;
  }

  .instruction-content {
    flex-direction: column;
    gap: 12px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
