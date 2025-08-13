import React, { useState, useEffect } from 'react';
import { progressAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Scale,
  Target,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import type { ProgressData } from '../../types';

const ProgressPage: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const data = await progressAPI.getProgressData();
      setProgressData(data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = () => {
    setIsModalOpen(true);
  };

  // Calculate trends
  const latestEntry = progressData[progressData.length - 1];
  const previousEntry = progressData[progressData.length - 2];
  
  const weightTrend = latestEntry && previousEntry 
    ? latestEntry.weight - previousEntry.weight 
    : 0;
  const bodyFatTrend = latestEntry && previousEntry 
    ? latestEntry.bodyFat - previousEntry.bodyFat 
    : 0;
  const muscleTrend = latestEntry && previousEntry 
    ? latestEntry.muscle - previousEntry.muscle 
    : 0;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600">Monitor your fitness journey and body composition changes</p>
        </div>
        <Button onClick={handleAddEntry} icon={Plus}>
          Add Entry
        </Button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {latestEntry?.weight || 0}kg
                  </div>
                  <p className="text-gray-600 text-sm">Current Weight</p>
                </div>
                <div className={`flex items-center ${getTrendColor(weightTrend)}`}>
                  {getTrendIcon(weightTrend)}
                  <span className="ml-1 text-sm font-medium">
                    {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {latestEntry?.bodyFat || 0}%
                  </div>
                  <p className="text-gray-600 text-sm">Body Fat</p>
                </div>
                <div className={`flex items-center ${getTrendColor(-bodyFatTrend)}`}>
                  {getTrendIcon(-bodyFatTrend)}
                  <span className="ml-1 text-sm font-medium">
                    {bodyFatTrend > 0 ? '+' : ''}{bodyFatTrend.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {latestEntry?.muscle || 0}kg
                  </div>
                  <p className="text-gray-600 text-sm">Muscle Mass</p>
                </div>
                <div className={`flex items-center ${getTrendColor(muscleTrend)}`}>
                  {getTrendIcon(muscleTrend)}
                  <span className="ml-1 text-sm font-medium">
                    {muscleTrend > 0 ? '+' : ''}{muscleTrend.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2 text-blue-600" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value) => [`${value}kg`, 'Weight']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Body Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Body Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="muscle" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stackId="2"
                    stroke="#F59E0B" 
                    fill="#F59E0B"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                <span className="text-sm text-gray-600">Muscle Mass</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500" />
                <span className="text-sm text-gray-600">Body Fat</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.slice().reverse().map((entry, index) => (
              <div key={entry.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Progress Update
                    </div>
                  </div>
                </div>
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{entry.weight}kg</div>
                    <div className="text-gray-600">Weight</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{entry.bodyFat}%</div>
                    <div className="text-gray-600">Body Fat</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{entry.muscle}kg</div>
                    <div className="text-gray-600">Muscle</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {progressData.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h3>
              <p className="text-gray-600 mb-4">
                Start tracking your progress by adding your first measurement
              </p>
              <Button onClick={handleAddEntry} icon={Plus}>
                Add Your First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchProgressData}
      />
    </div>
  );
};

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    muscle: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await progressAPI.addProgressData({
        date: formData.date,
        weight: parseFloat(formData.weight),
        bodyFat: parseFloat(formData.bodyFat),
        muscle: parseFloat(formData.muscle)
      });
      onSave();
      onClose();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        muscle: ''
      });
    } catch (error) {
      console.error('Failed to save progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Progress Entry"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              step="0.1"
              min="0"
              required
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="70.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Fat (%)
            </label>
            <input
              type="number"
              name="bodyFat"
              step="0.1"
              min="0"
              max="50"
              required
              value={formData.bodyFat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="15.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Mass (kg)
            </label>
            <input
              type="number"
              name="muscle"
              step="0.1"
              min="0"
              required
              value={formData.muscle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="58.3"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Measurement Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Weigh yourself at the same time each day (preferably morning)</li>
            <li>• Use a body composition scale for accurate body fat and muscle measurements</li>
            <li>• Track measurements weekly for best results</li>
            <li>• Be consistent with your measurement conditions</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProgressPage;