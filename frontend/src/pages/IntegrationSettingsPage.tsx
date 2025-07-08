import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntegrationSettings from '../components/integrations/IntegrationSettings';

const IntegrationSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/student-dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Integration Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IntegrationSettings />
      </div>
    </div>
  );
};

export default IntegrationSettingsPage;
