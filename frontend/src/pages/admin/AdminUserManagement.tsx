import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextUtils';
import { userApi as userAPI } from '@/services/userApi';
import type { User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Activity,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Array<{ _id: string; count: number }>;
  recentRegistrations: number;
}

const AdminUserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'admin' | 'user' | 'student' | 'visitor',
    enrollmentStatus: 'active' as 'active' | 'inactive' | 'suspended'
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      const response = await userAPI.updateEnrollmentStatus(userId, status);
      if (response.success) {
        const actionMap = {
          active: 'activated',
          inactive: 'deactivated',
          suspended: 'suspended'
        };
        toast({
          title: "Success",
          description: `User ${actionMap[status]} successfully`,
        });
        fetchUsers();
        fetchStats();
      }
    } catch (error: unknown) {
      console.error('Status change error:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const getUserId = (user: User): string => {
    return user.id || (user as User & { _id?: string })._id || '';
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId || userId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await userAPI.deleteUser(userId);
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
        fetchStats();
      }
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async () => {
    try {
      if (!newUserData.username || !newUserData.email || !newUserData.password) {
        toast({
          title: "Error",
          description: "Username, email, and password are required",
          variant: "destructive"
        });
        return;
      }

      const response = await userAPI.createUser(newUserData);
      if (response.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setShowAddUserForm(false);
        setNewUserData({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'student',
          enrollmentStatus: 'active'
        });
        fetchUsers();
        fetchStats();
      }
    } catch (error: unknown) {
      console.error('Create user error:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      enrollmentStatus: user.enrollmentStatus
    });
    setShowEditUserForm(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updateData = { ...newUserData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await userAPI.updateUser(getUserId(editingUser), updateData);
      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setShowEditUserForm(false);
        setEditingUser(null);
        setNewUserData({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'student',
          enrollmentStatus: 'active'
        });
        fetchUsers();
        fetchStats();
      }
    } catch (error: unknown) {
      console.error('Update user error:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      visitor: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
            </div>
          </div>
          <Dialog open={showAddUserForm} onOpenChange={setShowAddUserForm}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specific role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUserData.username}
                      onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUserData.firstName}
                      onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUserData.lastName}
                      onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserData.role} onValueChange={(value: 'admin' | 'user' | 'student' | 'visitor') => setNewUserData({...newUserData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newUserData.enrollmentStatus} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setNewUserData({...newUserData, enrollmentStatus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUserForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={getUserId(user)}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback>
                              {user.firstName?.[0]}{user.lastName?.[0] || user.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.username
                              }
                            </p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.enrollmentStatus)}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(getUserId(user), 'active')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(getUserId(user), 'inactive')}>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(getUserId(user), 'suspended')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(getUserId(user))}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditUserForm} onOpenChange={setShowEditUserForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={newUserData.role} onValueChange={(value: 'admin' | 'user' | 'student' | 'visitor') => setNewUserData({...newUserData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={newUserData.enrollmentStatus} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setNewUserData({...newUserData, enrollmentStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUserForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminUserManagement; 