import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  BookOpen,
  AlertCircle,
  Plus
} from 'lucide-react';
import { studentApi as studentAPI } from '@/services/studentApi';
import { useAuth } from '@/contexts/AuthContextUtils';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'LIVE_SESSION' | 'DEADLINE' | 'ASSIGNMENT' | 'QUIZ';
  courseTitle?: string;
  zoomLink?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch calendar events (this would be implemented in the backend)
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => Promise.resolve({ data: { events: [] } }), // Mock data for now
    enabled: !!user?.id,
  });

  const events = (eventsData?.data?.events || []) as CalendarEvent[];

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Advanced CSS Techniques',
      description: 'Live session on advanced CSS techniques and best practices',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      time: '15:30 - 17:00',
      type: 'LIVE_SESSION',
      courseTitle: 'Web Development Fundamentals',
      zoomLink: 'https://zoom.us/j/123456789',
      priority: 'HIGH'
    },
    {
      id: '2',
      title: 'JavaScript Project Submission',
      description: 'Final project submission deadline',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      type: 'DEADLINE',
      courseTitle: 'JavaScript Basics',
      priority: 'HIGH'
    },
    {
      id: '3',
      title: 'Data Visualization Assignment',
      description: 'Assignment on creating interactive data visualizations',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      type: 'ASSIGNMENT',
      courseTitle: 'Data Science Fundamentals',
      priority: 'MEDIUM'
    },
    {
      id: '4',
      title: 'Marketing Plan Draft',
      description: 'Submit first draft of marketing plan',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      type: 'DEADLINE',
      courseTitle: 'Digital Marketing Mastery',
      priority: 'LOW'
    }
  ];

  const allEvents = [...events, ...mockEvents];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LIVE_SESSION':
        return <Video className="h-4 w-4" />;
      case 'DEADLINE':
        return <AlertCircle className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <BookOpen className="h-4 w-4" />;
      case 'QUIZ':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'LIVE_SESSION':
        return <Badge className="bg-blue-100 text-blue-800">Live Session</Badge>;
      case 'DEADLINE':
        return <Badge className="bg-red-100 text-red-800">Deadline</Badge>;
      case 'ASSIGNMENT':
        return <Badge className="bg-purple-100 text-purple-800">Assignment</Badge>;
      case 'QUIZ':
        return <Badge className="bg-orange-100 text-orange-800">Quiz</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return allEvents
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    const today = new Date();
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    });
  };

  const upcomingEvents = getUpcomingEvents();
  const todayEvents = getTodayEvents();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your learning schedule and upcoming events
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Learning Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Today's Events */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No events today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          {getPriorityBadge(event.priority)}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        {event.time && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.time)}
                          </div>
                        )}
                        {event.courseTitle && (
                          <p className="text-xs text-gray-500">{event.courseTitle}</p>
                        )}
                        {event.zoomLink && (
                          <Button size="sm" className="mt-2 w-full">
                            Join Session
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          {getPriorityBadge(event.priority)}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.time)}
                          </div>
                        )}
                        {event.courseTitle && (
                          <p className="text-xs text-gray-500">{event.courseTitle}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {getEventTypeBadge(event.type)}
                          {event.zoomLink && (
                            <Button size="sm" variant="outline">
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Events List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            {allEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                <p className="text-gray-600 mb-4">
                  Your learning calendar is empty. Check back for upcoming events and deadlines.
                </p>
                <Button>Browse Courses</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {allEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDate(event.date)}</div>
                          {event.time && (
                            <div className="text-xs text-gray-500">{formatTime(event.time)}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getEventTypeBadge(event.type)}
                          {getPriorityBadge(event.priority)}
                        </div>
                        {event.zoomLink && (
                          <Button size="sm">
                            Join Session
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage; 