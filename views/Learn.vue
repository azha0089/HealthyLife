<template>
  <div class="learn-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Learn Nutrition</h1>
        <p class="hero-subtitle">Comprehensive nutrition education for students and health enthusiasts</p>
      </div>
    </section>

    <!-- Category Navigation -->
    <section class="category-nav-section">
      <div class="category-nav">
        <router-link 
          to="/learn/macro" 
          class="category-card"
          :class="{ active: $route.path.includes('macro') }"
        >
          <div class="category-icon">
            <el-icon size="48" color="#409eff"><Operation /></el-icon>
          </div>
          <h3>Macronutrients</h3>
          <p>Proteins, Fats, and Carbohydrates</p>
          <div class="article-count">{{ macroArticles.length }} Articles</div>
        </router-link>

        <router-link 
          to="/learn/vitamins" 
          class="category-card"
          :class="{ active: $route.path.includes('vitamins') }"
        >
          <div class="category-icon">
            <el-icon size="48" color="#67c23a"><MagicStick /></el-icon>
          </div>
          <h3>Vitamins</h3>
          <p>Essential vitamins A, B, C, D, E, K</p>
          <div class="article-count">{{ vitaminArticles.length }} Articles</div>
        </router-link>
      </div>
    </section>

    <!-- Recent Articles -->
    <section class="recent-articles-section">
      <h2 class="section-title">Recent Articles</h2>
      <div class="articles-grid">
        <article-card
          v-for="article in recentArticles"
          :key="article.id"
          :article="article"
          @click="navigateToArticle(article)"
        />
      </div>
    </section>

    <!-- Popular Topics -->
    <section class="popular-topics-section">
      <h2 class="section-title">Popular Topics</h2>
      <div class="topics-grid">
        <div 
          v-for="topic in popularTopics" 
          :key="topic.id"
          class="topic-tag"
          @click="filterByTopic(topic.name)"
        >
          {{ topic.name }}
          <span class="topic-count">{{ topic.count }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Operation, MagicStick } from '@element-plus/icons-vue'
import ArticleCard from '../components/ArticleCard.vue'

const router = useRouter()

// Mock data - could be fetched from API
const articles = ref([
  {
    id: 1,
    title: "Complete Guide to Protein",
    category: "macro",
    subcategory: "protein",
    readTime: "8 min read",
    tags: ["beginner-friendly", "essential", "muscle-building"],
    excerpt: "Understanding protein requirements, sources, and timing for optimal health.",
    publishDate: "2024-01-15",
    difficulty: "beginner",
    author: "Dr. Sarah Johnson"
  },
  {
    id: 2,
    title: "Healthy Fats vs Bad Fats",
    category: "macro",
    subcategory: "fats",
    readTime: "6 min read",
    tags: ["student-friendly", "heart-health", "omega-3"],
    excerpt: "Learn to distinguish between beneficial and harmful dietary fats.",
    publishDate: "2024-01-14",
    difficulty: "beginner",
    author: "Prof. Mike Chen"
  },
  {
    id: 3,
    title: "Carbohydrates: Fuel for Your Body",
    category: "macro",
    subcategory: "carbs",
    readTime: "10 min read",
    tags: ["energy", "student-friendly", "sports-nutrition"],
    excerpt: "Complex vs simple carbs and their role in energy metabolism.",
    publishDate: "2024-01-13",
    difficulty: "intermediate",
    author: "Dr. Lisa Park"
  },
  {
    id: 4,
    title: "Vitamin C: Immunity Powerhouse",
    category: "vitamins",
    subcategory: "vitamin-c",
    readTime: "5 min read",
    tags: ["immunity", "antioxidant", "beginner-friendly"],
    excerpt: "How vitamin C boosts immunity and where to find it naturally.",
    publishDate: "2024-01-12",
    difficulty: "beginner",
    author: "Dr. Emily Davis"
  },
  {
    id: 5,
    title: "B-Complex Vitamins Explained",
    category: "vitamins",
    subcategory: "vitamin-b",
    readTime: "12 min read",
    tags: ["comprehensive", "metabolism", "student-friendly"],
    excerpt: "Complete breakdown of all B vitamins and their functions.",
    publishDate: "2024-01-11",
    difficulty: "intermediate",
    author: "Dr. Robert Kim"
  },
  {
    id: 6,
    title: "Vitamin D: The Sunshine Vitamin",
    category: "vitamins",
    subcategory: "vitamin-d",
    readTime: "7 min read",
    tags: ["bone-health", "deficiency", "beginner-friendly"],
    excerpt: "Understanding vitamin D deficiency and natural sources.",
    publishDate: "2024-01-10",
    difficulty: "beginner",
    author: "Dr. Amanda White"
  }
])

// Computed properties for filtering
const macroArticles = computed(() => 
  articles.value.filter(article => article.category === 'macro')
)

const vitaminArticles = computed(() => 
  articles.value.filter(article => article.category === 'vitamins')
)

const recentArticles = computed(() => 
  [...articles.value]
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(0, 6)
)

const popularTopics = computed(() => {
  const topics = {}
  articles.value.forEach(article => {
    article.tags.forEach(tag => {
      topics[tag] = (topics[tag] || 0) + 1
    })
  })
  
  return Object.entries(topics)
    .map(([name, count]) => ({ id: name, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

// Methods
const navigateToArticle = (article) => {
  // Navigate to article detail page (to be implemented)
  router.push(`/learn/${article.category}/${article.id}`)
}

const filterByTopic = (topic) => {
  // Navigate to filtered view (to be implemented)
  router.push(`/learn?tag=${topic}`)
}

onMounted(() => {
  console.log('Learn page mounted')
})
</script>

<style scoped>
.learn-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
  margin: -2rem -2rem 3rem -2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Category Navigation */
.category-nav-section {
  margin-bottom: 3rem;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover::before,
.category-card.active::before {
  transform: scaleX(1);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-card.active {
  border: 2px solid #409eff;
}

.category-icon {
  margin-bottom: 1rem;
}

.category-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.category-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.article-count {
  display: inline-block;
  background: #f0f2f5;
  color: #409eff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Section Titles */
.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

/* Recent Articles */
.recent-articles-section {
  margin-bottom: 3rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Popular Topics */
.popular-topics-section {
  margin-bottom: 3rem;
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #333;
}

.topic-tag:hover {
  background: #409eff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.topic-count {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    margin: -1rem -1rem 2rem -1rem;
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .category-nav {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .category-card {
    padding: 1.5rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .topics-grid {
    gap: 0.75rem;
  }
  
  .topic-tag {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
