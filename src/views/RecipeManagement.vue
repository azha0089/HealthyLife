<template>
  <div class="recipe-management">
    <div class="page-header">
      <div class="header-left">
        <h2>Recipe Management</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">Admin</el-breadcrumb-item>
          <el-breadcrumb-item>Recipe Management</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddRecipeDialog">
          <el-icon><Plus /></el-icon>
          Add Recipe
        </el-button>
        <el-button @click="refreshRecipes">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </div>

    <!-- Search and filter section -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-input
            v-model="searchQuery"
            placeholder="Search recipes..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-select
            v-model="filterCategory"
            placeholder="Filter by category"
            clearable
            @change="handleCategoryFilter"
            style="width: 100%"
          >
            <el-option label="All" value="" />
            <el-option label="Breakfast" value="breakfast" />
            <el-option label="Lunch" value="lunch" />
            <el-option label="Vegan" value="vegan" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- Recipe table -->
    <el-card class="table-card">
      <el-table
        :data="filteredRecipes"
        :loading="loading"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column label="Image" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.image]"
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Title" min-width="200" sortable />
        <el-table-column prop="category" label="Category" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getCategoryTagType(row.category)"
            >
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalTime" label="Time (min)" width="120" sortable />
        <el-table-column prop="calories" label="Calories" width="120" sortable />
        <el-table-column prop="difficulty" label="Difficulty" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getDifficultyTagType(row.difficulty)"
            >
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Rating" width="180">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-rate
                v-model="row.rating.average"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="info"
              @click="viewRecipeDetail(row)"
            >
              View
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="showEditDialog(row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirmDeleteRecipe(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecipes"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Batch actions -->
    <div v-if="selectedRecipes.length > 0" class="batch-actions">
      <el-alert
        :title="`Selected ${selectedRecipes.length} recipes`"
        type="info"
        show-icon
        :closable="false"
      />
      <div class="batch-buttons">
        <el-button size="small" type="danger" @click="handleBatchDeleteRecipes">
          Batch Delete
        </el-button>
      </div>
    </div>

    <!-- Add/Edit Recipe Dialog -->
    <el-dialog
      v-model="recipeDialogVisible"
      :title="isEditMode ? 'Edit Recipe' : 'Add New Recipe'"
      width="70%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="recipeFormRef"
        :model="recipeForm"
        :rules="recipeFormRules"
        label-width="120px"
        label-position="top"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="Basic Info" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Title" prop="title">
                  <el-input v-model="recipeForm.title" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Category" prop="category">
                  <el-select v-model="recipeForm.category" style="width: 100%">
                    <el-option label="Breakfast" value="breakfast" />
                    <el-option label="Lunch" value="lunch" />
                    <el-option label="Vegan" value="vegan" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Prep Time (min)" prop="prepTime">
                  <el-input-number v-model="recipeForm.prepTime" :min="0" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Cook Time (min)" prop="cookTime">
                  <el-input-number v-model="recipeForm.cookTime" :min="0" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Servings" prop="servings">
                  <el-input-number v-model="recipeForm.servings" :min="1" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Calories" prop="calories">
                  <el-input-number v-model="recipeForm.calories" :min="0" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Difficulty" prop="difficulty">
                  <el-select v-model="recipeForm.difficulty" style="width: 100%">
                    <el-option label="Easy" value="easy" />
                    <el-option label="Medium" value="medium" />
                    <el-option label="Hard" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Budget" prop="budget">
                  <el-select v-model="recipeForm.budget" style="width: 100%">
                    <el-option label="Low" value="low" />
                    <el-option label="Medium" value="medium" />
                    <el-option label="High" value="high" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="Image URL" prop="image">
              <el-input v-model="recipeForm.image" />
              <div v-if="recipeForm.image" class="image-preview">
                <el-image
                  :src="recipeForm.image"
                  style="width: 100px; height: 100px; border-radius: 4px"
                  fit="cover"
                />
              </div>
            </el-form-item>

            <el-form-item label="Tags" prop="tags">
              <el-select
                v-model="recipeForm.tags"
                multiple
                filterable
                allow-create
                default-first-option
                style="width: 100%"
                placeholder="Add or select tags"
              >
                <el-option
                  v-for="tag in availableTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="Ingredients" name="ingredients">
            <div v-for="(ingredient, index) in recipeForm.ingredients" :key="index" class="ingredient-item">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item :label="`Ingredient ${index + 1}`" :prop="`ingredients.${index}.name`" :rules="{ required: true, message: 'Please enter ingredient name', trigger: 'blur' }">
                    <el-input v-model="ingredient.name" placeholder="Ingredient name" />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="Amount" :prop="`ingredients.${index}.amount`">
                    <el-input v-model="ingredient.amount" placeholder="Amount" />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="Unit" :prop="`ingredients.${index}.unit`">
                    <el-input v-model="ingredient.unit" placeholder="Unit" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="ingredient-actions">
                  <el-button type="danger" icon="Delete" circle @click="removeIngredient(index)" />
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" @click="addIngredient">Add Ingredient</el-button>
          </el-tab-pane>

          <el-tab-pane label="Instructions" name="steps">
            <div v-for="(instruction, index) in recipeForm.steps" :key="index" class="instruction-item">
              <el-row :gutter="10">
                <el-col :span="22">
                  <el-form-item :label="`Step ${index + 1}`" :prop="`steps.${index}`" :rules="{ required: true, message: 'Please enter instruction', trigger: 'blur' }">
                    <el-input v-model="recipeForm.steps[index]" type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="instruction-actions">
                  <el-button type="danger" icon="Delete" circle @click="removeInstruction(index)" />
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" @click="addInstruction">Add Instruction</el-button>
          </el-tab-pane>

          <el-tab-pane label="Nutrition" name="nutrition">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Calories" prop="nutrition.calories">
                  <el-input-number v-model="recipeForm.nutrition.calories" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Protein (g)" prop="nutrition.protein">
                  <el-input-number v-model="recipeForm.nutrition.protein" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Carbs (g)" prop="nutrition.carbs">
                  <el-input-number v-model="recipeForm.nutrition.carbs" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Fat (g)" prop="nutrition.fat">
                  <el-input-number v-model="recipeForm.nutrition.fat" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Fiber (g)" prop="nutrition.fiber">
                  <el-input-number v-model="recipeForm.nutrition.fiber" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Sugar (g)" prop="nutrition.sugar">
                  <el-input-number v-model="recipeForm.nutrition.sugar" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="Tips" name="tips">
            <div v-for="(tip, index) in recipeForm.tips" :key="index" class="tip-item">
              <el-row :gutter="10">
                <el-col :span="22">
                  <el-form-item :label="`Tip ${index + 1}`" :prop="`tips.${index}`">
                    <el-input v-model="recipeForm.tips[index]" type="textarea" :rows="2" placeholder="Enter cooking tip or advice" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="tip-actions">
                  <el-button type="danger" icon="Delete" circle @click="removeTip(index)" />
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" @click="addTip">Add Tip</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">Cancel</el-button>
          <el-button type="primary" @click="handleSaveRecipe" :loading="saveLoading">
            {{ isEditMode ? 'Save Changes' : 'Add Recipe' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, Picture, Delete, Edit, ForkSpoon
} from '@element-plus/icons-vue'
import {
  getAllRecipes,
  getRecipesByCategory,
  getRecipeById,
  filterRecipes,
  searchRecipes,
  popularTags,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  batchDeleteRecipes
} from '../services/recipeService.js'

const router = useRouter()
const loading = ref(false)
const recipes = ref([])
const selectedRecipes = ref([])
const searchQuery = ref('')
const filterCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecipes = ref(0)
const availableTags = ref(popularTags)

// Recipe form dialog
const recipeDialogVisible = ref(false)
const recipeFormRef = ref(null)
const isEditMode = ref(false)
const activeTab = ref('basic')
const saveLoading = ref(false)

// Recipe form data
const recipeForm = reactive({
  id: null,
  docId: null, // Firestore document ID
  title: '',
  category: 'breakfast',
  image: '',
  prepTime: 10,
  cookTime: 0,
  totalTime: 10,
  servings: 1,
  calories: 0,
  budget: 'low',
  difficulty: 'easy',
  tags: [],
  rating: {
    average: 0,
    count: 0
  },
  ingredients: [
    { name: '', amount: '', unit: '' }
  ],
  steps: [''],
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  },
  tips: []
})

