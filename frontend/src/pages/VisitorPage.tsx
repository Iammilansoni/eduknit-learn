import React from 'react';
import { useAuth } from '@/contexts/AuthContextUtils';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  BookOpen,
  Users,
  ArrowRight,
  Lock,
  Star
} from 'lucide-react';

const VisitorPage = () => {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to EduKnit Learn!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Hello {user?.firstName || user?.username}! You're currently browsing as a visitor.
            </p>
            <Badge className="mt-2" variant="secondary">Visitor Access</Badge>
          </div>

          {/* Upgrade CTA */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Unlock Your Full Learning Potential</CardTitle>
              <CardDescription>
                Upgrade to a full account to access all courses, track your progress, and earn certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" className="mr-4">
                <Star className="h-4 w-4 mr-2" />
                Upgrade to Full Access
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>100+ Courses</CardTitle>
                <CardDescription>
                  Access our comprehensive library of courses across various subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Full access with upgrade
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your learning progress and earn achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Full access with upgrade
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>
                  Earn certificates upon course completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Full access with upgrade
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Courses Preview</CardTitle>
              <CardDescription>
                Get a glimpse of what you can learn with full access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">JavaScript Fundamentals</h3>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn the basics of JavaScript programming language
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">8 modules • 12 hours</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Data Science Essentials</h3>
                    <Badge variant="secondary">Intermediate</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Master the fundamentals of data science and analytics
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">10 modules • 20 hours</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">UI/UX Design Principles</h3>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn modern design principles and user experience
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">6 modules • 15 hours</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Python for Beginners</h3>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Start your programming journey with Python
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">12 modules • 18 hours</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Button size="lg" className="mr-4">
              <ArrowRight className="h-4 w-4 mr-2" />
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisitorPage; 