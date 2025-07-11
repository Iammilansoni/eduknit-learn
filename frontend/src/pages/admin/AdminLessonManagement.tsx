import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  Video,
  Image,
  Link,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextUtils';
import RichContentEditor from '@/components/admin/RichContentEditor';

// Lesson form schema
const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  content: z.string().optional(), // Make content optional when rich content is used
  order: z.number().min(1, 'Order must be at least 1'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute'),
  lessonType: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'INTERACTIVE']).default('TEXT'),
  isActive: z.boolean().default(true),
  hasQuiz: z.boolean().default(false),
  allowNotes: z.boolean().default(true),
  allowBookmarks: z.boolean().default(true)
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  estimatedDuration: number;
  lessonType: string;
  isActive: boolean;
  hasQuiz: boolean;
  allowNotes: boolean;
  allowBookmarks: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { username: string; email: string };
  lastModifiedBy: { username: string; email: string };
  moduleId: string;
  moduleTitle?: string;
  courseId?: string;
  courseTitle?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle?: string;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'code' | 'interactive' | 'embed';
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

const AdminLessonManagement = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [richContent, setRichContent] = useState<ContentBlock[]>([]);
  // Ensure pagination is always initialized
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    lessonType: 'all',
    status: 'all'
  });

  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      order: 1,
      estimatedDuration: 15,
      lessonType: 'TEXT',
      isActive: true,
      hasQuiz: false,
      allowNotes: true,
      allowBookmarks: true
    }
  });

  // Fetch lessons
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const paramsObj: Record<string, string> = {
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
      };
      if (filters.search) paramsObj.search = filters.search;
      if (filters.lessonType && filters.lessonType !== 'all') paramsObj.lessonType = filters.lessonType;
      if (filters.status && filters.status !== 'all') paramsObj.status = filters.status;
      if (moduleId) paramsObj.moduleId = moduleId;
      
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`/api/admin/lessons?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      const data = await response.json();
      setLessons(data.data.lessons);
      // Ensure pagination is always valid
      setPagination(data.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [pagination?.page, pagination?.limit, filters, moduleId, toast]);

  // Fetch current module details
  const fetchCurrentModule = useCallback(async () => {
    if (!moduleId) return;
    
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentModule(data.data);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  }, [moduleId]);

  // Fetch modules for navigation
  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/modules?limit=100', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
    fetchCurrentModule();
    fetchModules();
  }, [fetchLessons, fetchCurrentModule, fetchModules]);

  // Create/Update lesson
  const onSubmit = async (data: LessonFormData) => {
    try {
      // Validate that either content or rich content is provided
      if (!data.content && richContent.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please provide either text content or rich content blocks",
          variant: "destructive"
        });
        return;
      }

      const url = editingLesson 
        ? `/api/admin/lessons/${editingLesson.id}`
        : '/api/admin/lessons';
      
      const method = editingLesson ? 'PUT' : 'POST';
      
      // Prepare content payload with rich content support
      const contentPayload: {
        richContent?: ContentBlock[];
        contentFormat?: 'HTML' | 'JSON' | 'LEGACY';
        textContent?: string;
      } = {};
      
      if (richContent.length > 0) {
        // Store rich content as structured JSON
        contentPayload.richContent = richContent;
        contentPayload.contentFormat = 'JSON';
        
        // Also store in textContent for backward compatibility if it's a TEXT lesson
        if (data.lessonType === 'TEXT') {
          contentPayload.textContent = data.content || JSON.stringify(richContent);
        }
      } else if (data.content) {
        // Store as HTML/text content
        contentPayload.textContent = data.content;
        contentPayload.contentFormat = 'HTML';
      } else {
        contentPayload.contentFormat = 'LEGACY';
      }
      
      console.log('Current module data:', currentModule);
      
      const payload = {
        ...data,
        content: contentPayload,
        moduleId: moduleId,
        programmeId: currentModule?.courseId, // Add programmeId from current module
        type: data.lessonType, // Map lessonType to type
        orderIndex: data.order // Map order to orderIndex
      };
      
      console.log('Lesson creation payload:', payload);

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
        throw new Error(errorData.message || 'Failed to save lesson');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: editingLesson ? "Lesson updated successfully" : "Lesson created successfully",
      });

      setShowCreateDialog(false);
      setShowEditDialog(false);
      setEditingLesson(null);
      setRichContent([]);
      reset();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lesson",
        variant: "destructive"
      });
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });

      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive"
      });
    }
  };

  // Toggle lesson status
  const handleToggleStatus = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle lesson status');
      }

      toast({
        title: "Success",
        description: "Lesson status updated successfully",
      });

      fetchLessons();
    } catch (error) {
      console.error('Error toggling lesson status:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson status",
        variant: "destructive"
      });
    }
  };

  // Edit lesson
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setValue('title', lesson.title);
    setValue('description', lesson.description);
    setValue('content', lesson.content);
    
    // Try to parse rich content if it's JSON
    try {
      const parsedContent = JSON.parse(lesson.content);
      if (Array.isArray(parsedContent)) {
        setRichContent(parsedContent);
        setValue('content', ''); // Clear simple content field
      } else {
        setRichContent([]);
      }
    } catch {
      // Not JSON, treat as simple text
      setRichContent([]);
    }
    
    setValue('order', lesson.order);
    setValue('estimatedDuration', lesson.estimatedDuration);
    setValue('lessonType', lesson.lessonType as 'TEXT' | 'VIDEO' | 'QUIZ' | 'INTERACTIVE');
    setValue('isActive', lesson.isActive);
    setValue('hasQuiz', lesson.hasQuiz);
    setValue('allowNotes', lesson.allowNotes);
    setValue('allowBookmarks', lesson.allowBookmarks);
    setShowEditDialog(true);
  };

  // View lesson details
  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getLessonTypeColor = (lessonType: string) => {
    switch (lessonType) {
      case 'VIDEO': return 'bg-blue-100 text-blue-800';
      case 'QUIZ': return 'bg-purple-100 text-purple-800';
      case 'INTERACTIVE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonTypeIcon = (lessonType: string) => {
    switch (lessonType) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'QUIZ': return <CheckCircle className="h-4 w-4" />;
      case 'INTERACTIVE': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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
              onClick={() => navigate('/admin/modules')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Modules</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lesson Management</h1>
              <p className="text-gray-600 mt-1">
                {currentModule ? `Managing lessons for: ${currentModule.title}` : 'Manage all lessons'}
              </p>
              {currentModule?.courseTitle && (
                <p className="text-sm text-gray-500">Course: {currentModule.courseTitle}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Lesson</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search lessons..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lessonType">Lesson Type</Label>
                <Select
                  value={filters.lessonType}
                  onValueChange={(value) => setFilters({ ...filters, lessonType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="INTERACTIVE">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', lessonType: 'all', status: 'all' })}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>
              {pagination?.total || 0} lessons found
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
                      <TableHead>Type</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(lessons) ? lessons : []).map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {lesson.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLessonTypeIcon(lesson.lessonType)}
                            <Badge className={getLessonTypeColor(lesson.lessonType)}>
                              {lesson.lessonType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lesson.order}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDuration(lesson.estimatedDuration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {lesson.hasQuiz && (
                              <Badge variant="secondary" className="text-xs">Quiz</Badge>
                            )}
                            {lesson.allowNotes && (
                              <Badge variant="secondary" className="text-xs">Notes</Badge>
                            )}
                            {lesson.allowBookmarks && (
                              <Badge variant="secondary" className="text-xs">Bookmarks</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lesson.isActive)}>
                            {lesson.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(lesson.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLesson(lesson)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(lesson.id)}
                            >
                              {lesson.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
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
                {(pagination?.pages || 0) > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPagination((prev) => ({ ...prev, page: Math.max((prev?.page || 1) - 1, 1) }))}
                            className={(pagination?.page || 1) <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: (pagination?.pages || 0) }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setPagination((prev) => ({ ...prev, page }))}
                              className={(pagination?.page || 1) === page ? 'bg-primary text-primary-foreground' : 'cursor-pointer'}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPagination((prev) => ({ ...prev, page: Math.min((prev?.page || 1) + 1, prev?.pages || 1) }))}
                            className={(pagination?.page || 1) >= (pagination?.pages || 0) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

        {/* Create Lesson Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lesson</DialogTitle>
              <DialogDescription>
                Add a new lesson to the module. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Lesson title"
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
                  placeholder="Lesson description"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lessonType">Lesson Type *</Label>
                  <Select
                    value={watch('lessonType')}
                    onValueChange={(value) => setValue('lessonType', value as 'TEXT' | 'VIDEO' | 'QUIZ' | 'INTERACTIVE')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="INTERACTIVE">Interactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.lessonType && (
                    <p className="text-sm text-red-600 mt-1">{errors.lessonType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="15"
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

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasQuiz"
                    {...register('hasQuiz')}
                    className="rounded"
                  />
                  <Label htmlFor="hasQuiz">Has Quiz</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowNotes"
                    {...register('allowNotes')}
                    className="rounded"
                  />
                  <Label htmlFor="allowNotes">Allow Notes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowBookmarks"
                    {...register('allowBookmarks')}
                    className="rounded"
                  />
                  <Label htmlFor="allowBookmarks">Allow Bookmarks</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                {watch('lessonType') === 'TEXT' ? (
                  <div className="space-y-4">
                    <RichContentEditor
                      initialContent={richContent}
                      onChange={setRichContent}
                      lessonType={watch('lessonType')}
                    />
                    <div>
                      <Label className="text-sm text-gray-600">Or use simple text content:</Label>
                      <Textarea
                        id="content"
                        {...register('content')}
                        placeholder="Simple lesson content (optional if using rich content above)"
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    {...register('content')}
                    placeholder="Lesson content"
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
                {errors.content && richContent.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setRichContent([]);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Lesson'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Lesson Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
              <DialogDescription>
                Update the lesson details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    {...register('title')}
                    placeholder="Lesson title"
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
                  placeholder="Lesson description"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-lessonType">Lesson Type *</Label>
                  <Select
                    value={watch('lessonType')}
                    onValueChange={(value) => setValue('lessonType', value as 'TEXT' | 'VIDEO' | 'QUIZ' | 'INTERACTIVE')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="INTERACTIVE">Interactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.lessonType && (
                    <p className="text-sm text-red-600 mt-1">{errors.lessonType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-estimatedDuration">Duration (minutes) *</Label>
                  <Input
                    id="edit-estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="15"
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

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-hasQuiz"
                    {...register('hasQuiz')}
                    className="rounded"
                  />
                  <Label htmlFor="edit-hasQuiz">Has Quiz</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-allowNotes"
                    {...register('allowNotes')}
                    className="rounded"
                  />
                  <Label htmlFor="edit-allowNotes">Allow Notes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-allowBookmarks"
                    {...register('allowBookmarks')}
                    className="rounded"
                  />
                  <Label htmlFor="edit-allowBookmarks">Allow Bookmarks</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-content">Content *</Label>
                {watch('lessonType') === 'TEXT' ? (
                  <div className="space-y-4">
                    <RichContentEditor
                      initialContent={richContent}
                      onChange={setRichContent}
                      lessonType={watch('lessonType')}
                    />
                    <div>
                      <Label className="text-sm text-gray-600">Or use simple text content:</Label>
                      <Textarea
                        id="edit-content"
                        {...register('content')}
                        placeholder="Simple lesson content (optional if using rich content above)"
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id="edit-content"
                    {...register('content')}
                    placeholder="Lesson content"
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
                {errors.content && richContent.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingLesson(null);
                    setRichContent([]);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Lesson'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Lesson Dialog */}
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLesson?.title}</DialogTitle>
              <DialogDescription>
                Lesson details and content
              </DialogDescription>
            </DialogHeader>
            {selectedLesson && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1">{selectedLesson.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getLessonTypeIcon(selectedLesson.lessonType)}
                      <Badge className={getLessonTypeColor(selectedLesson.lessonType)}>
                        {selectedLesson.lessonType}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order</Label>
                    <p className="mt-1">{selectedLesson.order}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Duration</Label>
                    <p className="mt-1">{formatDuration(selectedLesson.estimatedDuration)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedLesson.isActive)}`}>
                      {selectedLesson.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Features</Label>
                  <div className="flex space-x-2 mt-1">
                    {selectedLesson.hasQuiz && (
                      <Badge variant="secondary">Quiz</Badge>
                    )}
                    {selectedLesson.allowNotes && (
                      <Badge variant="secondary">Notes</Badge>
                    )}
                    {selectedLesson.allowBookmarks && (
                      <Badge variant="secondary">Bookmarks</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Content</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{selectedLesson.content}</pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="mt-1">{new Date(selectedLesson.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Last Modified</Label>
                    <p className="mt-1">{new Date(selectedLesson.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditLesson(selectedLesson)}
                  >
                    Edit Lesson
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

export default AdminLessonManagement; 