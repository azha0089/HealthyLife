// Shared recipe data
export const recipes = [
  // Breakfast Recipes
  {
    id: 1,
    title: "Avocado Toast with Poached Egg",
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
    prepTime: 15,
    cookTime: 10,
    totalTime: 25,
    servings: 2,
    calories: 320,
    budget: "low", // low, medium, high
    difficulty: "easy", // easy, medium, hard
    tags: ["protein-rich", "healthy-fats", "vegetarian", "quick"],
    rating: {
      average: 4.8,
      count: 156
    },
    ingredients: [
      { name: "Whole grain bread", amount: "2", unit: "slices" },
      { name: "Ripe avocado", amount: "1", unit: "large" },
      { name: "Eggs", amount: "2", unit: "pieces" },
      { name: "Lemon juice", amount: "1", unit: "tbsp" },
      { name: "Salt", amount: "1/2", unit: "tsp" },
      { name: "Black pepper", amount: "1/4", unit: "tsp" },
      { name: "Red pepper flakes", amount: "1/4", unit: "tsp" },
      { name: "Olive oil", amount: "1", unit: "tsp" }
    ],
    instructions: [
      "Fill a medium saucepan with water and bring to a gentle simmer.",
      "Toast the bread slices until golden brown.",
      "While bread is toasting, mash the avocado with lemon juice, salt, and pepper.",
      "Create a whirlpool in the simmering water and carefully drop in the eggs one at a time.",
      "Poach eggs for 3-4 minutes until whites are set but yolks are still runny.",
      "Spread avocado mixture on toast, top with poached eggs.",
      "Sprinkle with red pepper flakes and drizzle with olive oil.",
      "Serve immediately while eggs are warm."
    ],
    nutrition: {
      calories: 320,
      protein: 14,
      carbs: 28,
      fat: 18,
      fiber: 12,
      sugar: 3
    },
    tips: [
      "Use day-old bread for better toasting results",
      "Add white vinegar to poaching water for better egg whites",
      "Choose ripe but firm avocados for best texture"
    ]
  },
  {
    id: 2,
    title: "Overnight Oats with Berries",
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400",
    prepTime: 10,
    cookTime: 0,
    totalTime: 10,
    servings: 1,
    calories: 280,
    budget: "low",
    difficulty: "easy",
    tags: ["no-cook", "make-ahead", "fiber-rich", "vegan-option"],
    rating: {
      average: 4.6,
      count: 203
    },
    ingredients: [
      { name: "Rolled oats", amount: "1/2", unit: "cup" },
      { name: "Almond milk", amount: "1/2", unit: "cup" },
      { name: "Chia seeds", amount: "1", unit: "tbsp" },
      { name: "Maple syrup", amount: "1", unit: "tbsp" },
      { name: "Vanilla extract", amount: "1/2", unit: "tsp" },
      { name: "Mixed berries", amount: "1/2", unit: "cup" },
      { name: "Sliced almonds", amount: "2", unit: "tbsp" }
    ],
    instructions: [
      "In a jar or container, combine oats, almond milk, chia seeds, maple syrup, and vanilla.",
      "Stir well to combine all ingredients.",
      "Cover and refrigerate overnight or for at least 4 hours.",
      "In the morning, stir the oats and add more milk if needed.",
      "Top with fresh berries and sliced almonds.",
      "Enjoy cold or warm up in microwave for 30 seconds if preferred."
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 9,
      fiber: 11,
      sugar: 18
    },
    tips: [
      "Prepare multiple jars for the week",
      "Add protein powder for extra protein",
      "Try different fruit combinations"
    ]
  },

  // Lunch Recipes
  {
    id: 3,
    title: "Mediterranean Quinoa Bowl",
    category: "lunch",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    prepTime: 20,
    cookTime: 15,
    totalTime: 35,
    servings: 2,
    calories: 420,
    budget: "medium",
    difficulty: "easy",
    tags: ["gluten-free", "vegetarian", "high-protein", "mediterranean"],
    rating: {
      average: 4.7,
      count: 189
    },
    ingredients: [
      { name: "Quinoa", amount: "1", unit: "cup" },
      { name: "Cherry tomatoes", amount: "1", unit: "cup" },
      { name: "Cucumber", amount: "1", unit: "medium" },
      { name: "Red onion", amount: "1/4", unit: "cup" },
      { name: "Kalamata olives", amount: "1/4", unit: "cup" },
      { name: "Feta cheese", amount: "1/2", unit: "cup" },
      { name: "Olive oil", amount: "3", unit: "tbsp" },
      { name: "Lemon juice", amount: "2", unit: "tbsp" },
      { name: "Fresh herbs", amount: "1/4", unit: "cup" }
    ],
    instructions: [
      "Rinse quinoa and cook according to package directions.",
      "While quinoa cooks, chop all vegetables.",
      "Make dressing by whisking olive oil, lemon juice, salt, and pepper.",
      "Let quinoa cool slightly, then fluff with a fork.",
      "Combine quinoa with vegetables, olives, and feta.",
      "Toss with dressing and fresh herbs.",
      "Serve at room temperature or chilled."
    ],
    nutrition: {
      calories: 420,
      protein: 16,
      carbs: 52,
      fat: 18,
      fiber: 6,
      sugar: 8
    },
    tips: [
      "Toast quinoa before cooking for nuttier flavor",
      "Can be made ahead and stored for 3 days",
      "Add grilled chicken for extra protein"
    ]
  },
  {
    id: 4,
    title: "Asian Lettuce Wraps",
    category: "lunch",
    image: "https://images.unsplash.com/photo-1559847844-d2c4d11e0e06?w=400",
    prepTime: 15,
    cookTime: 10,
    totalTime: 25,
    servings: 4,
    calories: 180,
    budget: "medium",
    difficulty: "medium",
    tags: ["low-carb", "gluten-free", "fresh", "asian-inspired"],
    rating: {
      average: 4.5,
      count: 142
    },
    ingredients: [
      { name: "Ground turkey", amount: "1", unit: "lb" },
      { name: "Butter lettuce", amount: "1", unit: "head" },
      { name: "Water chestnuts", amount: "1/2", unit: "cup" },
      { name: "Green onions", amount: "3", unit: "stalks" },
      { name: "Garlic", amount: "3", unit: "cloves" },
      { name: "Ginger", amount: "1", unit: "tbsp" },
      { name: "Soy sauce", amount: "3", unit: "tbsp" },
      { name: "Sesame oil", amount: "1", unit: "tbsp" },
      { name: "Rice vinegar", amount: "1", unit: "tbsp" }
    ],
    instructions: [
      "Separate lettuce leaves and wash thoroughly.",
      "Heat oil in a large skillet over medium-high heat.",
      "Add ground turkey and cook until browned.",
      "Add garlic and ginger, cook for 1 minute.",
      "Stir in water chestnuts, soy sauce, sesame oil, and vinegar.",
      "Cook for 2-3 minutes until heated through.",
      "Serve turkey mixture in lettuce cups.",
      "Garnish with green onions and serve immediately."
    ],
    nutrition: {
      calories: 180,
      protein: 22,
      carbs: 8,
      fat: 7,
      fiber: 2,
      sugar: 4
    },
    tips: [
      "Use iceberg lettuce for extra crunch",
      "Add sriracha for heat",
      "Can substitute ground chicken or pork"
    ]
  },

  // Vegan Recipes
  {
    id: 5,
    title: "Creamy Cashew Alfredo Pasta",
    category: "vegan",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    calories: 380,
    budget: "medium",
    difficulty: "medium",
    tags: ["vegan", "dairy-free", "creamy", "comfort-food"],
    rating: {
      average: 4.9,
      count: 267
    },
    ingredients: [
      { name: "Whole wheat pasta", amount: "12", unit: "oz" },
      { name: "Raw cashews", amount: "1", unit: "cup" },
      { name: "Nutritional yeast", amount: "1/4", unit: "cup" },
      { name: "Garlic", amount: "3", unit: "cloves" },
      { name: "Lemon juice", amount: "2", unit: "tbsp" },
      { name: "Vegetable broth", amount: "1", unit: "cup" },
      { name: "Olive oil", amount: "2", unit: "tbsp" },
      { name: "Fresh basil", amount: "1/4", unit: "cup" },
      { name: "Salt and pepper", amount: "to taste", unit: "" }
    ],
    instructions: [
      "Soak cashews in hot water for 15 minutes, then drain.",
      "Cook pasta according to package directions.",
      "In a blender, combine cashews, nutritional yeast, garlic, lemon juice, and broth.",
      "Blend until completely smooth and creamy.",
      "Heat olive oil in a large pan over medium heat.",
      "Add the cashew sauce and simmer for 5 minutes.",
      "Toss with cooked pasta and fresh basil.",
      "Season with salt and pepper to taste."
    ],
    nutrition: {
      calories: 380,
      protein: 14,
      carbs: 58,
      fat: 12,
      fiber: 8,
      sugar: 4
    },
    tips: [
      "Soak cashews overnight for creamier texture",
      "Add steamed broccoli for extra nutrition",
      "Store leftover sauce in fridge for 5 days"
    ]
  },
  {
    id: 6,
    title: "Rainbow Buddha Bowl",
    category: "vegan",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    prepTime: 25,
    cookTime: 20,
    totalTime: 45,
    servings: 2,
    calories: 450,
    budget: "medium",
    difficulty: "easy",
    tags: ["vegan", "gluten-free", "colorful", "nutrient-dense"],
    rating: {
      average: 4.6,
      count: 198
    },
    ingredients: [
      { name: "Quinoa", amount: "1", unit: "cup" },
      { name: "Sweet potato", amount: "1", unit: "large" },
      { name: "Chickpeas", amount: "1", unit: "can" },
      { name: "Kale", amount: "2", unit: "cups" },
      { name: "Red cabbage", amount: "1", unit: "cup" },
      { name: "Avocado", amount: "1", unit: "medium" },
      { name: "Tahini", amount: "3", unit: "tbsp" },
      { name: "Lemon juice", amount: "2", unit: "tbsp" },
      { name: "Maple syrup", amount: "1", unit: "tbsp" }
    ],
    instructions: [
      "Preheat oven to 400°F and cook quinoa according to package directions.",
      "Cube sweet potato and roast for 20 minutes until tender.",
      "Drain and rinse chickpeas, then roast with sweet potato for last 10 minutes.",
      "Massage kale with a little olive oil and lemon juice.",
      "Make tahini dressing by whisking tahini, lemon juice, maple syrup, and water.",
      "Assemble bowls with quinoa as base.",
      "Top with roasted vegetables, massaged kale, cabbage, and avocado.",
      "Drizzle with tahini dressing before serving."
    ],
    nutrition: {
      calories: 450,
      protein: 16,
      carbs: 68,
      fat: 16,
      fiber: 15,
      sugar: 12
    },
    tips: [
      "Prep ingredients ahead for quick assembly",
      "Add hemp seeds for extra protein",
      "Vary vegetables based on season"
    ]
  }
];

// Recipe categories
export const recipeCategories = [
  { id: 'breakfast', name: 'Breakfast', icon: 'sunrise' },
  { id: 'lunch', name: 'Lunch', icon: 'sunny' },
  { id: 'vegan', name: 'Vegan', icon: 'orange' }
];

// Filter options
export const filterOptions = {
  budget: [
    { value: 'low', label: 'Low ($)', color: '#52c41a' },
    { value: 'medium', label: 'Medium ($$)', color: '#faad14' },
    { value: 'high', label: 'High ($$$)', color: '#f5222d' }
  ],
  difficulty: [
    { value: 'easy', label: 'Easy', color: '#52c41a' },
    { value: 'medium', label: 'Medium', color: '#faad14' },
    { value: 'hard', label: 'Hard', color: '#f5222d' }
  ],
  time: [
    { value: 'quick', label: 'Under 30 min', max: 30 },
    { value: 'medium', label: '30-60 min', min: 30, max: 60 },
    { value: 'long', label: 'Over 60 min', min: 60 }
  ],
  calories: [
    { value: 'low', label: 'Under 300', max: 300 },
    { value: 'medium', label: '300-500', min: 300, max: 500 },
    { value: 'high', label: 'Over 500', min: 500 }
  ]
};

// Popular tags
export const popularTags = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 
  'high-protein', 'quick', 'make-ahead', 'comfort-food', 'healthy-fats'
];

