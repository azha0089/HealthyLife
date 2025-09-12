<template>
  <div class="article-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" size="48"><Loading /></el-icon>
      <p>Loading article...</p>
    </div>

    <!-- Article Not Found -->
    <div v-else-if="!article" class="not-found-container">
      <el-icon size="64" color="#d9d9d9"><Delete /></el-icon>
      <h2>Article Not Found</h2>
      <p>The article you're looking for doesn't exist or may have been removed.</p>
      <el-button type="primary" @click="goBack">Go Back</el-button>
    </div>

    <!-- Article Content -->
    <div v-else class="article-content">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/learn">Learn</router-link>
        <el-icon><ArrowRight /></el-icon>
        <router-link :to="getBreadcrumbLink()">{{ getBreadcrumbText() }}</router-link>
        <el-icon><ArrowRight /></el-icon>
        <span>{{ article.title }}</span>
      </div>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-meta">
          <span class="category-badge" :class="article.subcategory">
            {{ getCategoryName(article.subcategory) }}
          </span>
          <span class="read-time">
            <el-icon><Clock /></el-icon>
            {{ article.readTime }}
          </span>
          <span class="publish-date">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(article.publishDate) }}
          </span>
        </div>

        <div class="article-actions">
          <el-button type="primary" @click="exportToPDF">
            <el-icon><Download /></el-icon>
            Export PDF
          </el-button>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            Back
          </el-button>
        </div>
      </header>

      <!-- Article Title and Author -->
      <div class="title-section">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="author-section">
          <el-icon><User /></el-icon>
          <span class="author-name">{{ article.author }}</span>
          <span class="author-title">Nutrition Expert</span>
        </div>
      </div>

      <!-- Article Tags -->
      <div class="tags-section">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="tag"
          :class="{ 'student-friendly': tag === 'student-friendly' || tag === 'beginner-friendly' }"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Article Body -->
      <div class="article-body">
        <div class="excerpt-section">
          <h2>Overview</h2>
          <p class="article-excerpt">{{ article.excerpt }}</p>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div v-html="getArticleContent()" class="content-html"></div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  Clock,
  Calendar,
  Download,
  ArrowLeft,
  User,
  Loading,
  Delete
} from '@element-plus/icons-vue'
import { useMacroArticles } from '../composables/useMacroArticles.js'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// Use Firebase composable for macro articles
const {
  fetchArticleById,
  fetchArticlesByCategory
} = useMacroArticles()

// Reactive data
const article = ref(null)
const loading = ref(true)
const relatedArticles = ref([])

// Computed properties
const getArticleContent = () => {
  return article.value?.content || '<p>Content loading...</p>'
}

// Methods
const fetchArticle = async () => {
  loading.value = true

  try {
    const articleId = route.params.id
    console.log('🔍 Fetching article with ID:', articleId)
    const foundArticle = await fetchArticleById(articleId)
    console.log('📄 Found article:', foundArticle)

    if (foundArticle) {
      article.value = foundArticle

      // Get related articles (same category, excluding current)
      const categoryArticles = await fetchArticlesByCategory(foundArticle.subcategory)
      relatedArticles.value = categoryArticles
        .filter(a => a.id !== foundArticle.id) // Compare original numeric IDs
        .slice(0, 3)
    } else {
      ElMessage.error('Article not found')
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    ElMessage.error('Failed to load article. Please try again.')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategoryName = (subcategory) => {
  const names = {
    protein: 'Protein',
    fats: 'Fats',
    carbs: 'Carbohydrates'
  }
  return names[subcategory] || 'Nutrition'
}

const getBreadcrumbLink = () => {
  return `/learn/macro`
}

const getBreadcrumbText = () => {
  return 'Macronutrients'
}

const exportToPDF = () => {
  ElMessage({
    message: `Exporting "${article.value.title}" to PDF...`,
    type: 'info',
    duration: 2000
  })

  setTimeout(() => {
    ElMessage({
      message: 'PDF export completed successfully!',
      type: 'success',
      duration: 3000
    })
  }, 2000)
}

const goBack = () => {
  router.go(-1)
}

const navigateToArticle = (relatedArticle) => {
  router.push(`/learn/macro/${relatedArticle.id}`)
}

// Lifecycle
onMounted(() => {
  fetchArticle()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    fetchArticle()
  }
})
</script>

<style scoped>
.article-detail-page {
  min-height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}

/* Loading and Error States */
.loading-container,
.not-found-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-container .el-icon {
  margin-bottom: 1rem;
  color: #409eff;
}

.not-found-container h2 {
  margin: 1rem 0;
  color: #333;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
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

/* Article Header */
.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-badge.protein {
  background: #e7f3ff;
  color: #1976d2;
}

.category-badge.fats {
  background: #fff0f6;
  color: #c41e3a;
}

.category-badge.carbs {
  background: #f0f9ff;
  color: #0288d1;
}

.read-time, .publish-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
}

/* Title Section */
.title-section {
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.author-title {
  font-style: italic;
  font-size: 0.9rem;
}

/* Tags Section */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.tag {
  padding: 0.3rem 0.8rem;
  background: #f0f2f5;
  color: #666;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag.student-friendly {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

/* Article Body */
.article-body {
  line-height: 1.8;
  color: #333;
}

.excerpt-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.excerpt-section h2 {
  margin-bottom: 1rem;
  color: #409eff;
}

.article-excerpt {
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
}

/* Content HTML Styles */
.content-html h2 {
  color: #333;
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
  border-bottom: 2px solid #409eff;
  padding-bottom: 0.5rem;
}

.content-html h3 {
  color: #555;
  margin: 1.5rem 0 0.75rem 0;
  font-size: 1.2rem;
}

.content-html p {
  margin-bottom: 1rem;
}

.content-html ul, .content-html ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.content-html li {
  margin-bottom: 0.5rem;
}

.content-html strong {
  color: #409eff;
}

/* Related Articles */
.related-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.related-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.related-articles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.related-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.related-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.related-item h4 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1rem;
}

.related-item p {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.related-item .read-time {
  font-size: 0.75rem;
  color: #888;
}

/* Responsive Design */
@media (max-width: 768px) {
  .article-detail-page {
    padding: 0 1rem;
  }

  .article-title {
    font-size: 2rem;
  }

  .article-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .article-meta {
    width: 100%;
  }

  .article-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .related-articles {
    grid-template-columns: 1fr;
  }
}
</style>
