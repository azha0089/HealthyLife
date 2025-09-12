<template>
  <div class="recipe-filter">
    <!-- Search Bar -->
    <div class="search-section">
      <el-input
        v-model="localFilters.search"
        placeholder="Search recipes, ingredients, or tags..."
        prefix-icon="Search"
        clearable
        size="large"
        @input="handleSearchChange"
      />
    </div>

    <!-- Filter Toggles -->
    <div class="filter-toggles">
      <el-button
        :type="showFilters ? 'primary' : 'default'"
        @click="showFilters = !showFilters"
        :icon="showFilters ? 'ArrowUp' : 'ArrowDown'"
      >
        Filters
        <span v-if="activeFilterCount > 0" class="filter-count">
          ({{ activeFilterCount }})
        </span>
      </el-button>
      
      <el-button
        v-if="activeFilterCount > 0"
        type="danger"
        plain
        @click="clearAllFilters"
        icon="Delete"
      >
        Clear All
      </el-button>
    </div>

    <!-- Expandable Filters -->
    <el-collapse-transition>
      <div v-show="showFilters" class="filter-panels">
        <!-- Budget Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Budget</h4>
          <div class="filter-options">
            <el-checkbox-group v-model="localFilters.budget" @change="emitFilters">
              <el-checkbox 
                v-for="option in filterOptions.budget" 
                :key="option.value"
                :label="option.value"
              >
                <span class="budget-option" :style="{ color: option.color }">
                  {{ option.label }}
                </span>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- Time Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Cooking Time</h4>
          <div class="filter-options">
            <el-checkbox-group v-model="localFilters.time" @change="emitFilters">
              <el-checkbox 
                v-for="option in filterOptions.time" 
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- Calories Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Calories</h4>
          <div class="filter-options">
            <el-checkbox-group v-model="localFilters.calories" @change="emitFilters">
              <el-checkbox 
                v-for="option in filterOptions.calories" 
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- Difficulty Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Difficulty</h4>
          <div class="filter-options">
            <el-checkbox-group v-model="localFilters.difficulty" @change="emitFilters">
              <el-checkbox 
                v-for="option in filterOptions.difficulty" 
                :key="option.value"
                :label="option.value"
              >
                <span class="difficulty-option" :style="{ color: option.color }">
                  {{ option.label }}
                </span>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- Tags Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Popular Tags</h4>
          <div class="filter-options tags-options">
            <el-checkbox-group v-model="localFilters.tags" @change="emitFilters">
              <el-checkbox 
                v-for="tag in popularTags" 
                :key="tag"
                :label="tag"
                class="tag-checkbox"
              >
                {{ formatTag(tag) }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </el-collapse-transition>

    <!-- Active Filters Display -->
    <div v-if="activeFilterCount > 0" class="active-filters">
      <h5>Active Filters:</h5>
      <div class="active-filter-tags">
        <!-- Budget tags -->
        <el-tag 
          v-for="budget in localFilters.budget" 
          :key="`budget-${budget}`"
          closable
          @close="removeFilter('budget', budget)"
          type="success"
        >
          Budget: {{ getBudgetLabel(budget) }}
        </el-tag>
        
        <!-- Time tags -->
        <el-tag 
          v-for="time in localFilters.time" 
          :key="`time-${time}`"
          closable
          @close="removeFilter('time', time)"
          type="warning"
        >
          Time: {{ getTimeLabel(time) }}
        </el-tag>
        
        <!-- Calories tags -->
        <el-tag 
          v-for="calorie in localFilters.calories" 
          :key="`calories-${calorie}`"
          closable
          @close="removeFilter('calories', calorie)"
          type="info"
        >
          Calories: {{ getCalorieLabel(calorie) }}
        </el-tag>
        
        <!-- Difficulty tags -->
        <el-tag 
          v-for="difficulty in localFilters.difficulty" 
          :key="`difficulty-${difficulty}`"
          closable
          @close="removeFilter('difficulty', difficulty)"
          type="danger"
        >
          {{ formatTag(difficulty) }}
        </el-tag>
        
        <!-- Tag tags -->
        <el-tag 
          v-for="tag in localFilters.tags" 
          :key="`tag-${tag}`"
          closable
          @close="removeFilter('tags', tag)"
        >
          {{ formatTag(tag) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { filterOptions, popularTags } from '../services/recipeService.js'
import { Search, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      search: '',
      budget: [],
      time: [],
      calories: [],
      difficulty: [],
      tags: [],
      category: ''
    })
  }
})

// Emits
const emit = defineEmits(['update:filters'])

// Reactive data
const showFilters = ref(false)
const localFilters = reactive({
  search: '',
  budget: [],
  time: [],
  calories: [],
  difficulty: [],
  tags: [],
  category: ''
})

// Computed properties
const activeFilterCount = computed(() => {
  return localFilters.budget.length + 
         localFilters.time.length + 
         localFilters.calories.length + 
         localFilters.difficulty.length + 
         localFilters.tags.length +
         (localFilters.category ? 1 : 0)
})

// Watch for prop changes
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { immediate: true, deep: true })

// Methods
const emitFilters = () => {
  emit('update:filters', { ...localFilters })
}

const handleSearchChange = () => {
  emitFilters()
}

const clearAllFilters = () => {
  localFilters.search = ''
  localFilters.budget = []
  localFilters.time = []
  localFilters.calories = []
  localFilters.difficulty = []
  localFilters.tags = []
  localFilters.category = ''
  emitFilters()
}

const removeFilter = (type, value) => {
  const index = localFilters[type].indexOf(value)
  if (index > -1) {
    localFilters[type].splice(index, 1)
    emitFilters()
  }
}

const formatTag = (tag) => {
  return tag.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getBudgetLabel = (budget) => {
  const option = filterOptions.budget.find(opt => opt.value === budget)
  return option ? option.label : budget
}

const getTimeLabel = (time) => {
  const option = filterOptions.time.find(opt => opt.value === time)
  return option ? option.label : time
}

const getCalorieLabel = (calorie) => {
  const option = filterOptions.calories.find(opt => opt.value === calorie)
  return option ? option.label : calorie
}
</script>

<style scoped>
.recipe-filter {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 16px;
}

.filter-toggles {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-count {
  color: #409eff;
  font-weight: 600;
}

.filter-panels {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.filter-title {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-options .el-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.tag-checkbox {
  margin-right: 0;
}

.budget-option,
.difficulty-option {
  font-weight: 500;
}

.active-filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.active-filters h5 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.active-filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .recipe-filter {
    padding: 16px;
  }
  
  .filter-panels {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-toggles {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tags-options .el-checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>