// Form validation rules
const recipeFormRules = {
  title: [
    { required: true, message: 'Please enter recipe title', trigger: 'blur' }
  ],
  category: [
    { required: true, message: 'Please select a category', trigger: 'change' }
  ],
  image: [
    { required: true, message: 'Please enter image URL', trigger: 'blur' }
  ]
}

// Computed properties
const filteredRecipes = computed(() => {
  let result = [...recipes.value]

  // Apply search filter
  if (searchQuery.value) {
    result = searchRecipes(result, searchQuery.value)
  }

  // Apply category filter
  if (filterCategory.value) {
    result = result.filter(recipe => recipe.category === filterCategory.value)
  }

  // Calculate total for pagination
  totalRecipes.value = result.length

  // Apply pagination
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return result.slice(startIndex, endIndex)
})

// Fetch recipes
const fetchRecipes = async () => {
  try {
    loading.value = true
    let fetchedRecipes = []

    if (filterCategory.value && filterCategory.value !== '') {
      // Fetch recipes by category
      console.log(`Fetching recipes by category: is is is  ${filterCategory.value}`)
      fetchedRecipes = await getRecipesByCategory(filterCategory.value)
    } else {
      // Fetch all recipes
      fetchedRecipes = await getAllRecipes()
    }

    // Ensure each recipe has the required structure
    recipes.value = fetchedRecipes.map(recipe => ({
      ...recipe,
      // Ensure Firestore document ID is preserved
      docId: recipe.docId || recipe.id,
      // Ensure rating structure
      rating: recipe.rating || { average: 0, count: 0 },
      // Ensure arrays exist
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      tags: recipe.tags || [],
      tips: recipe.tips || [],
      // Ensure nutrition object
      nutrition: recipe.nutrition || {
        calories: recipe.calories || 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      }
    }))

    totalRecipes.value = recipes.value.length
    console.log(`Loaded ${recipes.value.length} recipes`)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    ElMessage.error(`Failed to load recipes: ${error.message}`)
    recipes.value = []
  } finally {
    loading.value = false
  }
}

