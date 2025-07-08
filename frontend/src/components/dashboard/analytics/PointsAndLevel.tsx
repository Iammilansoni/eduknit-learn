import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Award, TrendingUp, Zap } from 'lucide-react';
import { analyticsApi, AnalyticsOverview } from '@/services/analyticsApi';

interface PointsAndLevelProps {
  className?: string;
}

const PointsAndLevel: React.FC<PointsAndLevelProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analyticsApi.getOverview();
        setAnalytics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
        setError(errorMessage);
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Points & Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
            <Skeleton className="h-6 w-24 mx-auto mb-1" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Points & Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error || 'Failed to load analytics'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = getLevelInfo(analytics.level);
  const currentLevelPoints = getPointsForLevel(analytics.level);
  const nextLevelPoints = getPointsForNextLevel(analytics.level);
  const progressInLevel = analytics.totalPoints - currentLevelPoints;
  const progressPercentage = (progressInLevel / nextLevelPoints) * 100;

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
              {analytics.level}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">Level {analytics.level}</div>
            <Badge variant="secondary" className={levelInfo.color}>
              {levelInfo.name}
            </Badge>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {analytics.level + 1}</span>
            <span className="font-medium">{Math.round(analytics.nextLevelProgress)}%</span>
          </div>
          <Progress value={analytics.nextLevelProgress} className="h-3" />
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
                {analytics.totalPoints.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-xl font-bold text-purple-600">
                {analytics.totalAchievements}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        {/* Recent Achievements */}
        {analytics.recentAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Achievements</h4>
            <div className="space-y-2">
              {analytics.recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Award className="h-3 w-3 text-yellow-600" />
                  </div>
                  <span className="flex-1">{achievement.badgeId.replace(/_/g, ' ').toUpperCase()}</span>
                  <Badge variant="outline" className="text-xs">
                    +{achievement.points}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-1 flex items-center space-x-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <span>Level {analytics.level} Benefits</span>
          </h4>
          <div className="text-xs text-muted-foreground">
            {analytics.level >= 5 && "• Priority support access"}
            {analytics.level >= 3 && "• Exclusive learning materials"}
            {analytics.level >= 2 && "• Advanced progress tracking"}
            {analytics.level >= 1 && "• Learning streak bonuses"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsAndLevel;
