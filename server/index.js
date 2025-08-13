import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'fitness_tracker_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock Data
const users = [
  {
    id: 1,
    email: 'demo@fittracker.com',
    password: 'demo123',
    name: 'John Doe',
    age: 28,
    height: 175,
    weight: 70,
    fitnessGoal: 'Build Muscle',
    activityLevel: 'Moderate',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const workouts = [
  {
    id: 1,
    userId: 1,
    name: 'Upper Body Strength',
    date: '2024-01-15',
    duration: 45,
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
      { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
      { name: 'Shoulder Press', sets: 3, reps: 12, weight: 25 }
    ],
    notes: 'Great workout, felt strong today!',
    category: 'Strength',
    caloriesBurned: 320
  },
  {
    id: 2,
    userId: 1,
    name: 'Cardio Run',
    date: '2024-01-14',
    duration: 30,
    exercises: [
      { name: 'Running', sets: 1, reps: 1, weight: 0, distance: 5 }
    ],
    notes: 'Perfect weather for running',
    category: 'Cardio',
    caloriesBurned: 450
  }
];

const nutritionEntries = [
  {
    id: 1,
    userId: 1,
    date: '2024-01-15',
    meal: 'Breakfast',
    foods: [
      { name: 'Oatmeal', quantity: 1, unit: 'cup', calories: 150, protein: 5, carbs: 27, fat: 3 },
      { name: 'Banana', quantity: 1, unit: 'piece', calories: 105, protein: 1, carbs: 27, fat: 0 }
    ],
    totalCalories: 255,
    totalProtein: 6,
    totalCarbs: 54,
    totalFat: 3
  },
  {
    id: 2,
    userId: 1,
    date: '2024-01-15',
    meal: 'Lunch',
    foods: [
      { name: 'Chicken Breast', quantity: 150, unit: 'g', calories: 231, protein: 43, carbs: 0, fat: 5 },
      { name: 'Brown Rice', quantity: 1, unit: 'cup', calories: 216, protein: 5, carbs: 45, fat: 2 }
    ],
    totalCalories: 447,
    totalProtein: 48,
    totalCarbs: 45,
    totalFat: 7
  }
];

const progressData = [
  { date: '2024-01-01', weight: 72, bodyFat: 15, muscle: 58 },
  { date: '2024-01-08', weight: 71.5, bodyFat: 14.8, muscle: 58.2 },
  { date: '2024-01-15', weight: 71, bodyFat: 14.5, muscle: 58.5 }
];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      height: user.height,
      weight: user.weight,
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, age, height, weight, fitnessGoal, activityLevel } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
    age,
    height,
    weight,
    fitnessGoal,
    activityLevel,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
  
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      age: newUser.age,
      height: newUser.height,
      weight: newUser.weight,
      fitnessGoal: newUser.fitnessGoal,
      activityLevel: newUser.activityLevel
    }
  });
});

// Profile Routes
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    height: user.height,
    weight: user.weight,
    fitnessGoal: user.fitnessGoal,
    activityLevel: user.activityLevel
  });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };
  
  res.json({
    id: users[userIndex].id,
    email: users[userIndex].email,
    name: users[userIndex].name,
    age: users[userIndex].age,
    height: users[userIndex].height,
    weight: users[userIndex].weight,
    fitnessGoal: users[userIndex].fitnessGoal,
    activityLevel: users[userIndex].activityLevel
  });
});

// Workout Routes
app.get('/api/workouts', authenticateToken, (req, res) => {
  const userWorkouts = workouts.filter(w => w.userId === req.user.id);
  res.json(userWorkouts);
});

app.post('/api/workouts', authenticateToken, (req, res) => {
  const newWorkout = {
    id: workouts.length + 1,
    userId: req.user.id,
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };

  workouts.push(newWorkout);
  res.status(201).json(newWorkout);
});

app.put('/api/workouts/:id', authenticateToken, (req, res) => {
  const workoutIndex = workouts.findIndex(w => w.id === parseInt(req.params.id) && w.userId === req.user.id);
  
  if (workoutIndex === -1) {
    return res.status(404).json({ error: 'Workout not found' });
  }

  workouts[workoutIndex] = { ...workouts[workoutIndex], ...req.body };
  res.json(workouts[workoutIndex]);
});

app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
  const workoutIndex = workouts.findIndex(w => w.id === parseInt(req.params.id) && w.userId === req.user.id);
  
  if (workoutIndex === -1) {
    return res.status(404).json({ error: 'Workout not found' });
  }

  workouts.splice(workoutIndex, 1);
  res.status(204).send();
});

// Nutrition Routes
app.get('/api/nutrition', authenticateToken, (req, res) => {
  const userNutrition = nutritionEntries.filter(n => n.userId === req.user.id);
  res.json(userNutrition);
});

app.post('/api/nutrition', authenticateToken, (req, res) => {
  const newEntry = {
    id: nutritionEntries.length + 1,
    userId: req.user.id,
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };

  nutritionEntries.push(newEntry);
  res.status(201).json(newEntry);
});

app.put('/api/nutrition/:id', authenticateToken, (req, res) => {
  const entryIndex = nutritionEntries.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.user.id);
  
  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Nutrition entry not found' });
  }

  nutritionEntries[entryIndex] = { ...nutritionEntries[entryIndex], ...req.body };
  res.json(nutritionEntries[entryIndex]);
});

app.delete('/api/nutrition/:id', authenticateToken, (req, res) => {
  const entryIndex = nutritionEntries.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.user.id);
  
  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Nutrition entry not found' });
  }

  nutritionEntries.splice(entryIndex, 1);
  res.status(204).send();
});

// Progress Routes
app.get('/api/progress', authenticateToken, (req, res) => {
  res.json(progressData);
});

app.post('/api/progress', authenticateToken, (req, res) => {
  const newProgress = {
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };

  progressData.push(newProgress);
  res.status(201).json(newProgress);
});

// Dashboard Stats Route
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const userWorkouts = workouts.filter(w => w.userId === req.user.id);
  const userNutrition = nutritionEntries.filter(n => n.userId === req.user.id);
  
  const totalWorkouts = userWorkouts.length;
  const totalCaloriesBurned = userWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalCaloriesConsumed = userNutrition.reduce((sum, n) => sum + (n.totalCalories || 0), 0);
  const avgWorkoutDuration = userWorkouts.length > 0 ? 
    Math.round(userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / userWorkouts.length) : 0;

  res.json({
    totalWorkouts,
    totalCaloriesBurned,
    totalCaloriesConsumed,
    avgWorkoutDuration,
    recentWorkouts: userWorkouts.slice(-5),
    recentNutrition: userNutrition.slice(-5)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});