// Refresh recipes
const refreshRecipes = () => {
  fetchRecipes()
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1 // Reset pagination when searching
}

// Handle category filter
const handleCategoryFilter = () => {
  currentPage.value = 1 // Reset pagination when filtering
  fetchRecipes()
}

// Handle pagination
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// Handle selection change
const handleSelectionChange = (selection) => {
  selectedRecipes.value = selection
}

// Show add recipe dialog
const showAddRecipeDialog = () => {
  isEditMode.value = false
  resetRecipeForm()
  recipeDialogVisible.value = true
}

// View recipe detail
const viewRecipeDetail = (recipe) => {
  // Use Firestore document ID (docId) for routing
  const recipeId = recipe.docId || recipe.id
  router.push(`/recipes/${recipeId}`)
}

// Show edit recipe dialog
const showEditDialog = (recipe) => {
  isEditMode.value = true
  resetRecipeForm()

  // Store the Firestore document ID
  recipeForm.docId = recipe.docId || recipe.id
  recipeForm.id = recipe.id || recipe.docId

  // Populate basic info
  recipeForm.title = recipe.title || ''
  recipeForm.category = recipe.category || 'breakfast'
  recipeForm.image = recipe.image || ''
  recipeForm.prepTime = recipe.prepTime || 15
  recipeForm.cookTime = recipe.cookTime || 15
  recipeForm.totalTime = recipe.totalTime || (recipe.prepTime + recipe.cookTime) || 30
  recipeForm.servings = recipe.servings || 2
  recipeForm.calories = recipe.calories || 0
  recipeForm.budget = recipe.budget || 'low'
  recipeForm.difficulty = recipe.difficulty || 'easy'

  // Populate arrays
  recipeForm.tags = Array.isArray(recipe.tags) ? [...recipe.tags] : []
  recipeForm.ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map(ing => ({
        name: ing.name || '',
        amount: ing.amount || '',
        unit: ing.unit || ''
      }))
    : [{ name: '', amount: '', unit: '' }]
  recipeForm.steps = Array.isArray(recipe.steps )
    ? [...recipe.steps ]
    : ['']
  recipeForm.tips = Array.isArray(recipe.tips) ? [...recipe.tips] : []

  // Populate rating
  recipeForm.rating = {
    average: recipe.rating?.average || 0,
    count: recipe.rating?.count || 0
  }

  // Populate nutrition
  recipeForm.nutrition = {
    calories: recipe.nutrition?.calories || recipe.calories || 0,
    protein: recipe.nutrition?.protein || 0,
    carbs: recipe.nutrition?.carbs || 0,
    fat: recipe.nutrition?.fat || 0,
    fiber: recipe.nutrition?.fiber || 0,
    sugar: recipe.nutrition?.sugar || 0
  }

  // Ensure tips is properly populated
  recipeForm.tips = Array.isArray(recipe.tips) ? [...recipe.tips] : []

  console.log('Editing recipe:', recipeForm)
  recipeDialogVisible.value = true
}

