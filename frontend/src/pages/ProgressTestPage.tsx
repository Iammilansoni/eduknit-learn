import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { progressApi as progressAPI } from '../services/progressApi';
import { userApi as userAPI } from '../services/userApi';

const ProgressTestPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});

  const testEndpoint = async (endpointName: string, apiCall: () => Promise<any>) => {
    setLoading(endpointName);
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [endpointName]: result }));
    } catch (error) {
      console.error(`Error testing ${endpointName}:`, error);
      setResults(prev => ({ ...prev, [endpointName]: { error: error.message } }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Progress API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New High Priority APIs */}
        <Card>
          <CardHeader>
            <CardTitle>🔥 High Priority APIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => testEndpoint('General Progress', () => progressAPI.getGeneralProgress())}
              disabled={loading === 'General Progress'}
              className="w-full"
            >
              {loading === 'General Progress' ? 'Loading...' : 'GET /api/progress'}
            </Button>
            
            <Button
              onClick={() => testEndpoint('User Courses', () => userAPI.getUserCourses())}
              disabled={loading === 'User Courses'}
              className="w-full"
            >
              {loading === 'User Courses' ? 'Loading...' : 'GET /api/user/courses'}
            </Button>
            
            <Button
              onClick={() => testEndpoint('User Learning Stats', () => userAPI.getUserLearningStats())}
              disabled={loading === 'User Learning Stats'}
              className="w-full"
            >
              {loading === 'User Learning Stats' ? 'Loading...' : 'GET /api/user/learning-stats'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Progress APIs */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Progress APIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => testEndpoint('Progress Dashboard', () => progressAPI.getProgressDashboard('test-user-id'))}
              disabled={loading === 'Progress Dashboard'}
              className="w-full"
            >
              {loading === 'Progress Dashboard' ? 'Loading...' : 'GET /api/progress/dashboard/:studentId'}
            </Button>
            
            <Button
              onClick={() => testEndpoint('Smart Progress', () => progressAPI.getSmartProgress('test-course-id'))}
              disabled={loading === 'Smart Progress'}
              className="w-full"
            >
              {loading === 'Smart Progress' ? 'Loading...' : 'GET /api/progress/smart/:courseId'}
            </Button>
            
            <Button
              onClick={() => testEndpoint('Course Progress', () => progressAPI.getCourseProgress('test-user-id', 'test-course-id'))}
              disabled={loading === 'Course Progress'}
              className="w-full"
            >
              {loading === 'Course Progress' ? 'Loading...' : 'GET /api/progress/course/:studentId/:programmeId'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      <Card>
        <CardHeader>
          <CardTitle>API Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]) => (
              <div key={endpoint} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{endpoint}</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>🔥 General Progress:</strong> GET /api/progress</p>
            <p><strong>🔥 User Courses:</strong> GET /api/user/courses</p>
            <p><strong>🔥 User Learning Stats:</strong> GET /api/user/learning-stats</p>
            <p><strong>Course Progress Details:</strong> GET /api/progress/course-details/{'{courseId}'}</p>
            <p><strong>Student Progress:</strong> GET /api/progress/student/{'{studentId}'}</p>
            <p><strong>Mark Lesson Complete:</strong> POST /api/progress/lesson/{'{lessonId}'}/complete</p>
            <p><strong>Update Lesson Progress:</strong> PUT /api/progress/lesson/{'{lessonId}'}/progress</p>
            <p><strong>Record Quiz Result:</strong> POST /api/progress/lesson/{'{lessonId}'}/quiz</p>
            <p><strong>Get Quiz Results:</strong> GET /api/progress/quiz/{'{studentId}'}/{'{lessonId}'}</p>
            <p><strong>Progress Dashboard:</strong> GET /api/progress/dashboard/{'{studentId}'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTestPage;
