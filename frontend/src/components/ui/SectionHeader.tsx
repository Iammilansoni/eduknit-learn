
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  titleClassName?: string;
  subtitleClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  alignment = 'center',
  titleClassName,
  subtitleClassName,
}) => {
  return (
    <div className={cn(
      'mb-8 md:mb-12',
      alignment === 'center' && 'text-center',
      alignment === 'right' && 'text-right',
    )}>
      <h2 className={cn(
        'heading-2 mb-4 relative inline-block',
        alignment === 'center' && 'after:left-1/2 after:-translate-x-1/2',
        'after:content-[""] after:absolute after:h-1 after:w-16 after:bg-eduOrange-500 after:-bottom-2 after:left-0',
        titleClassName
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-lg text-gray-600 dark:text-gray-300 max-w-3xl', 
          alignment === 'center' && 'mx-auto',
          alignment === 'right' && 'ml-auto',
          subtitleClassName
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