// Helper functions
export const getRecipesByCategory = (category) => {
  return recipes.filter(recipe => recipe.category === category);
};

export const getRecipeById = (id) => {
  return recipes.find(recipe => recipe.id === parseInt(id));
};

export const filterRecipes = (recipes, filters) => {
  return recipes.filter(recipe => {
    // Budget filter
    if (filters.budget && filters.budget.length > 0) {
      if (!filters.budget.includes(recipe.budget)) return false;
    }
    
    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) return false;
    }
    
    // Time filter
    if (filters.time && filters.time.length > 0) {
      const timeMatch = filters.time.some(timeFilter => {
        const option = filterOptions.time.find(opt => opt.value === timeFilter);
        if (option.max && recipe.totalTime > option.max) return false;
        if (option.min && recipe.totalTime < option.min) return false;
        return true;
      });
      if (!timeMatch) return false;
    }
    
    // Calories filter
    if (filters.calories && filters.calories.length > 0) {
      const calorieMatch = filters.calories.some(calorieFilter => {
        const option = filterOptions.calories.find(opt => opt.value === calorieFilter);
        if (option.max && recipe.calories > option.max) return false;
        if (option.min && recipe.calories < option.min) return false;
        return true;
      });
      if (!calorieMatch) return false;
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => recipe.tags.includes(tag));
      if (!hasTag) return false;
    }
    
    return true;
  });
};

export const searchRecipes = (recipes, searchTerm) => {
  if (!searchTerm) return recipes;
  
  const term = searchTerm.toLowerCase();
  return recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(term) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(term)) ||
    recipe.ingredients.some(ing => ing.name.toLowerCase().includes(term))
  );
};
