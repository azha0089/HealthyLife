<template>
  <div class="recipe-card" @click="goToDetail">
    <!-- Recipe Image -->
    <div class="recipe-image">
      <img :src="recipe.image" :alt="recipe.title" />

      <!-- Budget Badge -->

    </div>

    <!-- Recipe Content -->
    <div class="recipe-content">
      <!-- Recipe Title -->
      <h3 class="recipe-title">{{ recipe.title }}</h3>

      <!-- Recipe Meta Info -->
      <div class="recipe-meta">
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ recipe.totalTime }} min</span>
        </div>
        <div class="meta-item">
          <el-icon><Lightning /></el-icon>
          <span>{{ recipe.calories }} cal</span>
        </div>
        <div class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ recipe.servings }} servings</span>
        </div>
      </div>

      <!-- Rating -->
      <div class="recipe-rating">
        <el-rate
          v-model="recipe.rating.average"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value}"
        />
        <span class="rating-count">({{ recipe.rating.count }})</span>
      </div>

      <!-- Tags -->
      <div class="recipe-tags">
        <el-tag
          v-for="tag in recipe.tags.slice(0, 3)"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ formatTag(tag) }}
        </el-tag>
        <el-tag
          v-if="recipe.tags.length > 3"
          size="small"
          type="info"
          effect="plain"
        >
          +{{ recipe.tags.length - 3 }}
        </el-tag>
      </div>

      <!-- Difficulty Badge -->
      <div class="difficulty-badge" :class="`difficulty-${recipe.difficulty}`">
        {{ getDifficultyLabel(recipe.difficulty) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { Clock, Lightning, User, Star, StarFilled } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Computed properties
const isFavorite = computed(() => {
  // This would check if recipe is in user's favorites
  // For now, return false - will be implemented with favorites system
  return false
})

// Methods
const goToDetail = () => {
  // Use Firestore document ID (docId) for routing
  const recipeId = props.recipe.docId || props.recipe.id
  router.push(`/recipes/${recipeId}`)
}

const toggleFavorite = () => {
  // Toggle favorite status - will be implemented with favorites system
  const recipeId = props.recipe.docId || props.recipe.id
  console.log('Toggle favorite for recipe:', recipeId)
}

const getBudgetLabel = (budget) => {
  const labels = {
    low: '$',
    medium: '$$',
    high: '$$$'
  }
  return labels[budget] || budget
}

const getDifficultyLabel = (difficulty) => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

const formatTag = (tag) => {
  return tag.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}
</script>

<style scoped>
.recipe-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recipe-card:hover .recipe-overlay {
  opacity: 1;
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #666;
}

.favorite-btn.favorited {
  color: #f56c6c;
}

.budget-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.budget-low {
  background: #52c41a;
}

.budget-medium {
  background: #faad14;
}

.budget-high {
  background: #f5222d;
}

.recipe-content {
  padding: 16px;
}

.recipe-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
  color: #999;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-count {
  color: #999;
  font-size: 12px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.difficulty-badge {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.difficulty-easy {
  background: #52c41a;
}

.difficulty-medium {
  background: #faad14;
}

.difficulty-hard {
  background: #f5222d;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .recipe-image {
    height: 160px;
  }

  .recipe-content {
    padding: 12px;
  }

  .recipe-title {
    font-size: 16px;
  }

  .recipe-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 13px;
  }
}
</style>
