import React from 'react';
import { MessageSquare, Users, ExternalLink } from 'lucide-react';
import { integrationApi } from '../../services/integrationApi';

interface DiscordWidgetProps {
  className?: string;
}

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ className = '' }) => {
  const staticInviteLink = integrationApi.getDiscordInviteLink();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Discord Community</h3>
            <p className="text-sm text-gray-600">Connect with fellow learners</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>Join our learning community</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>• Get help with coursework</p>
          <p>• Share achievements</p>
          <p>• Connect with mentors</p>
          <p>• Participate in study groups</p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <a
            href={staticInviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Join Discord Server</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Free to join • 24/7 community support
        </p>
      </div>
    </div>
  );
};

export default DiscordWidget;
