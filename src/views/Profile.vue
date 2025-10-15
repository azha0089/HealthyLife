<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="user-info">
        <el-avatar :size="80" :src="userAvatar" class="user-avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="user-details">
          <h2>{{ userDisplayName }}</h2>
          <p class="user-email">{{ authStore.user?.email }}</p>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="quick-links">
        <el-button type="primary" plain @click="$router.push('/profile/my-events')">
          <el-icon><Calendar /></el-icon>
          My Events
        </el-button>
        <el-button @click="$router.push('/events')">
          <el-icon><Calendar /></el-icon>
          Browse Events
        </el-button>
      </div>
      <!-- Favorites Section -->
      <div class="favorites-section">
        <div class="section-header">
          <h3><el-icon><Star /></el-icon> My Favorite Recipes</h3>
          <span class="count-badge">{{ favorites.length }} recipes</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <!-- Empty State -->
        <div v-else-if="favorites.length === 0" class="empty-state">
          <el-empty description="No favorite recipes yet">
            <template #image>
              <el-icon size="60" color="#909399"><Star /></el-icon>
            </template>
            <template #description>
              <p>You haven't favorited any recipes yet.</p>
              <p>Start exploring and save your favorite recipes!</p>
            </template>
            <el-button type="primary" @click="$router.push('/recipes')">
              Browse Recipes
            </el-button>
          </el-empty>
        </div>

        <!-- Favorites Grid -->
        <div v-else class="favorites-grid">
          <div
            v-for="recipe in favorites"
            :key="recipe.docId || recipe.id"
            class="favorite-card"
            @click="goToRecipe(recipe.docId || recipe.id)"
          >
            <div class="card-image">
              <img :src="recipe.image" :alt="recipe.title" />
              <div class="card-overlay">
                <el-button
                  icon="Delete"
                  circle
                  size="small"
                  class="remove-btn"
                  @click.stop="removeFavorite(recipe.docId || recipe.id)"
                  :loading="removingFavorites.includes(recipe.docId || recipe.id)"
                />
              </div>
            </div>

            <div class="card-content">
              <h4 class="recipe-title">{{ recipe.title }}</h4>
              
              <div class="recipe-meta">
                <el-tag :type="getCategoryType(recipe.category)" size="small">
                  {{ getCategoryLabel(recipe.category) }}
                </el-tag>
                
                <div class="recipe-stats">
                  <span class="stat">
                    <el-icon><Clock /></el-icon>
                    {{ recipe.totalTime }}min
                  </span>
                  <span class="stat">
                    <el-icon><Lightning /></el-icon>
                    {{ recipe.calories }}cal
                  </span>
                </div>
              </div>

              <div class="recipe-rating">
                <el-rate
                  :model-value="recipe.rating?.average || 0"
                  disabled
                  show-score
                  text-color="#ff9900"
                  size="small"
                />
                <span class="rating-count">
                  ({{ recipe.rating?.count || 0 }} reviews)
                </span>
              </div>

              <div class="favorited-date">
                <el-icon><Calendar /></el-icon>
                <span>Added {{ formatDate(recipe.favoritedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { getUserFavorites, removeFromFavorites } from '../services/favoriteService.js'
import { 
  User, Star, Clock, Lightning, Calendar, Delete 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const loading = ref(true)
const favorites = ref([])
const removingFavorites = ref([])

// Computed properties
const userDisplayName = computed(() => {
  return authStore.user?.displayName || 'User'
})

const userAvatar = computed(() => {
  return authStore.user?.photoURL || null
})

// Methods
const loadFavorites = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true

  try {
    console.log('Loading favorites for user:', authStore.user.uid)
    const userFavorites = await getUserFavorites(authStore.user.uid)
    console.log('Received favorites data:', userFavorites)
    favorites.value = userFavorites
    console.log('Favorites state updated:', favorites.value)
  } catch (error) {
    console.error('Error loading favorites:', error)
    ElMessage.error('Failed to load favorites')
  } finally {
    loading.value = false
  }
}

const removeFavorite = async (recipeId) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to remove this recipe from favorites?',
      'Remove Favorite',
      {
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    removingFavorites.value.push(recipeId)

    await removeFromFavorites(recipeId, authStore.user.uid)
    
    // Remove from local state
    favorites.value = favorites.value.filter(recipe => (recipe.docId || recipe.id) !== recipeId)
    
    ElMessage.success('Recipe removed from favorites')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error removing favorite:', error)
      ElMessage.error('Failed to remove favorite')
    }
  } finally {
    removingFavorites.value = removingFavorites.value.filter(id => id !== recipeId)
  }
}

const goToRecipe = (recipeId) => {
  router.push(`/recipes/${recipeId}`)
}

const getCategoryType = (category) => {
  const types = {
    breakfast: 'warning',
    lunch: 'success', 
    vegan: 'success',
    dinner: 'info'
  }
  return types[category] || 'info'
}

const getCategoryLabel = (category) => {
  const labels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    vegan: 'Vegan',
    dinner: 'Dinner'
  }
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'today'
  if (diffDays === 2) return 'yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.user-details h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.user-email {
  margin: 8px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.quick-links { display:flex; gap:10px; }

.favorites-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header .el-icon {
  color: #f39c12;
}

.count-badge {
  background: #f39c12;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.loading-container {
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: #666;
  margin: 8px 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.favorite-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.favorite-card:hover .card-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(245, 108, 108, 0.9);
  border: none;
  color: white;
}

.remove-btn:hover {
  background: #f56c6c;
}

.card-content {
  padding: 20px;
}

.recipe-title {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.recipe-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
}

.stat .el-icon {
  font-size: 1rem;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-count {
  font-size: 0.8rem;
  color: #999;
}

.favorited-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .profile-header {
    padding: 24px;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .user-details h2 {
    font-size: 1.5rem;
  }

  .favorites-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .recipe-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
