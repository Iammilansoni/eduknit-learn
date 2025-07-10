import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Award, TrendingUp, Zap } from 'lucide-react';

interface PointsAndLevelProps {
  className?: string;
  totalPoints?: number;
  level?: number;
}

const PointsAndLevel: React.FC<PointsAndLevelProps> = ({ 
  className = '', 
  totalPoints = 0,
  level = 1
}) => {
  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'Beginner', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🌱' },
      { name: 'Student', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📚' },
      { name: 'Scholar', color: 'text-green-600', bgColor: 'bg-green-100', icon: '🎓' },
      { name: 'Expert', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '🧠' },
      { name: 'Master', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '👑' },
      { name: 'Legend', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🏆' },
    ];
    return levels[Math.min(level - 1, levels.length - 1)] || levels[0];
  };

  const getPointsForNextLevel = (currentLevel: number) => {
    // Example: Each level requires exponentially more points
    const basePoints = 100;
    const multiplier = 1.5;
    return Math.floor(basePoints * Math.pow(multiplier, currentLevel));
  };

  const getPointsForLevel = (level: number) => {
    if (level <= 1) return 0;
    const basePoints = 100;
    const multiplier = 1.5;
    let totalPoints = 0;
    for (let i = 1; i < level; i++) {
      totalPoints += Math.floor(basePoints * Math.pow(multiplier, i - 1));
    }
    return totalPoints;
  };

  const levelInfo = getLevelInfo(level);
  const currentLevelPoints = getPointsForLevel(level);
  const nextLevelPoints = getPointsForNextLevel(level);
  const progressInLevel = totalPoints - currentLevelPoints;
  const progressPercentage = Math.max(0, Math.min(100, (progressInLevel / nextLevelPoints) * 100));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Points & Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Display */}
        <div className="text-center">
          <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-full ${levelInfo.bgColor} mb-3`}>
            <span className="text-3xl">{levelInfo.icon}</span>
            <div className="absolute -top-1 -right-1 bg-white rounded-full px-2 py-1 text-xs font-bold text-purple-600 border-2 border-purple-200">
              {level}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">Level {level}</div>
            <Badge variant="secondary" className={levelInfo.color}>
              {levelInfo.name}
            </Badge>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {level + 1}</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{progressInLevel.toLocaleString()} pts</span>
            <span>{nextLevelPoints.toLocaleString()} pts needed</span>
          </div>
        </div>

        {/* Points Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-xl font-bold text-yellow-600">
                {totalPoints.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-xl font-bold text-purple-600">
                {Math.floor(totalPoints / 100)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        {/* Level Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-1 flex items-center space-x-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <span>Level {level} Benefits</span>
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {level >= 1 && <div>• Access to basic courses</div>}
            {level >= 2 && <div>• Download certificates</div>}
            {level >= 3 && <div>• Priority support</div>}
            {level >= 4 && <div>• Advanced course access</div>}
            {level >= 5 && <div>• Mentor sessions</div>}
            {level >= 6 && <div>• Exclusive content</div>}
          </div>
        </div>

        {/* Motivation */}
        <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
          <h4 className="text-sm font-medium mb-1">Keep Learning!</h4>
          <p className="text-xs text-muted-foreground">
            {progressPercentage < 25 && "Start earning points to level up!"}
            {progressPercentage >= 25 && progressPercentage < 50 && "You're making great progress!"}
            {progressPercentage >= 50 && progressPercentage < 75 && "Almost there! Keep going!"}
            {progressPercentage >= 75 && progressPercentage < 100 && "So close to the next level!"}
            {progressPercentage >= 100 && "Ready to level up! Complete a course to advance."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsAndLevel;
