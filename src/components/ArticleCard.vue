<template>
  <div class="article-card" @click="$emit('click', article)">
    <div class="article-header">
      <div class="article-meta">
        <span class="read-time">
          <el-icon><Clock /></el-icon>
          {{ article.readTime }}
        </span>
      </div>
      <!-- removed per requirement: export icon on card -->
    </div>
    
    <div class="article-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-excerpt">{{ article.excerpt }}</p>
      
      <div class="article-tags">
        <span 
          v-for="tag in article.tags" 
          :key="tag"
          class="tag"
          :class="{ 'student-friendly': tag === 'student-friendly' || tag === 'beginner-friendly' }"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    
    <div class="article-footer">
      <div class="author-info">
        <el-icon><User /></el-icon>
        {{ article.author }}
      </div>
      <div class="publish-date">
        {{ formatDate(article.publishDate) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { Clock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineEmits(['click'])

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

// export icon removed; export only available in detail page
</script>

<style scoped>
.article-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

/* Article Header */
.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}



.read-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}



/* Article Content */
.article-content {
  margin-bottom: 1.5rem;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Tags */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.2rem 0.6rem;
  background: #f0f2f5;
  color: #666;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tag.student-friendly {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.tag:hover {
  background: #409eff;
  color: white;
}

/* Article Footer */
.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.85rem;
  color: #888;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.publish-date {
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .article-card {
    padding: 1rem;
  }
  
  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .article-meta {
    width: 100%;
    justify-content: space-between;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