// Reset recipe form
const resetRecipeForm = () => {
  recipeForm.id = null
  recipeForm.docId = null
  recipeForm.title = ''
  recipeForm.category = 'breakfast'
  recipeForm.image = ''
  recipeForm.prepTime = 10
  recipeForm.cookTime = 0
  recipeForm.totalTime = 10
  recipeForm.servings = 1
  recipeForm.calories = 0
  recipeForm.budget = 'low'
  recipeForm.difficulty = 'easy'
  recipeForm.tags = []
  recipeForm.rating = { average: 0, count: 0 }
  recipeForm.ingredients = [{ name: '', amount: '', unit: '' }]
  recipeForm.steps  = ['']
  recipeForm.nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  }
  recipeForm.tips = []

  activeTab.value = 'basic'

  // Clear validation
  if (recipeFormRef.value) {
    recipeFormRef.value.clearValidate()
  }
}

// Handle dialog close
const handleDialogClose = () => {
  recipeDialogVisible.value = false
  resetRecipeForm()
}

// Handle save recipe
const handleSaveRecipe = async () => {
  if (!recipeFormRef.value) return

  try {
    const valid = await recipeFormRef.value.validate()
    if (!valid) return

    saveLoading.value = true

    // Calculate total time
    recipeForm.totalTime = recipeForm.prepTime + recipeForm.cookTime

    // Update nutrition calories to match main calories
    recipeForm.nutrition.calories = recipeForm.calories

    // Clean up empty instructions and ingredients
    const cleanInstructions = recipeForm.steps .filter(inst => inst.trim() !== '')
    const cleanIngredients = recipeForm.ingredients.filter(ing => ing.name.trim() !== '')

    // Prepare recipe data
    const recipeData = {
      title: recipeForm.title,
      category: recipeForm.category,
      image: recipeForm.image,
      prepTime: recipeForm.prepTime,
      cookTime: recipeForm.cookTime,
      totalTime: recipeForm.totalTime,
      servings: recipeForm.servings,
      calories: recipeForm.calories,
      budget: recipeForm.budget,
      difficulty: recipeForm.difficulty,
      tags: recipeForm.tags,
      rating: recipeForm.rating,
      ingredients: cleanIngredients.length > 0 ? cleanIngredients : [{ name: '', amount: '', unit: '' }],
      steps : cleanInstructions.length > 0 ? cleanInstructions : [''],
      nutrition: recipeForm.nutrition,
      tips: recipeForm.tips
    }

    if (isEditMode.value && recipeForm.docId) {
      // Update existing recipe
      await updateRecipe(recipeForm.docId, recipeData)
      ElMessage.success('Recipe updated successfully')
    } else {
      // Add new recipe
      await addRecipe(recipeData)
      ElMessage.success('Recipe added successfully')
    }

    // Close dialog and refresh data
    recipeDialogVisible.value = false
    fetchRecipes()
  } catch (error) {
    console.error('Error saving recipe:', error)
    ElMessage.error(`Failed to save recipe: ${error.message}`)
  } finally {
    saveLoading.value = false
  }
}

// Confirm delete recipe
const confirmDeleteRecipe = async (recipe) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete recipe "${recipe.title}"? This operation cannot be undone.`,
      'Delete Recipe',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    // Delete from Firestore
    const docId = recipe.docId || recipe.id
    if (docId) {
      await deleteRecipe(docId)
      ElMessage.success(`Recipe "${recipe.title}" deleted successfully`)

      // Refresh data
      fetchRecipes()
    } else {
      ElMessage.error('Cannot delete recipe: missing document ID')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting recipe:', error)
      ElMessage.error(`Failed to delete recipe: ${error.message}`)
    }
  }
}

// Batch delete recipes
const handleBatchDeleteRecipes = async () => {
  if (selectedRecipes.value.length === 0) {
    ElMessage.warning('Please select recipes to delete')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedRecipes.value.length} selected recipes? This operation cannot be undone.`,
      'Batch Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    // Extract document IDs
    const docIds = selectedRecipes.value.map(recipe => recipe.docId || recipe.id).filter(id => id)

    if (docIds.length > 0) {
      // Batch delete from Firestore
      await batchDeleteRecipes(docIds)
      ElMessage.success(`${docIds.length} recipes deleted successfully`)

      // Clear selection and refresh data
      selectedRecipes.value = []
      fetchRecipes()
    } else {
      ElMessage.error('Cannot delete recipes: missing document IDs')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error batch deleting recipes:', error)
      ElMessage.error(`Failed to delete recipes: ${error.message}`)
    }
  }
}

// Add ingredient field
const addIngredient = () => {
  recipeForm.ingredients.push({ name: '', amount: '', unit: '' })
}

// Remove ingredient field
const removeIngredient = (index) => {
  if (recipeForm.ingredients.length > 1) {
    recipeForm.ingredients.splice(index, 1)
  } else {
    ElMessage.warning('Recipe must have at least one ingredient')
  }
}

// Add instruction field
const addInstruction = () => {
  recipeForm.steps .push('')
}

// Remove instruction field
const removeInstruction = (index) => {
  if (recipeForm.steps .length > 1) {
    recipeForm.steps.splice(index, 1)
  } else {
    ElMessage.warning('Recipe must have at least one instruction')
  }
}

// Add tip field
const addTip = () => {
  recipeForm.tips.push('')
}

// Remove tip field
const removeTip = (index) => {
  recipeForm.tips.splice(index, 1)
}

// Get category tag type
const getCategoryTagType = (category) => {
  switch (category) {
    case 'breakfast': return 'success'
    case 'lunch': return 'warning'
    case 'vegan': return 'info'
    default: return ''
  }
}

// Get difficulty tag type
const getDifficultyTagType = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return ''
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchRecipes()
})
</script>

<style scoped>
.recipe-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-section {
  margin-bottom: 24px;
}

.table-card {
  margin-bottom: 24px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 24px;
}

.batch-buttons {
  display: flex;
  gap: 12px;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.image-preview {
  margin-top: 8px;
}

.ingredient-item, .instruction-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ebeef5;
}

.ingredient-actions, .instruction-actions, .tip-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 20px;
}

.tip-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ebeef5;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    margin-top: 16px;
  }

  .filter-section .el-col {
    margin-bottom: 16px;
  }
}
</style>
