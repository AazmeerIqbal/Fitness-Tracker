import React, { useState, useEffect } from 'react';
import { nutritionAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { 
  Plus, 
  Search, 
  Calendar,
  Apple,
  Edit,
  Trash2,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import type { NutritionEntry, Food } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const NutritionPage: React.FC = () => {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await nutritionAPI.getNutritionEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch nutrition entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: NutritionEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this nutrition entry?')) {
      try {
        await nutritionAPI.deleteNutritionEntry(id);
        fetchEntries();
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.meal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.foods.some(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = selectedDate === '' || entry.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const todayEntries = entries.filter(entry => entry.date === selectedDate);
  const todayTotals = todayEntries.reduce((totals, entry) => ({
    calories: totals.calories + entry.totalCalories,
    protein: totals.protein + entry.totalProtein,
    carbs: totals.carbs + entry.totalCarbs,
    fat: totals.fat + entry.totalFat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: todayTotals.protein * 4, color: '#3B82F6' },
    { name: 'Carbs', value: todayTotals.carbs * 4, color: '#10B981' },
    { name: 'Fat', value: todayTotals.fat * 9, color: '#F59E0B' }
  ];

  const weeklyData = [
    { day: 'Mon', calories: 2100, protein: 120, carbs: 250, fat: 70 },
    { day: 'Tue', calories: 1950, protein: 110, carbs: 230, fat: 65 },
    { day: 'Wed', calories: 2200, protein: 125, carbs: 270, fat: 75 },
    { day: 'Thu', calories: 2050, protein: 115, carbs: 245, fat: 68 },
    { day: 'Fri', calories: 2150, protein: 130, carbs: 260, fat: 72 },
    { day: 'Sat', calories: 2300, protein: 140, carbs: 280, fat: 80 },
    { day: 'Sun', calories: 2000, protein: 105, carbs: 240, fat: 65 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
          <p className="text-gray-600">Track your daily nutrition and monitor your intake</p>
        </div>
        <Button onClick={handleCreateEntry} icon={Plus}>
          Add Meal
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{todayTotals.calories}</div>
              <p className="text-gray-600 text-sm">Total Calories</p>
              <p className="text-xs text-gray-500">Goal: 2200</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{todayTotals.protein}g</div>
              <p className="text-gray-600 text-sm">Protein</p>
              <p className="text-xs text-gray-500">Goal: 150g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{todayTotals.carbs}g</div>
              <p className="text-gray-600 text-sm">Carbohydrates</p>
              <p className="text-xs text-gray-500">Goal: 275g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{todayTotals.fat}g</div>
              <p className="text-gray-600 text-sm">Fat</p>
              <p className="text-xs text-gray-500">Goal: 73g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Today's Macros (Calories)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cal`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {macroData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Weekly Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} cal`, 'Calories']} />
                  <Bar dataKey="calories" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search meals or foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Nutrition Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center">
                  <Apple className="h-5 w-5 mr-2 text-green-600" />
                  {entry.meal}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditEntry(entry)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteEntry(entry.id!)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {format(new Date(entry.date), 'MMM d, yyyy')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Nutritional Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-orange-50 p-2 rounded">
                    <span className="font-medium text-orange-800">{entry.totalCalories}</span>
                    <span className="text-orange-600 ml-1">cal</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <span className="font-medium text-blue-800">{entry.totalProtein}g</span>
                    <span className="text-blue-600 ml-1">protein</span>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <span className="font-medium text-green-800">{entry.totalCarbs}g</span>
                    <span className="text-green-600 ml-1">carbs</span>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <span className="font-medium text-yellow-800">{entry.totalFat}g</span>
                    <span className="text-yellow-600 ml-1">fat</span>
                  </div>
                </div>

                {/* Food Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Foods ({entry.foods.length})
                  </h4>
                  <div className="space-y-1">
                    {entry.foods.slice(0, 3).map((food, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{food.name}</span>
                        <span>{food.quantity} {food.unit}</span>
                      </div>
                    ))}
                    {entry.foods.length > 3 && (
                      <div className="text-sm text-green-600">
                        +{entry.foods.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Apple className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedDate !== new Date().toISOString().split('T')[0] 
              ? 'No entries found' 
              : 'No meals logged today'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedDate !== new Date().toISOString().split('T')[0]
              ? 'Try adjusting your search or date filter'
              : 'Start by logging your first meal of the day'
            }
          </p>
          {!searchTerm && selectedDate === new Date().toISOString().split('T')[0] && (
            <Button onClick={handleCreateEntry} icon={Plus}>
              Log Your First Meal
            </Button>
          )}
        </div>
      )}

      {/* Nutrition Modal */}
      <NutritionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={editingEntry}
        onSave={fetchEntries}
      />
    </div>
  );
};

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: NutritionEntry | null;
  onSave: () => void;
}

const NutritionModal: React.FC<NutritionModalProps> = ({ isOpen, onClose, entry, onSave }) => {
  const [formData, setFormData] = useState<Omit<NutritionEntry, 'id' | 'userId'>>({
    date: new Date().toISOString().split('T')[0],
    meal: '',
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  const [currentFood, setCurrentFood] = useState<Food>({
    name: '',
    quantity: 0,
    unit: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date,
        meal: entry.meal,
        foods: entry.foods,
        totalCalories: entry.totalCalories,
        totalProtein: entry.totalProtein,
        totalCarbs: entry.totalCarbs,
        totalFat: entry.totalFat
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        meal: '',
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });
    }
  }, [entry]);

  // Recalculate totals whenever foods change
  useEffect(() => {
    const totals = formData.foods.reduce((acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setFormData(prev => ({
      ...prev,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    }));
  }, [formData.foods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (entry) {
        await nutritionAPI.updateNutritionEntry(entry.id!, formData);
      } else {
        await nutritionAPI.createNutritionEntry(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save nutrition entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = () => {
    if (currentFood.name && currentFood.quantity && currentFood.calories) {
      setFormData({
        ...formData,
        foods: [...formData.foods, { ...currentFood }]
      });
      setCurrentFood({
        name: '',
        quantity: 0,
        unit: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    }
  };

  const removeFood = (index: number) => {
    setFormData({
      ...formData,
      foods: formData.foods.filter((_, i) => i !== index)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Edit Meal' : 'Log New Meal'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              required
              value={formData.meal}
              onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Foods Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Foods</h4>
          
          {/* Add Food Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div>
                <input
                  type="text"
                  value={currentFood.name}
                  onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Food name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentFood.quantity}
                  onChange={(e) => setCurrentFood({ ...currentFood, quantity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Qty"
                />
                <input
                  type="text"
                  value={currentFood.unit}
                  onChange={(e) => setCurrentFood({ ...currentFood, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Unit"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={currentFood.calories}
                  onChange={(e) => setCurrentFood({ ...currentFood, calories: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Calories"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-3 mb-3">
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentFood.protein}
                  onChange={(e) => setCurrentFood({ ...currentFood, protein: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Protein (g)"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentFood.carbs}
                  onChange={(e) => setCurrentFood({ ...currentFood, carbs: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Carbs (g)"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentFood.fat}
                  onChange={(e) => setCurrentFood({ ...currentFood, fat: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Fat (g)"
                />
              </div>
              <div>
                <Button type="button" onClick={addFood} size="sm" className="w-full">
                  Add Food
                </Button>
              </div>
            </div>
          </div>

          {/* Food List */}
          <div className="space-y-2">
            {formData.foods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-6 gap-4 flex-1">
                  <div className="font-medium">{food.name}</div>
                  <div className="text-gray-600">{food.quantity} {food.unit}</div>
                  <div className="text-gray-600">{food.calories} cal</div>
                  <div className="text-gray-600">{food.protein}g P</div>
                  <div className="text-gray-600">{food.carbs}g C</div>
                  <div className="text-gray-600">{food.fat}g F</div>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeFood(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        {formData.foods.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Meal Totals</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-900">{formData.totalCalories}</div>
                <div className="text-green-700">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-900">{formData.totalProtein.toFixed(1)}g</div>
                <div className="text-green-700">Protein</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-900">{formData.totalCarbs.toFixed(1)}g</div>
                <div className="text-green-700">Carbs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-900">{formData.totalFat.toFixed(1)}g</div>
                <div className="text-green-700">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {entry ? 'Update Meal' : 'Log Meal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NutritionPage;