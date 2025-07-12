import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Zap, 
  Star, 
  Award, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Trophy
} from 'lucide-react';

interface NotebookValidationTask {
  id: string;
  notebookUrl: string;
  title: string;
  submittedBy: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  points: number;
  category: string;
  contentPreview: string;
  validationQuestions: {
    id: string;
    question: string;
    type: 'quality' | 'accuracy' | 'relevance' | 'completeness';
    options?: string[];
  }[];
}

interface UserGameStats {
  totalPoints: number;
  validationsCompleted: number;
  accuracyScore: number;
  streak: number;
  level: number;
  badge: string;
}

export const NotebookValidationGame: React.FC = () => {
  const [currentTask, setCurrentTask] = useState<NotebookValidationTask | null>(null);
  const [availableTasks, setAvailableTasks] = useState<NotebookValidationTask[]>([]);
  const [userStats, setUserStats] = useState<UserGameStats>({
    totalPoints: 1250,
    validationsCompleted: 34,
    accuracyScore: 87,
    streak: 7,
    level: 5,
    badge: 'Quality Detective'
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [taskStatus, setTaskStatus] = useState<'active' | 'completed' | 'skipped'>('active');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockTasks: NotebookValidationTask[] = [
      {
        id: '1',
        notebookUrl: 'https://notebooklm.google.com/notebook/abc123',
        title: 'NFL Draft Analysis 2025',
        submittedBy: 'SportsFan42',
        priority: 'high',
        estimatedTime: 3,
        points: 50,
        category: 'Sports',
        contentPreview: 'Comprehensive analysis of NFL draft prospects for 2025, including player stats, team needs, and mock draft predictions...',
        validationQuestions: [
          {
            id: 'q1',
            question: 'How would you rate the overall quality of this notebook?',
            type: 'quality',
            options: ['Excellent', 'Good', 'Average', 'Poor']
          },
          {
            id: 'q2',
            question: 'Are the data sources credible and properly cited?',
            type: 'accuracy',
            options: ['Yes, fully cited', 'Partially cited', 'No citations', 'Unable to verify']
          }
        ]
      },
      {
        id: '2',
        notebookUrl: 'https://notebooklm.google.com/notebook/def456',
        title: 'Climate Change Impact Study',
        submittedBy: 'EcoResearcher',
        priority: 'medium',
        estimatedTime: 5,
        points: 75,
        category: 'Research',
        contentPreview: 'Analysis of climate change impacts on coastal communities, including sea level rise projections and adaptation strategies...',
        validationQuestions: [
          {
            id: 'q1',
            question: 'How comprehensive is the research methodology?',
            type: 'completeness',
            options: ['Very comprehensive', 'Adequate', 'Limited', 'Insufficient']
          }
        ]
      }
    ];
    
    setAvailableTasks(mockTasks);
    setCurrentTask(mockTasks[0]);
    setTimeLeft(mockTasks[0].estimatedTime * 60); // Convert to seconds
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && taskStatus === 'active') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, taskStatus]);

  const getLevelProgress = () => {
    const pointsForCurrentLevel = userStats.level * 200;
    const pointsForNextLevel = (userStats.level + 1) * 200;
    const progress = ((userStats.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(progress, 100);
  };

  const getStreakBonus = () => {
    if (userStats.streak >= 10) return 2.0;
    if (userStats.streak >= 5) return 1.5;
    if (userStats.streak >= 3) return 1.2;
    return 1.0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitValidation = () => {
    if (!currentTask) return;

    const basePoints = currentTask.points;
    const timeBonus = timeLeft > 0 ? Math.floor(timeLeft / 30) : 0;
    const streakBonus = Math.floor(basePoints * (getStreakBonus() - 1));
    const totalEarned = basePoints + timeBonus + streakBonus;

    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + totalEarned,
      validationsCompleted: prev.validationsCompleted + 1,
      streak: prev.streak + 1
    }));

    setTaskStatus('completed');
    
    // Auto-advance to next task after 3 seconds
    setTimeout(() => {
      const nextTask = availableTasks.find(t => t.id !== currentTask.id);
      if (nextTask) {
        setCurrentTask(nextTask);
        setTimeLeft(nextTask.estimatedTime * 60);
        setSelectedAnswers({});
        setTaskStatus('active');
      }
    }, 3000);
  };

  const skipTask = () => {
    setTaskStatus('skipped');
    setUserStats(prev => ({
      ...prev,
      streak: 0
    }));
    
    setTimeout(() => {
      const nextTask = availableTasks.find(t => t.id !== currentTask?.id);
      if (nextTask) {
        setCurrentTask(nextTask);
        setTimeLeft(nextTask.estimatedTime * 60);
        setSelectedAnswers({});
        setTaskStatus('active');
      }
    }, 1500);
  };

  if (!currentTask) {
    return <div className="text-center text-slate-300">Loading validation tasks...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Stats */}
        <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Notebook Quality Detective</h1>
                <p className="text-slate-400">Level {userStats.level} • {userStats.badge}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Total Points</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">Completed</span>
              </div>
              <div className="text-2xl font-bold">{userStats.validationsCompleted}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">Accuracy</span>
              </div>
              <div className="text-2xl font-bold">{userStats.accuracyScore}%</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-slate-300">Streak</span>
              </div>
              <div className="text-2xl font-bold">{userStats.streak}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-slate-300">Level Progress</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getLevelProgress()}%` }}
                />
              </div>
              <div className="text-xs text-slate-400">{Math.round(getLevelProgress())}%</div>
            </div>
          </div>
        </div>

        {/* Current Task */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          
          {/* Task Header */}
          <div className="bg-slate-700/50 p-6 border-b border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  currentTask.priority === 'high' ? 'bg-red-400' :
                  currentTask.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span className="text-sm font-medium text-slate-300">
                  {currentTask.category} • {currentTask.estimatedTime} min • {currentTask.points} points
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className={`font-mono text-lg ${timeLeft < 30 ? 'text-red-400' : 'text-slate-300'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Streak Bonus: {Math.round((getStreakBonus() - 1) * 100)}%
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-2">{currentTask.title}</h2>
            <p className="text-slate-400 text-sm mb-4">Submitted by {currentTask.submittedBy}</p>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-slate-300 leading-relaxed">{currentTask.contentPreview}</p>
            </div>
          </div>

          {/* Validation Questions */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-400" />
              Validation Questions
            </h3>
            
            <div className="space-y-6">
              {currentTask.validationQuestions.map((question) => (
                <div key={question.id} className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">{question.question}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(question.id, option)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedAnswers[question.id] === option
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-700/30 border-t border-slate-600 flex justify-between">
            <button
              onClick={skipTask}
              disabled={taskStatus !== 'active'}
              className="px-6 py-3 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip Task
            </button>
            
            <button
              onClick={submitValidation}
              disabled={taskStatus !== 'active' || Object.keys(selectedAnswers).length < currentTask.validationQuestions.length}
              className="px-8 py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 disabled:bg-green-600 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Submit Validation
            </button>
          </div>
        </div>

        {/* Task Completion */}
        {taskStatus === 'completed' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Task Completed!</h3>
              <p className="text-slate-400 mb-4">You earned {currentTask.points} points!</p>
              <div className="text-sm text-slate-500">Loading next task...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 