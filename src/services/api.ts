import axios from 'axios';
import type { User, Workout, NutritionEntry, ProgressData, DashboardStats, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (userData: any): Promise<AuthResponse> =>
    api.post('/auth/register', userData).then(res => res.data),
};

// Profile API
export const profileAPI = {
  getProfile: (): Promise<User> =>
    api.get('/profile').then(res => res.data),
  
  updateProfile: (userData: Partial<User>): Promise<User> =>
    api.put('/profile', userData).then(res => res.data),
};

// Workout API
export const workoutAPI = {
  getWorkouts: (): Promise<Workout[]> =>
    api.get('/workouts').then(res => res.data),
  
  createWorkout: (workout: Omit<Workout, 'id' | 'userId'>): Promise<Workout> =>
    api.post('/workouts', workout).then(res => res.data),
  
  updateWorkout: (id: number, workout: Partial<Workout>): Promise<Workout> =>
    api.put(`/workouts/${id}`, workout).then(res => res.data),
  
  deleteWorkout: (id: number): Promise<void> =>
    api.delete(`/workouts/${id}`),
};

// Nutrition API
export const nutritionAPI = {
  getNutritionEntries: (): Promise<NutritionEntry[]> =>
    api.get('/nutrition').then(res => res.data),
  
  createNutritionEntry: (entry: Omit<NutritionEntry, 'id' | 'userId'>): Promise<NutritionEntry> =>
    api.post('/nutrition', entry).then(res => res.data),
  
  updateNutritionEntry: (id: number, entry: Partial<NutritionEntry>): Promise<NutritionEntry> =>
    api.put(`/nutrition/${id}`, entry).then(res => res.data),
  
  deleteNutritionEntry: (id: number): Promise<void> =>
    api.delete(`/nutrition/${id}`),
};

// Progress API
export const progressAPI = {
  getProgressData: (): Promise<ProgressData[]> =>
    api.get('/progress').then(res => res.data),
  
  addProgressData: (data: Omit<ProgressData, 'id'>): Promise<ProgressData> =>
    api.post('/progress', data).then(res => res.data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (): Promise<DashboardStats> =>
    api.get('/dashboard/stats').then(res => res.data),
};

export default api;