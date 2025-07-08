import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';
import { analyticsApi, StreakData } from '@/services/analyticsApi';

interface StreakCounterProps {
  className?: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ className = '' }) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStreakData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analyticsApi.getStreaksAndAchievements();
        setStreakData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load streak data';
        setError(errorMessage);
        console.error('Error loading streak data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreakData();
  }, []);

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'Legendary', color: 'text-purple-600', icon: Trophy };
    if (streak >= 14) return { level: 'Master', color: 'text-yellow-600', icon: Zap };
    if (streak >= 7) return { level: 'Expert', color: 'text-orange-600', icon: Flame };
    if (streak >= 3) return { level: 'Beginner', color: 'text-blue-600', icon: Calendar };
    return { level: 'Starter', color: 'text-gray-600', icon: Calendar };
  };

  const getRecentMilestones = () => {
    if (!streakData?.milestones) return [];
    return streakData.milestones
      .filter(m => {
        const achievedDate = new Date(m.achievedAt);
        const daysAgo = (Date.now() - achievedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7; // Last 7 days
      })
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5" />
            <span>Learning Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
            <Skeleton className="h-8 w-24 mx-auto mb-1" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !streakData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5" />
            <span>Learning Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error || 'Failed to load streak data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreakLevel = getStreakLevel(streakData.currentStreak);
  const longestStreakLevel = getStreakLevel(streakData.longestStreak);
  const recentMilestones = getRecentMilestones();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>Learning Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mb-3">
            <currentStreakLevel.icon className="h-8 w-8 text-white" />
            <div className="absolute -top-1 -right-1 bg-white rounded-full px-2 py-1 text-xs font-bold text-orange-600">
              {streakData.currentStreak}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{streakData.currentStreak} Days</div>
            <Badge variant="secondary" className={currentStreakLevel.color}>
              {currentStreakLevel.level} Streak
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold text-purple-600">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
            <Badge variant="outline" className={`text-xs ${longestStreakLevel.color}`}>
              {longestStreakLevel.level}
            </Badge>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {Math.round((streakData.streakHistory.filter(h => h.active).length / streakData.streakHistory.length) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Consistency</div>
            <div className="text-xs text-green-600 mt-1">
              {streakData.streakHistory.filter(h => h.active).length}/{streakData.streakHistory.length} days
            </div>
          </div>
        </div>

        {/* Recent Milestones */}
        {recentMilestones.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Achievements</h4>
            <div className="space-y-2">
              {recentMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="flex-1">{milestone.description}</span>
                  <Badge variant="outline" className="text-xs">
                    {milestone.type === 'streak' && '🔥'}
                    {milestone.type === 'completion' && '✅'}
                    {milestone.type === 'points' && '⭐'}
                    {milestone.type === 'study_time' && '⏰'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak Calendar (simplified visualization) */}
        <div>
          <h4 className="text-sm font-medium mb-2">Last 14 Days</h4>
          <div className="grid grid-cols-7 gap-1">
            {streakData.streakHistory.slice(-14).map((day, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${
                  day.active 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
                title={new Date(day.date).toLocaleDateString()}
              >
                {day.active ? '🔥' : '•'}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            🔥 = Active day • = Missed day
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
