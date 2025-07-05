
import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ModuleLesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  type: 'video' | 'quiz' | 'reading' | 'assignment';
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessons: ModuleLesson[];
  isUnlocked: boolean;
  progress: number;
}

interface CourseModuleProps {
  module: Module;
  index: number;
}

const CourseModule: React.FC<CourseModuleProps> = ({ module, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'quiz': return <Check className="w-4 h-4" />;
      case 'reading': return <Check className="w-4 h-4" />;
      case 'assignment': return <Check className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
      <div 
        className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-eduBlue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
            {index + 1}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{module.title}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{module.lessons.length} lessons</span>
              <span>•</span>
              <span>{module.isUnlocked ? `${module.progress}% complete` : 'Locked'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!module.isUnlocked && (
            <Badge variant="outline" className="border-gray-300 text-gray-500">
              Locked
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {module.lessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className={`p-4 flex items-center justify-between ${lesson.isCompleted ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`rounded-full p-2 ${lesson.isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {getLessonIcon(lesson.type)}
                </div>
                <div>
                  <p className={`font-medium ${lesson.isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {lesson.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.duration}
                  </p>
                </div>
              </div>
              <div>
                {lesson.isCompleted ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </Badge>
                ) : (
                  <Button size="sm" className="bg-eduOrange-500 hover:bg-eduOrange-600">
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseModule;
