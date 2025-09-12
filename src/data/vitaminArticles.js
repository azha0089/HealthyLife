// Shared vitamin articles data


export  const vitaminArticles = [
  {
    // 基本信息
    id: 1,
    title: "Avocado Toast",
    category: "breakfast",
    image: "/api/placeholder/400/300",

    // 时间和营养信息
    prepTime: "10 mins",
    totalTime: "15 mins",
    calories: 320,
    servings: 2,

    // 筛选字段
    budget: "low",
    difficulty: "easy",
    tags: ["healthy", "quick", "vegetarian"],

    // 食材列表（简化）
    ingredients: [
      {
        name: "Bread slices",
        amount: "2",
        unit: "pieces"
      },
      {
        name: "Avocado",
        amount: "1",
        unit: "medium"
      },
      {
        name: "Salt",
        amount: "1",
        unit: "pinch"
      },
      {
        name: "Black pepper",
        amount: "1",
        unit: "pinch"
      }
    ],

    // 制作步骤（简化）
    steps: [
      "Toast the bread slices until golden brown.",
      "Mash the avocado in a bowl with salt and pepper.",
      "Spread the mashed avocado evenly over the toast.",
      "Sprinkle with chili flakes if desired. Serve immediately."
    ],

    // 营养信息（简化）
    nutrition: {
      protein: "10g",
      carbs: "30g",
      fat: "20g"
    },

    // 评分信息（手动维护，简化版）
    rating: {
      average: 4.5,
      count: 8
    },

    // 元数据
    author: "Chef Sarah",
    createdAt: "2025-08-25"
  },

  {
    // 基本信息
    id: 2,
    title: "Greek Yogurt Parfait",
    category: "breakfast",
    image: "/api/placeholder/400/300",

    // 时间和营养信息
    prepTime: "5 mins",
    totalTime: "5 mins",
    calories: 280,
    servings: 1,

    // 筛选字段
    budget: "medium",
    difficulty: "easy",
    tags: ["healthy", "protein-rich", "vegetarian", "quick"],

    // 食材列表（简化）
    ingredients: [
      {
        name: "Greek yogurt",
        amount: "1",
        unit: "cup"
      },
      {
        name: "Mixed berries",
        amount: "1/2",
        unit: "cup"
      },
      {
        name: "Granola",
        amount: "2",
        unit: "tablespoons"
      },
      {
        name: "Honey",
        amount: "1",
        unit: "tablespoon"
      }
    ],

    // 制作步骤（简化）
    steps: [
      "Add half of the yogurt to a glass or bowl.",
      "Layer with half of the berries and granola.",
      "Repeat layers with remaining yogurt, berries, and granola.",
      "Drizzle with honey and serve immediately."
    ],

    // 营养信息（简化）
    nutrition: {
      protein: "20g",
      carbs: "25g",
      fat: "8g"
    },

    // 评分信息（手动维护，简化版）
    rating: {
      average: 4.7,
      count: 15
    },

    // 元数据
    author: "Chef Maria",
    createdAt: "2025-08-20"
  },

  {
    // 基本信息
    id: 3,
    title: "Mediterranean Quinoa Bowl",
    category: "lunch",
    image: "/api/placeholder/400/300",

    // 时间和营养信息
    prepTime: "15 mins",
    totalTime: "25 mins",
    calories: 450,
    servings: 2,

    // 筛选字段
    budget: "medium",
    difficulty: "medium",
    tags: ["healthy", "mediterranean", "vegetarian", "gluten-free"],

    // 食材列表（简化）
    ingredients: [
      {
        name: "Quinoa",
        amount: "1",
        unit: "cup"
      },
      {
        name: "Cherry tomatoes",
        amount: "1",
        unit: "cup"
      },
      {
        name: "Cucumber",
        amount: "1",
        unit: "medium"
      },
      {
        name: "Feta cheese",
        amount: "1/2",
        unit: "cup"
      },
      {
        name: "Olive oil",
        amount: "2",
        unit: "tablespoons"
      },
      {
        name: "Lemon juice",
        amount: "2",
        unit: "tablespoons"
      }
    ],

    // 制作步骤（简化）
    steps: [
      "Cook quinoa according to package instructions and let cool.",
      "Dice cucumber and halve cherry tomatoes.",
      "In a large bowl, combine quinoa, tomatoes, and cucumber.",
      "Add crumbled feta cheese on top.",
      "Whisk olive oil and lemon juice together and drizzle over bowl.",
      "Season with salt and pepper, toss gently and serve."
    ],

    // 营养信息（简化）
    nutrition: {
      protein: "18g",
      carbs: "45g",
      fat: "15g"
    },

    // 评分信息（手动维护，简化版）
    rating: {
      average: 4.3,
      count: 22
    },

    // 元数据
    author: "Chef Alex",
    createdAt: "2025-08-18"
  },

  {
    // 基本信息
    id: 4,
    title: "Asian Lettuce Wraps",
    category: "lunch",
    image: "/api/placeholder/400/300",

    // 时间和营养信息
    prepTime: "20 mins",
    totalTime: "30 mins",
    calories: 350,
    servings: 3,

    // 筛选字段
    budget: "medium",
    difficulty: "medium",
    tags: ["asian", "low-carb", "fresh", "healthy"],

    // 食材列表（简化）
    ingredients: [
      {
        name: "Ground chicken",
        amount: "1",
        unit: "pound"
      },
      {
        name: "Butter lettuce",
        amount: "1",
        unit: "head"
      },
      {
        name: "Soy sauce",
        amount: "3",
        unit: "tablespoons"
      },
      {
        name: "Sesame oil",
        amount: "1",
        unit: "tablespoon"
      },
      {
        name: "Green onions",
        amount: "2",
        unit: "stalks"
      },
      {
        name: "Ginger",
        amount: "1",
        unit: "tablespoon minced"
      }
    ],

    // 制作步骤（简化）
    steps: [
      "Separate lettuce leaves and wash thoroughly.",
      "Heat sesame oil in a large pan over medium-high heat.",
      "Cook ground chicken, breaking it up as it cooks.",
      "Add soy sauce and minced ginger, cook for 2 more minutes.",
      "Remove from heat and stir in chopped green onions.",
      "Serve chicken mixture in lettuce cups."
    ],

    // 营养信息（简化）
    nutrition: {
      protein: "25g",
      carbs: "8g",
      fat: "12g"
    },

    // 评分信息（手动维护，简化版）
    rating: {
      average: 4.6,
      count: 31
    },

    // 元数据
    author: "Chef Kim",
    createdAt: "2025-08-15"
  },

  {
    // 基本信息
    id: 5,
    title: "Rainbow Buddha Bowl",
    category: "vegan",
    image: "/api/placeholder/400/300",

    // 时间和营养信息
    prepTime: "25 mins",
    totalTime: "40 mins",
    calories: 520,
    servings: 2,

    // 筛选字段
    budget: "high",
    difficulty: "hard",
    tags: ["vegan", "colorful", "nutritious", "plant-based", "gluten-free"],

    // 食材列表（简化）
    ingredients: [
      {
        name: "Sweet potato",
        amount: "1",
        unit: "large"
      },
      {
        name: "Chickpeas",
        amount: "1",
        unit: "can"
      },
      {
        name: "Kale",
        amount: "2",
        unit: "cups chopped"
      },
      {
        name: "Red cabbage",
        amount: "1",
        unit: "cup shredded"
      },
      {
        name: "Carrots",
        amount: "2",
        unit: "medium"
      },
      {
        name: "Tahini",
        amount: "3",
        unit: "tablespoons"
      },
      {
        name: "Lemon juice",
        amount: "2",
        unit: "tablespoons"
      }
    ],

    // 制作步骤（简化）
    steps: [
      "Preheat oven to 400°F and cube sweet potato.",
      "Drain and rinse chickpeas, toss with oil and spices.",
      "Roast sweet potato and chickpeas for 25 minutes.",
      "Massage kale with a little oil and lemon juice.",
      "Shred cabbage and julienne carrots.",
      "Make tahini dressing by mixing tahini, lemon juice, and water.",
      "Arrange all components in bowls and drizzle with dressing."
    ],

    // 营养信息（简化）
    nutrition: {
      protein: "16g",
      carbs: "65g",
      fat: "18g"
    },

    // 评分信息（手动维护，简化版）
    rating: {
      average: 4.8,
      count: 42
    },

    // 元数据
    author: "Chef Emma",
    createdAt: "2025-08-10"
  }
];

