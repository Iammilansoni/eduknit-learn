import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  School,
  Quiz,
  EmojiEvents,
  Timeline,
  Refresh,
  LocalFireDepartment,
  Star,
  CheckCircle,
  Warning,
  AccessTime,
  BarChart,
  PieChart,
  ShowChart
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { useStudentAnalytics, useAnalyticsMetrics } from '../../hooks/useStudentAnalytics';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Analytics: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const { data, loading, error, refetch, lastUpdated } = useStudentAnalytics({
    refreshInterval: 30000,
    autoRefresh: true
  });
  const { metrics } = useAnalyticsMetrics();

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Failed to load analytics data: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No analytics data available yet. Start learning to see your progress!</Alert>
      </Container>
    );
  }

  const progressChartData = {
    labels: data.progressOverTime.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Progress %',
        data: data.progressOverTime.map(item => item.progress),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'Time Spent (hours)',
        data: data.progressOverTime.map(item => item.timeSpent / 60),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const coursesDistributionData = {
    labels: ['Completed', 'Active', 'Not Started'],
    datasets: [
      {
        data: [
          data.completedCourses,
          data.activeCourses,
          data.totalEnrollments - data.completedCourses - data.activeCourses
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        hoverBackgroundColor: ['#45a049', '#e68900', '#d32f2f']
      }
    ]
  };

  const performanceRadarData = {
    labels: ['Course Completion', 'Quiz Performance', 'Time Management', 'Consistency', 'Profile Health'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          metrics.courseCompletion,
          data.quizStats.averageScore,
          metrics.learningEfficiency,
          metrics.streakConsistency * 100,
          metrics.profileHealth
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }
    ]
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    return 'error';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <LocalFireDepartment sx={{ color: '#ff6b35' }} />;
    if (streak >= 7) return <LocalFireDepartment sx={{ color: '#ff9500' }} />;
    return <LocalFireDepartment sx={{ color: '#666' }} />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Learning Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('overview')}
            startIcon={<BarChart />}
          >
            Overview
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('detailed')}
            startIcon={<ShowChart />}
          >
            Detailed
          </Button>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refetch} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Last Updated */}
      {lastUpdated && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Last updated: {format(lastUpdated, 'PPp')}
        </Typography>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Typography variant="h6">Courses</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {data.totalEnrollments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.completedCourses} completed, {data.activeCourses} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Progress</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {data.averageProgress.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={data.averageProgress}
                color={getProgressColor(data.averageProgress)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Quiz />
                </Avatar>
                <Typography variant="h6">Quiz Score</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {data.quizStats.averageScore.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.quizStats.passRate.toFixed(1)}% pass rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  {getStreakIcon(data.learningStreaks.currentStreak)}
                </Avatar>
                <Typography variant="h6">Streak</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {data.learningStreaks.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best: {data.learningStreaks.longestStreak} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Smart Progress Alert */}
      {data.smartProgress && (
        <Alert 
          severity={
            data.smartProgress.status === 'ahead' ? 'success' : 
            data.smartProgress.status === 'on-track' ? 'info' : 'warning'
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1">
            {data.smartProgress.status === 'ahead' && 'Great job! You\'re ahead of schedule!'}
            {data.smartProgress.status === 'on-track' && 'Perfect! You\'re on track with your learning goals.'}
            {data.smartProgress.status === 'behind' && 'You\'re falling behind. Consider increasing your study time.'}
          </Typography>
          <Typography variant="body2">
            Expected: {data.smartProgress.expectedProgress.toFixed(1)}% | 
            Actual: {data.smartProgress.actualProgress.toFixed(1)}% | 
            Days remaining: {data.smartProgress.daysRemaining}
          </Typography>
        </Alert>
      )}

      {/* Charts and Detailed Analytics */}
      <Grid container spacing={3}>
        {/* Progress Over Time */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress Over Time
              </Typography>
              <Box height={300}>
                <Line
                  data={progressChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Progress %'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Hours'
                        },
                        grid: {
                          drawOnChartArea: false
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Distribution
              </Typography>
              <Box height={300}>
                <Doughnut
                  data={coursesDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Radar */}
        {viewMode === 'detailed' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Analysis
                </Typography>
                <Box height={300}>
                  <Radar
                    data={performanceRadarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top'
                        }
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Achievements and Badges */}
        <Grid item xs={12} md={viewMode === 'detailed' ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements & Badges
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <EmojiEvents sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="body1">
                  Total Points: <strong>{data.gamification.totalPoints}</strong>
                </Typography>
                <Chip
                  label={`Level ${data.gamification.level}`}
                  color="primary"
                  sx={{ ml: 2 }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <List>
                {data.gamification.badges.map((badge) => (
                  <ListItem key={badge.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Badge
                        badgeContent={badge.earned ? <CheckCircle sx={{ fontSize: 16 }} /> : null}
                        color="success"
                      >
                        <Star color={badge.earned ? 'warning' : 'disabled'} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={badge.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {badge.description}
                          </Typography>
                          {badge.earned && badge.earnedDate && (
                            <Typography variant="caption" color="success.main">
                              Earned: {format(new Date(badge.earnedDate), 'PPP')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Completeness */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completeness
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={data.profileCompleteness.percentage}
                  size={60}
                  thickness={4}
                  sx={{ mr: 2 }}
                />
                <Typography variant="h4">
                  {data.profileCompleteness.percentage}%
                </Typography>
              </Box>
              {data.profileCompleteness.missingFields.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Missing fields:
                  </Typography>
                  {data.profileCompleteness.missingFields.map((field) => (
                    <Chip
                      key={field}
                      label={field}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Time Analytics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5">
                      {Math.round(data.totalTimeSpent / 60)}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Timeline sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h5">
                      {Math.round(data.averageTimePerCourse / 60)}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg per Course
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h5">
                      {metrics.learningEfficiency.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Efficiency
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
