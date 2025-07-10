import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextUtils';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin dashboard
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Redirecting to Admin Dashboard...</h2>
              <p className="text-gray-600 mt-2">Please wait while we redirect you.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPage; 