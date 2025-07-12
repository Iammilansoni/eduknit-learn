import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreHorizontal,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useQueryClient } from '@tanstack/react-query';

// Course form schema
const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['AI_CERTIFICATE', 'DATA_CERTIFICATION', 'PROFESSIONAL_SKILLS', 'TECHNICAL_SKILLS']),
  instructor: z.string().min(1, 'Instructor is required').max(100, 'Instructor must be less than 100 characters'),
  duration: z.string().optional(),
  timeframe: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).default('BEGINNER'),
  price: z.number().min(0, 'Price must be positive').default(0),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  overview: z.string().max(2000, 'Overview must be less than 2000 characters').optional(),
  skills: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  totalModules: z.number().min(0, 'Total modules must be positive').default(0),
  totalLessons: z.number().min(0, 'Total lessons must be positive').default(0),
  estimatedDuration: z.number().min(0, 'Estimated duration must be positive').default(0),
  durationDays: z.number().min(1, 'Duration days must be positive').default(30),
  certificateAwarded: z.boolean().default(true),
  imageUrl: z.string().url('Must be a valid URL').optional()
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  timeframe: string;
  level: string;
  price: number;
  currency: string;
  overview?: string;
  skills: string[];
  prerequisites: string[];
  totalModules: number;
  totalLessons: number;
  estimatedDuration: number;
  durationDays: number;
  certificateAwarded: boolean;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { username: string; email: string };
  lastModifiedBy: { username: string; email: string };
  modulesCount?: number;
  lessonsCount?: number;
}

