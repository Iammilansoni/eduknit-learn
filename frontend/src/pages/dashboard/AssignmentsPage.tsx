import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Download,
  Eye,
  Calendar,
  BookOpen,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  dueDate: string;
  submittedAt?: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  submissionUrl?: string;
  attachments?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Mock assignments data (would be fetched from API)
  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'JavaScript Project Submission',
      description: 'Create a responsive web application using JavaScript, HTML, and CSS. Include at least 3 interactive features.',
      courseTitle: 'JavaScript Basics',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      priority: 'HIGH',
      attachments: ['project-requirements.pdf', 'rubric.docx']
    },
    {
      id: '2',
      title: 'Data Visualization Assignment',
      description: 'Create interactive data visualizations using D3.js or Chart.js. Analyze a dataset and present findings.',
      courseTitle: 'Data Science Fundamentals',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'MEDIUM',
      submissionUrl: 'https://github.com/student/data-viz-project'
    },
    {
      id: '3',
      title: 'Marketing Plan Draft',
      description: 'Submit first draft of comprehensive marketing plan for a fictional product or service.',
      courseTitle: 'Digital Marketing Mastery',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'OVERDUE',
      priority: 'HIGH'
    },
    {
      id: '4',
      title: 'CSS Layout Exercise',
      description: 'Create a responsive layout using CSS Grid and Flexbox. Implement mobile-first design principles.',
      courseTitle: 'Web Development Fundamentals',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      priority: 'LOW',
      attachments: ['layout-requirements.pdf']
    },
    {
      id: '5',
      title: 'Python Data Analysis',
      description: 'Analyze a dataset using Python pandas and matplotlib. Create visualizations and write a report.',
      courseTitle: 'Python Programming',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'GRADED',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      grade: 85,
      maxGrade: 100,
      feedback: 'Excellent analysis and visualizations. Consider adding more statistical insights in future assignments.',
      priority: 'MEDIUM'
    }
  ];

  // Filter assignments
  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group assignments by status
  const pendingAssignments = filteredAssignments.filter(a => a.status === 'PENDING');
  const submittedAssignments = filteredAssignments.filter(a => a.status === 'SUBMITTED');
  const gradedAssignments = filteredAssignments.filter(a => a.status === 'GRADED');
  const overdueAssignments = filteredAssignments.filter(a => a.status === 'OVERDUE');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'GRADED':
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  const getGradeColor = (grade?: number, maxGrade?: number) => {
    if (!grade || !maxGrade) return 'text-gray-600';
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    // This would open a file upload dialog or submission form
    console.log('Submit assignment:', assignmentId);
  };

  const handleViewSubmission = (assignmentId: string) => {
    // This would open the submission details
    console.log('View submission:', assignmentId);
  };

  const handleDownloadAttachment = (attachment: string) => {
    // This would trigger a download
    console.log('Download attachment:', attachment);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your assignments, deadlines, and grades
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduBlue-600">{mockAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting grades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gradedAssignments.length > 0 
                  ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {gradedAssignments.length} graded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="GRADED">Graded</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({filteredAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                          </div>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getDaysRemaining(assignment.dueDate)}
                            </div>
                          </div>
                        </div>
                        {assignment.grade !== undefined && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(assignment.grade, assignment.maxGrade)}`}>
                              {assignment.grade}/{assignment.maxGrade}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round((assignment.grade / (assignment.maxGrade || 1)) * 100)}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attachments */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((attachment, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {attachment}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {assignment.status === 'PENDING' && (
                            <Button onClick={() => handleSubmitAssignment(assignment.id)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Assignment
                            </Button>
                          )}
                          {assignment.status === 'SUBMITTED' && (
                            <Button variant="outline" onClick={() => handleViewSubmission(assignment.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Submission
                            </Button>
                          )}
                          {assignment.status === 'GRADED' && (
                            <Button variant="outline" onClick={() => handleViewSubmission(assignment.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Feedback
                            </Button>
                          )}
                          {assignment.status === 'OVERDUE' && (
                            <Button onClick={() => handleSubmitAssignment(assignment.id)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Late
                            </Button>
                          )}
                        </div>
                        {assignment.submittedAt && (
                          <div className="text-sm text-gray-500">
                            Submitted: {formatDate(assignment.submittedAt)}
                          </div>
                        )}
                      </div>

                      {/* Feedback */}
                      {assignment.feedback && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                          <p className="text-sm text-gray-600">{assignment.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold mb-2">No pending assignments</h3>
                  <p className="text-gray-600">Great job! All assignments are up to date.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                          </div>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getDaysRemaining(assignment.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => handleSubmitAssignment(assignment.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-6">
            {submittedAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-lg font-semibold mb-2">No submitted assignments</h3>
                  <p className="text-gray-600">Submit your first assignment to see it here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submittedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                          </div>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Submitted: {assignment.submittedAt ? formatDate(assignment.submittedAt) : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => handleViewSubmission(assignment.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-6">
            {gradedAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold mb-2">No graded assignments</h3>
                  <p className="text-gray-600">Your graded assignments will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {gradedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                          </div>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                          </div>
                        </div>
                        {assignment.grade !== undefined && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(assignment.grade, assignment.maxGrade)}`}>
                              {assignment.grade}/{assignment.maxGrade}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round((assignment.grade / (assignment.maxGrade || 1)) * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mb-4 p-3 bg-white rounded-lg border">
                          <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                          <p className="text-sm text-gray-600">{assignment.feedback}</p>
                        </div>
                      )}
                      <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => handleViewSubmission(assignment.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-6">
            {overdueAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold mb-2">No overdue assignments</h3>
                  <p className="text-gray-600">Excellent! You're keeping up with all deadlines.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {overdueAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-red-200 bg-red-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            {getStatusBadge(assignment.status)}
                            {getPriorityBadge(assignment.priority)}
                          </div>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.courseTitle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              {getDaysRemaining(assignment.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => handleSubmitAssignment(assignment.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Late
                        </Button>
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

export default AssignmentsPage; 