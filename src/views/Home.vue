<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to HealthyLife</h1>
        <p class="hero-subtitle">Discover the perfect platform for healthy eating and lifestyle</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/learn/macro')">
            <el-icon><Reading /></el-icon>
            Start Learning
          </el-button>
          <el-button size="large" @click="$router.push('/recipes/breakfast')">
            <el-icon><ForkSpoon /></el-icon>
            Browse Recipes
          </el-button>
        </div>
      </div>
    </section>

    <!-- Today's Recommendations -->
    <section class="recommendations-section">
      <h2 class="section-title">Today's Recommendations</h2>
      <div class="recipe-cards-grid">
        <div 
          v-for="recipe in todayRecommendations" 
          :key="recipe.id" 
          class="recipe-card"
          @click="navigateToRecipe(recipe)"
        >
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.title" />
            <div class="recipe-category">{{ recipe.category }}</div>
          </div>
          <div class="recipe-content">
            <h3 class="recipe-title">{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            <div class="recipe-meta">
              <span class="prep-time">
                <el-icon><Clock /></el-icon>
                {{ recipe.prepTime }}
              </span>
              <span class="difficulty">
                <el-icon><Star /></el-icon>
                {{ recipe.difficulty }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Access -->
    <section class="quick-access-section">
      <h2 class="section-title">Quick Access</h2>
      <div class="quick-access-grid">
        <el-button 
          type="primary" 
          size="large" 
          class="access-button"
          @click="$router.push('/learn/macro')"
        >
          <el-icon><Operation /></el-icon>
          <span>Macro Nutrients</span>
        </el-button>
        
        <el-button 
          type="success" 
          size="large" 
          class="access-button"
          @click="$router.push('/recipes/breakfast')"
        >
          <el-icon><Sunrise /></el-icon>
          <span>Breakfast Recipes</span>
        </el-button>
        
        <el-button 
          type="info" 
          size="large" 
          class="access-button"
          @click="$router.push('/events')"
        >
          <el-icon><Calendar /></el-icon>
          <span>Events</span>
        </el-button>
      </div>
    </section>

    <!-- Platform Features -->
    <section class="features-section">
      <h2 class="section-title">Platform Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon size="48" color="#67c23a"><Reading /></el-icon>
          </div>
          <h3>Nutrition Learning</h3>
          <p>Deep dive into macronutrients and vitamins with their roles and importance</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon size="48" color="#e6a23c"><ForkSpoon /></el-icon>
          </div>
          <h3>Healthy Recipes</h3>
          <p>Rich collection of breakfast, lunch and vegan recipes for different needs</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon size="48" color="#409eff"><Calendar /></el-icon>
          </div>
          <h3>Activity Updates</h3>
          <p>Join healthy lifestyle activities and community discussions</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Reading, 
  ForkSpoon, 
  Calendar, 
  Operation, 
  Sunrise, 
  Clock, 
  Star 
} from '@element-plus/icons-vue'

const router = useRouter()

// Today's recipe recommendations data
const todayRecommendations = ref([
  {
    id: 1,
    title: "Avocado Toast Supreme",
    description: "Nutritious breakfast with avocado, eggs, and whole grain bread",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: "15 min",
    difficulty: "Easy",
    route: "/recipes/breakfast"
  },
  {
    id: 2,
    title: "Quinoa Power Bowl",
    description: "Protein-rich lunch bowl with quinoa, vegetables, and tahini sauce",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "Lunch",
    prepTime: "25 min",
    difficulty: "Medium",
    route: "/recipes/lunch"
  },
  {
    id: 3,
    title: "Green Smoothie Boost",
    description: "Vitamin-packed vegan smoothie with spinach, banana, and chia seeds",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    category: "Vegan",
    prepTime: "10 min",
    difficulty: "Easy",
    route: "/recipes/vegan"
  }
])

// Navigate to recipe detail or category page
const navigateToRecipe = (recipe) => {
  router.push(recipe.route)
}

// Component lifecycle
onMounted(() => {
  // Could fetch recommendations from API or Firestore here
  console.log('Home component mounted')
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
  margin: -2rem -2rem 3rem -2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Section Titles */
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

/* Today's Recommendations Section */
.recommendations-section {
  margin-bottom: 3rem;
}

.recipe-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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

.recipe-category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.recipe-content {
  padding: 1.5rem;
}

.recipe-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.recipe-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
}

.prep-time, .difficulty {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Quick Access Section */
.quick-access-section {
  margin-bottom: 3rem;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.access-button {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.access-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.access-button .el-icon {
  font-size: 1.5rem;
}

/* Platform Features Section */
.features-section {
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    margin: -1rem -1rem 2rem -1rem;
    padding: 3rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .recipe-cards-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .quick-access-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .access-button {
    height: 60px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .recipe-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .recipe-content {
    padding: 1rem;
  }
}
</style>
