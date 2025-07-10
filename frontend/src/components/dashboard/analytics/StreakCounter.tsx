import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';

interface StreakCounterProps {
  className?: string;
  currentStreak?: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ 
  className = '', 
  currentStreak = 0 
}) => {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'Legendary', color: 'text-purple-600', icon: Trophy };
    if (streak >= 14) return { level: 'Master', color: 'text-yellow-600', icon: Zap };
    if (streak >= 7) return { level: 'Expert', color: 'text-orange-600', icon: Flame };
    if (streak >= 3) return { level: 'Beginner', color: 'text-blue-600', icon: Calendar };
    return { level: 'Starter', color: 'text-gray-600', icon: Calendar };
  };

  const currentStreakLevel = getStreakLevel(currentStreak);

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
              {currentStreak}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{currentStreak} Days</div>
            <Badge variant="secondary" className={currentStreakLevel.color}>
              {currentStreakLevel.level} Streak
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold text-purple-600">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
            <Badge variant="outline" className={`text-xs ${currentStreakLevel.color}`}>
              {currentStreakLevel.level}
            </Badge>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {currentStreak > 0 ? 'Active' : 'Start Today'}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="text-xs text-green-600 mt-1">
              Keep it up!
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Keep the momentum going!</h4>
          <p className="text-xs text-muted-foreground">
            {currentStreak === 0 && "Start your learning streak today!"}
            {currentStreak === 1 && "Great start! Come back tomorrow to build your streak."}
            {currentStreak > 1 && currentStreak < 7 && `You're on fire! ${7 - currentStreak} more days to reach Expert level.`}
            {currentStreak >= 7 && currentStreak < 14 && `Expert level achieved! ${14 - currentStreak} more days to Master level.`}
            {currentStreak >= 14 && currentStreak < 30 && `Master level! ${30 - currentStreak} more days to Legendary status.`}
            {currentStreak >= 30 && "Legendary! You're unstoppable!"}
          </p>
        </div>

        {/* Simple Streak Visualization */}
        <div>
          <h4 className="text-sm font-medium mb-2">Your Streak</h4>
          <div className="flex items-center justify-center space-x-1">
            {Array.from({ length: Math.min(currentStreak, 7) }).map((_, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-sm bg-orange-500 text-white flex items-center justify-center text-xs"
              >
                🔥
              </div>
            ))}
            {Array.from({ length: Math.max(0, 7 - currentStreak) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-6 h-6 rounded-sm bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center text-xs"
              >
                •
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-center">
            🔥 = Active day • = Future day
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
