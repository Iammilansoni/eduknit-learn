import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Clock,
  ArrowLeft,
  List,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextUtils';

// Module form schema
const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  order: z.number().min(1, 'Order must be at least 1'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute'),
  objectives: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number;
  objectives: string[];
  prerequisites: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { username: string; email: string };
  lastModifiedBy: { username: string; email: string };
  lessonsCount?: number;
  courseId: string;
  courseTitle?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
}

const AdminModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  // Ensure pagination is always initialized with proper defaults
  const [pagination, setPagination] = useState(() => ({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }));
  const [filters, setFilters] = useState({
    search: '',
    courseId: 'all', // Start with 'all' to show modules from all courses
    status: 'all'
  });

  // Use ref to track if we're in the middle of a fetch to prevent infinite loops
  const isFetchingRef = useRef(false);

  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      order: 1,
      estimatedDuration: 30,
      objectives: [],
      prerequisites: [],
      isActive: true
    }
  });

  // Fetch modules with proper dependency management
  const fetchModules = useCallback(async (specificPage?: number, specificLimit?: number) => {
    if (isFetchingRef.current) return; // Prevent concurrent fetches
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const paramsObj: Record<string, string | number> = {
        page: specificPage || pagination.page,
        limit: specificLimit || pagination.limit,
      };
      if (filters.search) paramsObj.search = filters.search;
      if (filters.courseId && filters.courseId !== 'all') paramsObj.programmeId = filters.courseId;
      if (filters.status && filters.status !== 'all') paramsObj.status = filters.status;
      if (courseId) paramsObj.programmeId = courseId;
      
      // Convert all values to strings for URLSearchParams
      const stringParams: Record<string, string> = {};
      Object.entries(paramsObj).forEach(([key, value]) => {
        stringParams[key] = String(value);
      });
      
      const params = new URLSearchParams(stringParams);
      const response = await fetch(`/api/admin/modules?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      const data = await response.json();
      setModules(data.data.modules);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [filters.search, filters.courseId, filters.status, courseId, toast, pagination.page, pagination.limit]);

  // Fetch courses for filter
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/courses?limit=100', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
      } else {
        console.error('Failed to fetch courses:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  // Load courses once on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Load modules and handle pagination/filter changes
  useEffect(() => {
    // Use a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      fetchModules();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [fetchModules]);

  // Create/Update module
  const onSubmit = async (data: ModuleFormData) => {
    try {
      const url = editingModule 
        ? `/api/admin/modules/${editingModule.id}`
        : '/api/admin/modules';
      
      const method = editingModule ? 'PUT' : 'POST';
      
      const payload = {
        ...data,
        courseId: courseId || filters.courseId !== 'all' ? filters.courseId : undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save module');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: editingModule ? "Module updated successfully" : "Module created successfully",
      });

      setShowCreateDialog(false);
      setShowEditDialog(false);
      setEditingModule(null);
      reset();
      fetchModules();
    } catch (error: unknown) {
      console.error('Error saving module:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save module",
        variant: "destructive"
      });
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete module');
      }

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });

      fetchModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive"
      });
    }
  };

  // Toggle module status
  const handleToggleStatus = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle module status');
      }

      toast({
        title: "Success",
        description: "Module status updated successfully",
      });

      fetchModules();
    } catch (error) {
      console.error('Error toggling module status:', error);
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive"
      });
    }
  };

  // Edit module
  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setValue('title', module.title);
    setValue('description', module.description);
    setValue('order', module.order);
    setValue('estimatedDuration', module.estimatedDuration);
    setValue('objectives', module.objectives);
    setValue('prerequisites', module.prerequisites);
    setValue('isActive', module.isActive);
    setShowEditDialog(true);
  };

  // View module details
  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
  };

  // Navigate to lessons management
  const handleManageLessons = (moduleId: string) => {
    navigate(`/admin/modules/${moduleId}/lessons`);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Layout>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/courses')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Courses</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Module Management</h1>
              <p className="text-gray-600 mt-1">
                {courseId ? `Managing modules for course` : 'Manage all course modules'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Module</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search modules..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              {!courseId && (
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={filters.courseId}
                    onValueChange={(value) => setFilters({ ...filters, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All courses</SelectItem>
                      {Array.isArray(courses) ? courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', courseId: 'all', status: 'all' })}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>
              {pagination?.total || 0} modules found
            </CardDescription>
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
                      <TableHead>Course</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(modules) ? modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {module.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{module.courseTitle || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{module.order}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDuration(module.estimatedDuration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{module.lessonsCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(module.isActive)}>
                            {module.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(module.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewModule(module)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageLessons(module.id)}
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditModule(module)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(module.id)}
                            >
                              {module.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : null}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination?.pages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPagination({ ...pagination, page: Math.max(1, (pagination?.page || 1) - 1) })}
                            className={(pagination?.page || 1) <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: pagination?.pages || 0 }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setPagination({ ...pagination, page })}
                              className={(pagination?.page || 1) === page ? 'bg-primary text-primary-foreground' : 'cursor-pointer'}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPagination({ ...pagination, page: Math.min((pagination?.pages || 1), (pagination?.page || 1) + 1) })}
                            className={(pagination?.page || 1) >= (pagination?.pages || 1) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Module Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new module to the course. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Module title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="order">Order *</Label>
                  <Input
                    id="order"
                    type="number"
                    {...register('order', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.order && (
                    <p className="text-sm text-red-600 mt-1">{errors.order.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Module description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration (minutes) *</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="30"
                  />
                  {errors.estimatedDuration && (
                    <p className="text-sm text-red-600 mt-1">{errors.estimatedDuration.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
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
                  {isSubmitting ? 'Creating...' : 'Create Module'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>
                Update the module details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    {...register('title')}
                    placeholder="Module title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-order">Order *</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    {...register('order', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.order && (
                    <p className="text-sm text-red-600 mt-1">{errors.order.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  {...register('description')}
                  placeholder="Module description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-estimatedDuration">Estimated Duration (minutes) *</Label>
                  <Input
                    id="edit-estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="30"
                  />
                  {errors.estimatedDuration && (
                    <p className="text-sm text-red-600 mt-1">{errors.estimatedDuration.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    {...register('isActive')}
                    className="rounded"
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingModule(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Module'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Module Dialog */}
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedModule?.title}</DialogTitle>
              <DialogDescription>
                Module details and information
              </DialogDescription>
            </DialogHeader>
            {selectedModule && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1">{selectedModule.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order</Label>
                    <p className="mt-1">{selectedModule.order}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Duration</Label>
                    <p className="mt-1">{formatDuration(selectedModule.estimatedDuration)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedModule.isActive)}`}>
                    {selectedModule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="mt-1">{new Date(selectedModule.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Modified</Label>
                  <p className="mt-1">{new Date(selectedModule.updatedAt).toLocaleString()}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditModule(selectedModule)}
                  >
                    Edit Module
                  </Button>
                  <Button
                    onClick={() => handleManageLessons(selectedModule.id)}
                  >
                    Manage Lessons
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminModuleManagement; 