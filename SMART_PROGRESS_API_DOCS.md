# Smart Progress-Tracking Dashboard - API Documentation

## Overview

The EduKnit LMS has been extended with a comprehensive smart progress-tracking dashboard that provides real-time analytics, dynamic course enrollment, curriculum delivery, lesson completion tracking, and intelligent progress monitoring with deviation analysis.

## New Backend API Endpoints

### Progress Tracking APIs

#### GET `/api/progress/smart/:courseId`
Get smart progress calculation with deviation tracking for a specific course.

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "abc123",
    "courseName": "JavaScript Fundamentals",
    "totalLessons": 40,
    "lessonsCompleted": 28,
    "daysElapsed": 21,
    "totalCourseDays": 60,
    "actualProgress": 70,
    "expectedProgress": 35,
    "deviation": 35,
    "label": "Ahead",
    "enrollmentDate": "2025-01-15T00:00:00.000Z",
    "lastActivity": "2025-02-05T14:30:00.000Z"
  }
}
```

#### GET `/api/progress/dashboard/:studentId`
Get comprehensive dashboard metrics for a student.

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student123",
    "metrics": {
      "enrolledCoursesCount": 5,
      "completedCoursesCount": 2,
      "overallProgress": 65,
      "totalStudyTimeHours": 45,
      "currentStreak": 7,
      "longestStreak": 14,
      "totalQuizzes": 25,
      "averageQuizScore": 85
    },
    "courses": [
      {
        "courseId": "course1",
        "title": "JavaScript Fundamentals",
        "progress": 70,
        "status": "IN_PROGRESS",
        "category": "Programming"
      }
    ],
    "upcomingDeadlines": [
      {
        "courseTitle": "React Development",
        "daysLeft": 5,
        "expectedDate": "2025-02-15T00:00:00.000Z"
      }
    ],
    "recentActivity": [
      {
        "type": "lesson_completion",
        "courseId": "course1",
        "lessonId": "lesson1",
        "completedAt": "2025-02-05T14:30:00.000Z",
        "timeSpent": 45
      }
    ]
  }
}
```

#### POST `/api/progress/lesson/complete`
Mark a lesson as completed.

**Request Body:**
```json
{
  "studentId": "student123",
  "programmeId": "course123",
  "moduleId": "module123",
  "lessonId": "lesson123",
  "timeSpent": 45
}
```

#### POST `/api/progress/quiz/submit`
Submit quiz results.

**Request Body:**
```json
{
  "studentId": "student123",
  "programmeId": "course123",
  "moduleId": "module123",
  "lessonId": "lesson123",
  "quizId": "quiz123",
  "score": 85,
  "maxScore": 100,
  "timeSpent": 30,
  "answers": [
    {
      "questionId": "q1",
      "answer": "option_a"
    }
  ],
  "passingScore": 70
}
```

### Enrollment APIs

#### POST `/api/student/enroll`
Enroll a student in a program.

**Request Body:**
```json
{
  "programmeId": "course123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "enrollment123",
    "studentId": "student123",
    "programmeId": "course123",
    "enrollmentDate": "2025-02-05T00:00:00.000Z",
    "status": "ENROLLED"
  }
}
```

### Analytics APIs