interface CourseStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  modulesCount: number;
  lessonsCount: number;
}

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    level: 'all',
    status: 'all'
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: 'BEGINNER',
      price: 0,
      currency: 'USD',
      skills: [],
      prerequisites: [],
      totalModules: 0,
      totalLessons: 0,
      estimatedDuration: 0,
      durationDays: 30,
      certificateAwarded: true
    }
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const paramsObj: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) paramsObj.search = filters.search;
      if (filters.category && filters.category !== 'all') paramsObj.category = filters.category;
      if (filters.level && filters.level !== 'all') paramsObj.level = filters.level;
      if (filters.status && filters.status !== 'all') paramsObj.status = filters.status;
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`/api/admin/courses?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data.data.courses);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch course stats
  const fetchCourseStats = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCourseStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching course stats:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, filters]);

  // Create course
  const onSubmit = async (data: CourseFormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          isActive: true,
          createdBy: user?.id,
          lastModifiedBy: user?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create course' }));
        throw new Error(errorData.message || 'Failed to create course');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Course created successfully",
        });
        setShowCreateDialog(false);
        reset();
        fetchCourses();
        
        // Invalidate related queries to update programs page
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['course-mapping'] });
      } else {
        throw new Error(result.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId: string, forceDelete: boolean = false) => {
    const confirmMessage = forceDelete 
      ? 'Are you sure you want to force delete this course? This will also delete all enrollments and cannot be undone.'
      : 'Are you sure you want to delete this course? This action cannot be undone.';
      
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('Attempting to delete course with ID:', courseId, 'Force:', forceDelete);
      const url = forceDelete 
        ? `/api/admin/courses/${courseId}?force=true`
        : `/api/admin/courses/${courseId}`;
        
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('Delete response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete course';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0].message || errorMessage;
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON:', jsonError);
          const textError = await response.text();
          console.log('Error response text:', textError);
        }
        
        // If it's an enrollment error and not already a force delete, offer force delete option
        if (!forceDelete && errorMessage.includes('active enrollments')) {
          const forceDeleteConfirm = confirm(
            `${errorMessage}\n\nWould you like to force delete this course along with all its enrollments?`
          );
          if (forceDeleteConfirm) {
            return handleDeleteCourse(courseId, true);
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Delete success response:', result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: forceDelete 
            ? "Course and all enrollments deleted successfully"
            : "Course deleted successfully"
        });
        fetchCourses();
      } else {
        throw new Error(result.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive"
      });
    }
  };

  // Toggle course status
  const handleToggleStatus = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const response = await fetch(`/api/admin/courses/${courseId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isActive: !course.isActive,
          lastModifiedBy: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course status');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Course ${course.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchCourses();
        
        // Invalidate related queries to update programs page
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['course-mapping'] });
      } else {
        throw new Error(result.message || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course status",
        variant: "destructive"
      });
    }
  };

  // Edit course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setValue('title', course.title);
    setValue('description', course.description);
    setValue('category', course.category as any);
    setValue('instructor', course.instructor);
    setValue('duration', course.duration);
    setValue('timeframe', course.timeframe);
    setValue('level', course.level as any);
    setValue('price', course.price);
    setValue('currency', course.currency);
    setValue('overview', course.overview);
    setValue('skills', course.skills);
    setValue('prerequisites', course.prerequisites);
    setValue('totalModules', course.totalModules);
    setValue('totalLessons', course.totalLessons);
    setValue('estimatedDuration', course.estimatedDuration);
    setValue('durationDays', course.durationDays);
    setValue('certificateAwarded', course.certificateAwarded);
    setValue('imageUrl', course.imageUrl);
    setShowEditDialog(true);
  };

  // View course details
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchCourseStats(course.id);
  };

  // Update course
  const handleUpdateCourse = async (data: CourseFormData) => {
    if (!editingCourse) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          lastModifiedBy: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        setShowEditDialog(false);
        setEditingCourse(null);
        reset();
        fetchCourses();
        
        // Invalidate related queries to update programs page
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['course-mapping'] });
      } else {
        throw new Error(result.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'AI_CERTIFICATE': 'bg-blue-100 text-blue-800',
      'DATA_CERTIFICATION': 'bg-green-100 text-green-800',
      'PROFESSIONAL_SKILLS': 'bg-purple-100 text-purple-800',
      'TECHNICAL_SKILLS': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
      'ADVANCED': 'bg-red-100 text-red-800',
      'ALL_LEVELS': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">Manage all courses and their content</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new course
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Course title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Input
                      id="instructor"
                      {...register('instructor')}
                      placeholder="Instructor name"
                    />
                    {errors.instructor && (
                      <p className="text-red-500 text-sm mt-1">{errors.instructor.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => setValue('category', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI_CERTIFICATE">AI Certificate</SelectItem>
                        <SelectItem value="DATA_CERTIFICATION">Data Certification</SelectItem>
                        <SelectItem value="PROFESSIONAL_SKILLS">Professional Skills</SelectItem>
                        <SelectItem value="TECHNICAL_SKILLS">Technical Skills</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select onValueChange={(value) => setValue('level', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      {...register('currency')}
                      placeholder="USD"
                      maxLength={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      {...register('duration')}
                      placeholder="e.g., 3-5 hours/week"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Input
                      id="timeframe"
                      {...register('timeframe')}
                      placeholder="e.g., 1-2 months"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalModules">Total Modules</Label>
                    <Input
                      id="totalModules"
                      type="number"
                      {...register('totalModules', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalLessons">Total Lessons</Label>
                    <Input
                      id="totalLessons"
                      type="number"
                      {...register('totalLessons', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      step="0.1"
                      {...register('estimatedDuration', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="durationDays">Duration Days</Label>
                    <Input
                      id="durationDays"
                      type="number"
                      {...register('durationDays', { valueAsNumber: true })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Course description"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="overview">Overview</Label>
                  <Textarea
                    id="overview"
                    {...register('overview')}
                    placeholder="Detailed course overview"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="AI_CERTIFICATE">AI Certificate</SelectItem>
                    <SelectItem value="DATA_CERTIFICATION">Data Certification</SelectItem>
                    <SelectItem value="PROFESSIONAL_SKILLS">Professional Skills</SelectItem>
                    <SelectItem value="TECHNICAL_SKILLS">Technical Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level-filter">Level</Label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Courses ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.description.substring(0, 50)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(course.category)}>
                            {course.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {course.price > 0 ? (
                            <span className="font-medium">
                              {course.currency} {course.price}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">Free</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.isActive ? "default" : "secondary"}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{course.modulesCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(course.id)}
                            >
                              {course.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                            isActive={page === pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                          className={pagination.page === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Course Details Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedCourse && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedCourse.title}</DialogTitle>
                  <DialogDescription>
                    Course details and statistics
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Course Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Description:</span> {selectedCourse.description}</div>
                        <div><span className="font-medium">Instructor:</span> {selectedCourse.instructor}</div>
                        <div><span className="font-medium">Category:</span> 
                          <Badge className={`ml-2 ${getCategoryColor(selectedCourse.category)}`}>
                            {selectedCourse.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div><span className="font-medium">Level:</span> 
                          <Badge className={`ml-2 ${getLevelColor(selectedCourse.level)}`}>
                            {selectedCourse.level}
                          </Badge>
                        </div>
                        <div><span className="font-medium">Duration:</span> {selectedCourse.duration}</div>
                        <div><span className="font-medium">Timeframe:</span> {selectedCourse.timeframe}</div>
                        <div><span className="font-medium">Price:</span> {selectedCourse.currency} {selectedCourse.price}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Statistics</h3>
                      {courseStats ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{courseStats.totalEnrollments}</div>
                            <div className="text-sm text-blue-600">Total Enrollments</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{courseStats.activeEnrollments}</div>
                            <div className="text-sm text-green-600">Active</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{courseStats.completedEnrollments}</div>
                            <div className="text-sm text-purple-600">Completed</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{courseStats.averageProgress.toFixed(1)}%</div>
                            <div className="text-sm text-orange-600">Avg Progress</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">Loading statistics...</div>
                      )}
                    </div>
                  </div>
                  
                  {selectedCourse.overview && (
                    <div>
                      <h3 className="font-semibold mb-2">Overview</h3>
                      <p className="text-sm text-gray-600">{selectedCourse.overview}</p>
                    </div>
                  )}

                  {selectedCourse.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Skills Covered</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Prerequisites</h3>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {selectedCourse.prerequisites.map((prereq, index) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdateCourse)} className="space-y-6">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    {...register('title')}
                    placeholder="Course title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-instructor">Instructor *</Label>
                  <Input
                    id="edit-instructor"
                    {...register('instructor')}
                    placeholder="Instructor name"
                  />
                  {errors.instructor && (
                    <p className="text-red-500 text-sm mt-1">{errors.instructor.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI_CERTIFICATE">AI Certificate</SelectItem>
                      <SelectItem value="DATA_CERTIFICATION">Data Certification</SelectItem>
                      <SelectItem value="PROFESSIONAL_SKILLS">Professional Skills</SelectItem>
                      <SelectItem value="TECHNICAL_SKILLS">Technical Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-level">Level</Label>
                  <Select onValueChange={(value) => setValue('level', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Input
                    id="edit-currency"
                    {...register('currency')}
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  {...register('description')}
                  placeholder="Course description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-overview">Overview</Label>
                <Textarea
                  id="edit-overview"
                  {...register('overview')}
                  placeholder="Detailed course overview"
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingCourse(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Course'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminCourseManagement; 