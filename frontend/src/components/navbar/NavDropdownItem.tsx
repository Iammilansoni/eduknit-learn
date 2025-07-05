
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavDropdownItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  onClick?: () => void;
}

const NavDropdownItem = ({ icon: Icon, title, description, path, onClick }: NavDropdownItemProps) => {
  return (
    <Link 
      to={path}
      className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">
        <Icon className="h-5 w-5 text-eduBlue-500" />
      </div>
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-100">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
};

export default NavDropdownItem;