#### GET `/api/analytics/overview`
Get comprehensive analytics overview for a student.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCourses": 5,
    "completedCourses": 2,
    "inProgressCourses": 3,
    "averageProgress": 65,
    "totalStudyTime": 2700,
    "totalPoints": 1250,
    "totalAchievements": 8,
    "currentStreak": 7,
    "longestStreak": 14,
    "level": 3,
    "progressAnalysis": {
      "actualProgress": 65,
      "expectedProgress": 50,
      "deviation": 15,
      "label": "🚀 Ahead"
    },
    "recentActivity": [...]
  }
}
```

#### GET `/api/analytics/progress-history`
Get progress history over time.

#### GET `/api/analytics/category-performance`
Get performance breakdown by course category.

#### GET `/api/analytics/streaks`
Get learning and login streak information.

## New Database Models

### LessonCompletion
Tracks individual lesson completions for progress calculation.

```typescript
{
  userId: ObjectId,
  courseId: ObjectId,
  moduleId: ObjectId,
  lessonId: ObjectId,
  completedAt: Date,
  timeSpent: Number, // minutes
  score?: Number,
  notes?: String
}
```

### Programme (Enhanced)
Added `durationDays` field for smart progress calculation.

```typescript
{
  // ...existing fields
  durationDays: Number, // Expected course duration in days
  totalLessons: Number  // Total number of lessons
}
```

## Frontend Components

### Smart Progress Tracker Components

#### `SmartProgressTracker`
Real-time progress tracking with deviation analysis.

**Props:**
```typescript
interface SmartProgressTrackerProps {
  courseId: string;
  showDetails?: boolean;
  compact?: boolean;
}
```

#### `DeviationStatus`
Visual status indicator for learning progress.

**Props:**
```typescript
interface DeviationStatusProps {
  label: 'Ahead' | 'On Track' | 'Behind';
  deviation: number;
  className?: string;
}
```

### Curriculum Components

#### `CurriculumModule`
Module-based curriculum delivery with lesson cards.

#### `LessonCard`
Interactive lesson cards with completion tracking.

### Enrollment Components

#### `CourseEnrollmentModal`
Modal for course enrollment with success messaging.

## Custom Hooks

### `useCourseProgress`
Hook for managing course progress data.

```typescript
const { progressData, loading, error, refetch } = useCourseProgress(courseId);
```

### `useDashboardData`
Hook for dashboard metrics and data.

```typescript
const { dashboardData, loading, error, refetch } = useDashboardData();
```

### `useEnrollment`
Hook for course enrollment functionality.

```typescript
const { enrollInCourse, loading, error } = useEnrollment();
```

### `useLessonCompletion`
Hook for lesson completion and quiz submission.

```typescript
const { markLessonCompleted, submitQuiz, loading, error } = useLessonCompletion();
```

## Smart Progress Formulas

### Progress Calculation
```typescript
actualProgress = (lessonsCompleted / totalLessons) * 100
expectedProgress = (daysElapsed / totalCourseDays) * 100
deviation = actualProgress - expectedProgress
```

### Deviation Labels
- **Ahead**: deviation > +5%
- **On Track**: deviation between -5% and +5%
- **Behind**: deviation < -5%

## Environment Variables

No new environment variables are required. The system uses existing database and authentication configurations.

## Features Implemented

### ✅ Core Features
- [x] Dynamic course enrollment with modal UI
- [x] Smart progress tracking with deviation analysis
- [x] Real-time lesson completion tracking
- [x] Quiz submission and scoring
- [x] Comprehensive analytics dashboard
- [x] Learning streaks and gamification
- [x] Real-time student dashboard
- [x] Curriculum delivery with module/lesson hierarchy
- [x] Time-based progress expectations

### ✅ UI/UX Features
- [x] Animated components with Framer Motion
- [x] Responsive design with Tailwind CSS
- [x] Accessible components with ARIA labels
- [x] Loading states and error handling
- [x] Progress bars and status indicators
- [x] Toast notifications for actions

### ✅ Backend Features
- [x] RESTful API endpoints
- [x] MongoDB data models
- [x] JWT authentication
- [x] Input validation and error handling
- [x] Aggregation pipelines for analytics
- [x] Real-time progress calculation

## Testing

To test the implementation:

1. **Backend**: `npm run build` in `/backend` directory
2. **Frontend**: `npx tsc --noEmit` in `/frontend` directory
3. **Integration**: Start both servers and test enrollment flow

## Next Steps (Bonus Features)

- [ ] Weekly email progress reports
- [ ] Leaderboard implementation
- [ ] Motivational notifications
- [ ] Advanced analytics charts
- [ ] Export progress reports
- [ ] Mobile app integration

## API Rate Limiting

All endpoints respect the existing rate limiting configuration. No additional limits are imposed.

## Error Handling

All new endpoints follow the existing error response format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

This implementation provides a production-ready smart progress-tracking dashboard with zero static mock data, matching the existing UI design, and full integration with the backend APIs.
