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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
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
import { useAuthStore } from '../stores/auth.js'
import { ElMessage } from 'element-plus'
import { sendEmail, buildAuthEmailTemplate } from '../services/emailService.js'
import { storage } from '../firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
const EMAIL_WEBAPP_URL = import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbztBRp0dJbw9DsFNoCL-hkeuypwsBPeVP1K35DYK8ttBTTsCSTHw4Vwa6I1sGw1cvS4Ow/exec'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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

// Export handlers (PDF to device or Email)
function handleExportCommand(cmd) {
  if (cmd === 'download') return exportToDevicePDF('a4')
  if (cmd === 'email') return exportToEmailPDF('a4')
}

const goBack = () => {
  router.go(-1)
}

const navigateToArticle = (relatedArticle) => {
  router.push(`/learn/macro/${relatedArticle.id}`)
}

// Read Aloud (Web Speech API)
const isSpeaking = ref(false)
let utterance = null

function stripHtml(html) {
  const raw = html || ''
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const d = document.createElement('div')
      d.innerHTML = raw
      const txt = d.textContent || d.innerText || ''
      return txt.replace(/\s+/g, ' ').trim()
    }
  } catch (_) {}
  // Fallback (no DOM available): strip tags via regex
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
  try {
    window.speechSynthesis?.cancel()
  } catch (_) {}
  isSpeaking.value = false
}

function toggleReadAloud() {
  if (isSpeaking.value) stopReading(); else startReading()
}

onBeforeUnmount(() => stopReading())

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

async function generatePdfFromElement(selector, { mode = 'single-native' } = {}) {
  const el = document.querySelector(selector)
  if (!el) throw new Error('Content not found')
  await ensureJsLib('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', 'html2canvas')
  await ensureJsLib('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf')
  const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const { jsPDF } = window.jspdf

  if (mode === 'single-native') {
    // Create a PDF page that matches the rendered canvas size to avoid any squash
    const pxToPt = (px) => px * 72 / 96 // assuming 96dpi
    const wPt = pxToPt(canvas.width)
    const hPt = pxToPt(canvas.height)
    const pdf = new jsPDF('p', 'pt', [wPt, hPt])
    const imgDataPNG = canvas.toDataURL('image/png')
    pdf.addImage(imgDataPNG, 'PNG', 0, 0, wPt, hPt)
    return pdf
  } else {
    // A4 multipage fallback (kept as alternative)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const imgWidth = pageWidth - margin * 2
    const imgHeight = canvas.height * imgWidth / canvas.width
    const imgDataJPEG = canvas.toDataURL('image/jpeg', 0.85) // compress for email size
    const pageContentHeight = pageHeight - margin * 2
    const totalPages = Math.ceil(imgHeight / pageContentHeight)
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()
      const y = margin - i * pageContentHeight
      pdf.addImage(imgDataJPEG, 'JPEG', margin, y, imgWidth, imgHeight)
    }
    return pdf
  }
}

async function exportToDevicePDF(mode = 'a4') {
  try {
    const pdf = await generatePdfFromElement('.article-content', { mode })
    const name = (article.value?.title || 'article').replace(/[^a-z0-9\-_]+/gi,'_') + '.pdf'
    pdf.save(name)
  } catch (e) {
    ElMessage.error('Failed to generate PDF')
  }
}

async function exportToEmailPDF(mode = 'a4') {
  try {
    const pdf = await generatePdfFromElement('.article-content', { mode })
    const arrayBuf = pdf.output('arraybuffer')
    const bytes = new Uint8Array(arrayBuf)
    // 1) Upload to Firebase Storage to avoid large email attachments
    const safeName = (article.value?.title || 'article').replace(/[^a-z0-9\-_]+/gi,'_') + '_' + Date.now() + '.pdf'
    const fileRef = storageRef(storage, `exports/${safeName}`)
    await uploadBytes(fileRef, bytes, { contentType: 'application/pdf' })
    const downloadURL = await getDownloadURL(fileRef)
    const html = buildAuthEmailTemplate({
      title: 'Article Export',
      greeting: 'Your requested export link is below.',
      contentLines: [article.value?.title || '', `Download: ${downloadURL}`]
    })
    let recipient = authStore?.user?.email || ''
    if (!recipient) recipient = prompt('Enter email address to send to:') || ''
    if (!recipient || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      ElMessage.error('Please provide a valid recipient email')
      return
    }
    const resp = await sendEmail({
      to: recipient,
      subject: `Export - ${(article.value?.title || 'Article')}`,
      html,
      // no attachment; send link only
      webAppUrl: EMAIL_WEBAPP_URL
    })
    if (!resp?.success) throw new Error(resp?.message || 'Email not configured')
    ElMessage.success('Export email sent (best-effort)')
  } catch (e) {
    ElMessage.error('Failed to send email')
  }
}

// (Removed legacy CSV export handlers; using high-quality PDF handlers above)

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
