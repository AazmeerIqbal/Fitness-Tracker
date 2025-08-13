import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import type { Workout, Exercise } from '../../types';

const WorkoutsPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutAPI.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkout = () => {
    setEditingWorkout(null);
    setIsModalOpen(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsModalOpen(true);
  };

  const handleDeleteWorkout = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.deleteWorkout(id);
        fetchWorkouts();
      } catch (error) {
        console.error('Failed to delete workout:', error);
      }
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.exercises.some(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === '' || workout.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(workouts.map(w => w.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600">Track and manage your workout routines</p>
        </div>
        <Button onClick={handleCreateWorkout} icon={Plus}>
          Add Workout
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workouts or exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{workout.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditWorkout(workout)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteWorkout(workout.id!)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(workout.date), 'MMM d, yyyy')}
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {workout.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center text-orange-600">
                    <Flame className="h-4 w-4 mr-2" />
                    <span>{workout.caloriesBurned} cal</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exercises ({workout.exercises.length})</h4>
                  <div className="space-y-1">
                    {workout.exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{exercise.name}</span>
                        <span>{exercise.sets} × {exercise.reps}</span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-sm text-blue-600">
                        +{workout.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                </div>

                {workout.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{workout.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Dumbbell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterCategory ? 'No workouts found' : 'No workouts yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by creating your first workout routine'
            }
          </p>
          {!searchTerm && !filterCategory && (
            <Button onClick={handleCreateWorkout} icon={Plus}>
              Create Your First Workout
            </Button>
          )}
        </div>
      )}

      {/* Workout Modal */}
      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workout={editingWorkout}
        onSave={fetchWorkouts}
      />
    </div>
  );
};

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  onSave: () => void;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, workout, onSave }) => {
  const [formData, setFormData] = useState<Omit<Workout, 'id' | 'userId'>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    exercises: [],
    notes: '',
    category: '',
    caloriesBurned: 0
  });
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: '',
    sets: 0,
    reps: 0,
    weight: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        exercises: workout.exercises,
        notes: workout.notes,
        category: workout.category,
        caloriesBurned: workout.caloriesBurned
      });
    } else {
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        exercises: [],
        notes: '',
        category: '',
        caloriesBurned: 0
      });
    }
  }, [workout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (workout) {
        await workoutAPI.updateWorkout(workout.id!, formData);
      } else {
        await workoutAPI.createWorkout(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addExercise = () => {
    if (currentExercise.name && currentExercise.sets && currentExercise.reps) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, { ...currentExercise }]
      });
      setCurrentExercise({ name: '', sets: 0, reps: 0, weight: 0 });
    }
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workout ? 'Edit Workout' : 'Create New Workout'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Upper Body Strength"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (min)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calories Burned
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="320"
            />
          </div>
        </div>

        {/* Exercises Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Exercises</h4>
          
          {/* Add Exercise Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid md:grid-cols-5 gap-3 mb-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Exercise name"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={currentExercise.sets}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Sets"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={currentExercise.reps}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Reps"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={currentExercise.weight}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, weight: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Weight (kg)"
                />
              </div>
            </div>
            <Button type="button" onClick={addExercise} size="sm">
              Add Exercise
            </Button>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {formData.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-4 gap-4 flex-1">
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-gray-600">{exercise.sets} sets</div>
                  <div className="text-gray-600">{exercise.reps} reps</div>
                  <div className="text-gray-600">{exercise.weight} kg</div>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeExercise(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any notes about this workout..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {workout ? 'Update Workout' : 'Create Workout'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkoutsPage;