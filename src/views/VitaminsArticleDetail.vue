<template>
  <div class="vitamins-article-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" size="48"><Loading /></el-icon>
      <p>Loading vitamin article...</p>
    </div>

    <!-- Article Not Found -->
    <div v-else-if="!article" class="not-found-container">
      <el-icon size="64" color="#d9d9d9"><Delete /></el-icon>
      <h2>Vitamin Article Not Found</h2>
      <p>The vitamin article you're looking for doesn't exist or may have been removed.</p>
      <el-button type="primary" @click="goBack">Go Back</el-button>
    </div>

    <!-- Article Content -->
    <div v-else class="article-content">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/learn">Learn</router-link>
        <el-icon><ArrowRight /></el-icon>
        <router-link to="/learn/vitamins">Vitamins</router-link>
        <el-icon><ArrowRight /></el-icon>
        <span>{{ article.title }}</span>
      </div>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-meta">
          <span class="vitamin-type-badge" :class="article.subcategory">
            {{ getVitaminTypeName(article.subcategory) }}
          </span>
          <span class="specific-vitamin-badge" :class="article.vitaminType">
            {{ getSpecificVitaminName(article.vitaminType) }}
          </span>
          <span class="read-time">
            <el-icon><Clock /></el-icon>
            {{ article.readTime }}
          </span>
          <span class="publish-date">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(article.publishDate) }}
          </span>
          <span class="importance-score">
            <el-icon><Star /></el-icon>
            Importance: {{ article.importance }}/100
          </span>
        </div>
        
        <div class="article-actions">
          <el-button :type="isSpeaking ? 'warning' : 'success'" @click="toggleReadAloud" aria-label="Read Aloud">{{ isSpeaking ? 'Stop' : 'Read Aloud' }}</el-button>
          <el-dropdown @command="handleExportCommand">
            <el-button type="primary" plain>
              <el-icon style="margin-right:6px;"><Download /></el-icon>
              Export
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="download">Download PDF</el-dropdown-item>
                <el-dropdown-item divided command="email">Send to Email</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            Back to Vitamins
          </el-button>
        </div>
      </header>

      <!-- Article Title and Author -->
      <div class="title-section">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="author-section">
          <el-icon><User /></el-icon>
          <span class="author-name">{{ article.author }}</span>
          <span class="author-title">Nutrition & Vitamin Expert</span>
        </div>
      </div>

      <!-- Article Tags -->
      <div class="tags-section">
        <span 
          v-for="tag in article.tags" 
          :key="tag"
          class="tag"
          :class="{ 
            'student-friendly': tag === 'student-friendly' || tag === 'beginner-friendly',
            'essential': tag === 'essential' || tag === 'immunity',
            'deficiency': tag === 'deficiency'
          }"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Vitamin Overview Card -->
      <div class="vitamin-overview-card">
        <h2>Vitamin Overview</h2>
        <div class="overview-grid">
          <div class="overview-item">
            <strong>Type:</strong>
            <span>{{ getVitaminTypeName(article.subcategory) }}</span>
          </div>
          <div class="overview-item">
            <strong>Solubility:</strong>
            <span>{{ article.subcategory === 'fat-soluble' ? 'Fat-Soluble' : 'Water-Soluble' }}</span>
          </div>
          <div class="overview-item">
            <strong>Storage:</strong>
            <span>{{ article.subcategory === 'fat-soluble' ? 'Stored in body fat and liver' : 'Not stored, needs daily intake' }}</span>
          </div>
          <div class="overview-item">
            <strong>Deficiency Risk:</strong>
            <span>{{ getDeficiencyRisk(article.vitaminType) }}</span>
          </div>
        </div>
      </div>

      <!-- Article Body -->
      <div class="article-body">
        <div class="excerpt-section">
          <h2>Key Points</h2>
          <p class="article-excerpt">{{ article.excerpt }}</p>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div v-html="getArticleContent()" class="content-html"></div>
        </div>

        <!-- Vitamin-specific Quick Facts -->
        <div class="vitamin-facts-section">
          <h2>Quick Facts</h2>
          <div class="facts-grid">
            <div class="fact-item">
              <h4>Daily Requirements</h4>
              <p>{{ getVitaminDailyRequirement(article.vitaminType) }}</p>
            </div>
            <div class="fact-item">
              <h4>Best Food Sources</h4>
              <p>{{ getVitaminSources(article.vitaminType) }}</p>
            </div>
            <div class="fact-item">
              <h4>Main Functions</h4>
              <p>{{ getVitaminFunctions(article.vitaminType) }}</p>
            </div>
            <div class="fact-item">
              <h4>Deficiency Symptoms</h4>
              <p>{{ getDeficiencySymptoms(article.vitaminType) }}</p>
            </div>
          </div>
        </div>

        <!-- Related Vitamins -->
        <div class="related-section">
          <h2>Related Vitamin Articles</h2>
          <div class="related-articles">
            <div 
              v-for="relatedArticle in relatedArticles" 
              :key="relatedArticle.id"
              class="related-item"
              @click="navigateToArticle(relatedArticle)"
            >
              <div class="related-header">
                <span class="related-vitamin-badge" :class="relatedArticle.vitaminType">
                  {{ getSpecificVitaminName(relatedArticle.vitaminType) }}
                </span>
                <span class="related-importance">{{ relatedArticle.importance }}/100</span>
              </div>
              <h4>{{ relatedArticle.title }}</h4>
              <p>{{ relatedArticle.excerpt.substring(0, 100) }}...</p>
              <div class="related-meta">
                <span class="read-time">{{ relatedArticle.readTime }}</span>
                <span class="vitamin-type">{{ getVitaminTypeName(relatedArticle.subcategory) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth.js'
import { 
  ArrowRight, 
  Clock, 
  Calendar, 
  Download, 
  ArrowLeft, 
  User, 
  Loading,
  Delete,
  Star
} from '@element-plus/icons-vue'
import { 
  getVitaminArticleById, 
  getRelatedVitaminArticles 
} from '../services/vitaminService.js'
import { sendEmail, buildAuthEmailTemplate } from '../services/emailService.js'
const EMAIL_WEBAPP_URL = import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbztBRp0dJbw9DsFNoCL-hkeuypwsBPeVP1K35DYK8ttBTTsCSTHw4Vwa6I1sGw1cvS4Ow/exec'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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
    console.log('🔍 Fetching vitamin article with ID:', articleId)
    const foundArticle = await getVitaminArticleById(articleId)
    console.log('📄 Found vitamin article:', foundArticle)
    
    if (foundArticle) {
      article.value = foundArticle
      
      // Get related articles
      const relatedData = await getRelatedVitaminArticles(foundArticle, 3)
      relatedArticles.value = relatedData
    } else {
      ElMessage.error('Vitamin article not found')
    }
  } catch (error) {
    console.error('Error fetching vitamin article:', error)
    ElMessage.error('Failed to load vitamin article. Please try again.')
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

const getVitaminTypeName = (subcategory) => {
  const names = {
    'fat-soluble': 'Fat-Soluble',
    'water-soluble': 'Water-Soluble'
  }
  return names[subcategory] || 'Vitamin'
}

const getSpecificVitaminName = (vitaminType) => {
  const names = {
    'vitamin-c': 'Vitamin C',
    'vitamin-b': 'B-Complex',
    'vitamin-b9': 'Folate (B9)',
    'vitamin-b12': 'Vitamin B12',
    'vitamin-b1': 'Thiamine (B1)',
    'vitamin-d': 'Vitamin D',
    'vitamin-a': 'Vitamin A',
    'vitamin-e': 'Vitamin E',
    'vitamin-k': 'Vitamin K'
  }
  return names[vitaminType] || 'Vitamin'
}

const getVitaminDailyRequirement = (vitaminType) => {
  const requirements = {
    'vitamin-c': 'Adults: 65-90mg daily',
    'vitamin-b': 'Varies by individual B vitamin',
    'vitamin-b9': 'Adults: 400mcg daily',
    'vitamin-b12': 'Adults: 2.4mcg daily',
    'vitamin-d': 'Adults: 600-800 IU daily',
    'vitamin-a': 'Men: 900mcg, Women: 700mcg daily',
    'vitamin-e': 'Adults: 15mg daily'
  }
  return requirements[vitaminType] || 'Consult healthcare provider'
}

const getVitaminSources = (vitaminType) => {
  const sources = {
    'vitamin-c': 'Citrus fruits, berries, bell peppers, broccoli',
    'vitamin-b': 'Whole grains, meat, eggs, dairy, leafy greens',
    'vitamin-b9': 'Leafy greens, legumes, fortified grains',
    'vitamin-b12': 'Animal products, fortified foods',
    'vitamin-d': 'Sunlight, fatty fish, fortified dairy',
    'vitamin-a': 'Liver, carrots, sweet potatoes, spinach',
    'vitamin-e': 'Nuts, seeds, vegetable oils, leafy greens'
  }
  return sources[vitaminType] || 'Various food sources'
}

const getVitaminFunctions = (vitaminType) => {
  const functions = {
    'vitamin-c': 'Immunity, collagen synthesis, antioxidant',
    'vitamin-b': 'Energy metabolism, nervous system support',
    'vitamin-b9': 'DNA synthesis, red blood cell formation',
    'vitamin-b12': 'Nervous system, red blood cell formation',
    'vitamin-d': 'Bone health, calcium absorption, immunity',
    'vitamin-a': 'Vision, immune function, cell growth',
    'vitamin-e': 'Antioxidant protection, cell membrane health'
  }
  return functions[vitaminType] || 'Essential body functions'
}

const getDeficiencySymptoms = (vitaminType) => {
  const symptoms = {
    'vitamin-c': 'Scurvy, fatigue, poor wound healing',
    'vitamin-b': 'Fatigue, confusion, muscle weakness',
    'vitamin-b9': 'Anemia, poor growth, birth defects',
    'vitamin-b12': 'Pernicious anemia, nerve damage',
    'vitamin-d': 'Rickets, osteomalacia, muscle weakness',
    'vitamin-a': 'Night blindness, dry skin, infections',
    'vitamin-e': 'Muscle weakness, vision problems'
  }
  return symptoms[vitaminType] || 'Various symptoms possible'
}

const getDeficiencyRisk = (vitaminType) => {
  const risks = {
    'vitamin-c': 'Low in developed countries',
    'vitamin-b': 'Moderate, varies by specific vitamin',
    'vitamin-b9': 'High in pregnancy, moderate otherwise',
    'vitamin-b12': 'High in vegans and elderly',
    'vitamin-d': 'Very high in northern climates',
    'vitamin-a': 'Low in developed countries',
    'vitamin-e': 'Low with adequate diet'
  }
  return risks[vitaminType] || 'Consult healthcare provider'
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
  router.push('/learn/vitamins')
}

const navigateToArticle = (relatedArticle) => {
  router.push(`/learn/vitamins/${relatedArticle.id}`)
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
  if (article.value?.title) parts.push(article.value.title)
  if (article.value?.excerpt) parts.push(article.value.excerpt)
  const body = stripHtml(getArticleContent())
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

// Export handlers
function handleExportCommand(cmd) {
  if (cmd === 'download') return exportToDevicePDF('a4')
  if (cmd === 'email') return emailCurrentPageLink()
}

async function ensureJsLib(src, globalKey) {
  if (globalKey && window[globalKey]) return window[globalKey]
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
  return globalKey ? window[globalKey] : null
}

async function generatePdfFromElement(selector, { mode = 'a4' } = {}) {
  const el = document.querySelector(selector)
  if (!el) throw new Error('Content not found')
  await ensureJsLib('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', 'html2canvas')
  await ensureJsLib('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf')
  const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')
  const { jsPDF } = window.jspdf
  if (mode === 'single-native') {
    const pxToPt = (px) => px * 72 / 96
    const wPt = pxToPt(canvas.width)
    const hPt = pxToPt(canvas.height)
    const pdf = new jsPDF('p', 'pt', [wPt, hPt])
    pdf.addImage(imgData, 'PNG', 0, 0, wPt, hPt)
    return pdf
  } else {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const imgWidth = pageWidth - margin * 2
    const imgHeight = canvas.height * imgWidth / canvas.width
    const pageContentHeight = pageHeight - margin * 2
    const totalPages = Math.ceil(imgHeight / pageContentHeight)
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()
      const y = margin - i * pageContentHeight
      pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight)
    }
    return pdf
  }
}

async function exportToDevicePDF(mode = 'a4') {
  try {
    const pdf = await generatePdfFromElement('.article-content', { mode })
    const name = (article.value?.title || 'vitamin').replace(/[^a-z0-9\-_]+/gi,'_') + '.pdf'
    pdf.save(name)
  } catch (e) {
    ElMessage.error('Failed to generate PDF')
  }
}

async function emailCurrentPageLink() {
  try {
    const pageUrl = window.location.href
    const html = buildAuthEmailTemplate({
      title: 'Vitamin Article Link',
      greeting: 'Here is the link to your requested vitamin article:',
      contentLines: [article.value?.title || '', `Link: ${pageUrl}`]
    })
    let recipient = authStore?.user?.email || ''
    if (!recipient) recipient = prompt('Enter email address to send to:') || ''
    if (!recipient || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      ElMessage.error('Please provide a valid recipient email')
      return
    }
    await sendEmail({
      to: recipient,
      subject: `Vitamin Article - ${(article.value?.title || 'Article')}`,
      html,
      webAppUrl: EMAIL_WEBAPP_URL
    })
    ElMessage.success('Export email sent (best-effort)')
  } catch (e) {
    ElMessage.error('Failed to send email')
  }
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
.vitamins-article-detail-page {
  min-height: 100vh;
  max-width: 900px;
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
  color: #67c23a;
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
  color: #67c23a;
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

.vitamin-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vitamin-type-badge.fat-soluble {
  background: #fff8e1;
  color: #f57c00;
}

.vitamin-type-badge.water-soluble {
  background: #e8f5e8;
  color: #388e3c;
}

.specific-vitamin-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
}

.read-time, .publish-date, .importance-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.importance-score {
  color: #f39c12;
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

.tag.essential {
  background: #fff2e8;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.tag.deficiency {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

/* Vitamin Overview Card */
.vitamin-overview-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border-left: 4px solid #67c23a;
}

.vitamin-overview-card h2 {
  margin-bottom: 1.5rem;
  color: #67c23a;
  font-size: 1.5rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overview-item strong {
  color: #333;
  font-weight: 600;
}

.overview-item span {
  color: #666;
  font-size: 0.9rem;
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
  color: #67c23a;
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
  border-bottom: 2px solid #67c23a;
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
  color: #67c23a;
}

/* Vitamin Facts Section */
.vitamin-facts-section {
  background: #fafafa;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.vitamin-facts-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.fact-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.fact-item h4 {
  margin-bottom: 0.75rem;
  color: #67c23a;
  font-size: 1rem;
}

.fact-item p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
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
  border-color: #67c23a;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.related-vitamin-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
}

.related-importance {
  font-size: 0.8rem;
  color: #f39c12;
  font-weight: 600;
}

.related-item h4 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1rem;
}

.related-item p {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
}

.vitamin-type {
  background: #f0f2f5;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vitamins-article-detail-page {
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
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .facts-grid {
    grid-template-columns: 1fr;
  }
  
  .related-articles {
    grid-template-columns: 1fr;
  }
}
</style>
