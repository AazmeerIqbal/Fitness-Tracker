export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: string;
  activityLevel: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  distance?: number;
}

export interface Workout {
  id?: number;
  userId?: number;
  name: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  notes: string;
  category: string;
  caloriesBurned: number;
}

export interface Food {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionEntry {
  id?: number;
  userId?: number;
  date: string;
  meal: string;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface ProgressData {
  date: string;
  weight: number;
  bodyFat: number;
  muscle: number;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  avgWorkoutDuration: number;
  recentWorkouts: Workout[];
  recentNutrition: NutritionEntry[];
}

export interface AuthResponse {
  token: string;
  user: User;
}