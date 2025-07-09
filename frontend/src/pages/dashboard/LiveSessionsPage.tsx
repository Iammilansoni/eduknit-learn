import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Clock, 
  Users, 
  Calendar,
  ExternalLink,
  Play,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { Input } from '@/components/ui/input';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  instructor: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  zoomLink?: string;
  meetingId?: string;
  password?: string;
  maxParticipants: number;
  currentParticipants: number;
  topics: string[];
  recordingUrl?: string;
}

const LiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock live sessions data (would be fetched from API)
  const mockLiveSessions: LiveSession[] = [
    {
      id: '1',
      title: 'Advanced CSS Techniques',
      description: 'Learn advanced CSS techniques including Grid, Flexbox, and modern layout methods.',
      courseTitle: 'Web Development Fundamentals',
      instructor: 'Dr. Sarah Johnson',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      status: 'UPCOMING',
      zoomLink: 'https://zoom.us/j/123456789',
      meetingId: '123 456 789',
      password: 'css2024',
      maxParticipants: 50,
      currentParticipants: 23,
      topics: ['CSS Grid', 'Flexbox', 'Responsive Design', 'CSS Variables']
    },
    {
      id: '2',
      title: 'JavaScript Fundamentals Q&A',
      description: 'Open Q&A session for JavaScript fundamentals. Bring your questions!',
      courseTitle: 'JavaScript Basics',
      instructor: 'Prof. Michael Chen',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      status: 'UPCOMING',
      zoomLink: 'https://zoom.us/j/987654321',
      meetingId: '987 654 321',
      password: 'jsqa2024',
      maxParticipants: 30,
      currentParticipants: 15,
      topics: ['JavaScript Basics', 'DOM Manipulation', 'Event Handling', 'Q&A']
    },
    {
      id: '3',
      title: 'Data Visualization Workshop',
      description: 'Hands-on workshop on creating interactive data visualizations with D3.js.',
      courseTitle: 'Data Science Fundamentals',
      instructor: 'Dr. Emily Rodriguez',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      duration: 90,
      status: 'COMPLETED',
      recordingUrl: 'https://example.com/recording/data-viz-workshop',
      maxParticipants: 40,
      currentParticipants: 35,
      topics: ['D3.js', 'Data Visualization', 'Interactive Charts', 'Best Practices']
    },
    {
      id: '4',
      title: 'Python Data Analysis Live Coding',
      description: 'Live coding session demonstrating Python data analysis with pandas and matplotlib.',
      courseTitle: 'Python Programming',
      instructor: 'Prof. David Kim',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      status: 'UPCOMING',
      zoomLink: 'https://zoom.us/j/456789123',
      meetingId: '456 789 123',
      password: 'python2024',
      maxParticipants: 45,
      currentParticipants: 28,
      topics: ['Pandas', 'Matplotlib', 'Data Cleaning', 'Statistical Analysis']
    },
    {
      id: '5',
      title: 'Digital Marketing Strategy Session',
      description: 'Interactive session on developing effective digital marketing strategies.',
      courseTitle: 'Digital Marketing Mastery',
      instructor: 'Prof. Lisa Thompson',
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000).toISOString(),
      duration: 75,
      status: 'COMPLETED',
      recordingUrl: 'https://example.com/recording/marketing-strategy',
      maxParticipants: 35,
      currentParticipants: 30,
      topics: ['Marketing Strategy', 'Social Media', 'Content Marketing', 'Analytics']
    }
  ];

  // Filter sessions based on search
  const filteredSessions = mockLiveSessions.filter(session => {
    return session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           session.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           session.instructor.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group sessions by status
  const upcomingSessions = filteredSessions.filter(s => s.status === 'UPCOMING');
  const liveSessions = filteredSessions.filter(s => s.status === 'LIVE');
  const completedSessions = filteredSessions.filter(s => s.status === 'COMPLETED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'LIVE':
        return <Badge className="bg-green-100 text-green-800">Live Now</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTimeUntil = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffTime < 0) {
      return 'Started';
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} away`;
    } else {
      return 'Starting now';
    }
  };

  const handleJoinSession = (session: LiveSession) => {
    if (session.zoomLink) {
      window.open(session.zoomLink, '_blank');
    }
  };

  const handleViewRecording = (recordingUrl: string) => {
    window.open(recordingUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Sessions</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Join live learning sessions and interact with instructors
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduBlue-600">{mockLiveSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                All time sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Now</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{liveSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Past sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search live sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live Now ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600">Check back later for new live sessions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                          <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(session.status)}
                            <Badge variant="outline">{session.courseTitle}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Session Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Instructor</div>
                          <div className="text-gray-600">{session.instructor}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Duration</div>
                          <div className="text-gray-600">{formatDuration(session.duration)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Start Time</div>
                          <div className="text-gray-600">{formatDateTime(session.startTime)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Time Until</div>
                          <div className="text-blue-600 font-medium">{getTimeUntil(session.startTime)}</div>
                        </div>
                      </div>

                      {/* Topics */}
                      <div>
                        <div className="font-medium text-gray-900 mb-2">Topics Covered:</div>
                        <div className="flex flex-wrap gap-1">
                          {session.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {session.currentParticipants}/{session.maxParticipants} participants
                        </div>
                        {session.zoomLink && (
                          <Button onClick={() => handleJoinSession(session)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                        )}
                      </div>

                      {/* Meeting Info */}
                      {session.meetingId && (
                        <div className="p-3 bg-white rounded-lg border text-sm">
                          <div className="font-medium mb-1">Meeting Information:</div>
                          <div className="space-y-1 text-gray-600">
                            <div>Meeting ID: {session.meetingId}</div>
                            {session.password && <div>Password: {session.password}</div>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            {liveSessions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No live sessions right now</h3>
                  <p className="text-gray-600">Check the upcoming tab for scheduled sessions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center gap-2">
                            {session.title}
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          </CardTitle>
                          <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(session.status)}
                            <Badge variant="outline">{session.courseTitle}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Instructor</div>
                          <div className="text-gray-600">{session.instructor}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Duration</div>
                          <div className="text-gray-600">{formatDuration(session.duration)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Start Time</div>
                          <div className="text-gray-600">{formatDateTime(session.startTime)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Status</div>
                          <div className="text-green-600 font-medium">Live Now</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {session.currentParticipants}/{session.maxParticipants} participants
                        </div>
                        {session.zoomLink && (
                          <Button onClick={() => handleJoinSession(session)}>
                            <Play className="h-4 w-4 mr-2" />
                            Join Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedSessions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No completed sessions</h3>
                  <p className="text-gray-600">Completed sessions will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedSessions.map((session) => (
                  <Card key={session.id} className="border-gray-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                          <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(session.status)}
                            <Badge variant="outline">{session.courseTitle}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Instructor</div>
                          <div className="text-gray-600">{session.instructor}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Duration</div>
                          <div className="text-gray-600">{formatDuration(session.duration)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Start Time</div>
                          <div className="text-gray-600">{formatDateTime(session.startTime)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Participants</div>
                          <div className="text-gray-600">{session.currentParticipants}/{session.maxParticipants}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4" />
                          Session completed
                        </div>
                        {session.recordingUrl && (
                          <Button variant="outline" onClick={() => handleViewRecording(session.recordingUrl!)}>
                            <Play className="h-4 w-4 mr-2" />
                            Watch Recording
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LiveSessionsPage; 