
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from './card';

interface TestimonialCardProps {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  program: string;
  image?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  company,
  content,
  rating,
  program,
  image,
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4 flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < rating ? 'text-eduOrange-500 fill-eduOrange-500' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow italic">&ldquo;{content}&rdquo;</p>
        
        <div className="flex items-center mt-auto">
          <div className="flex-shrink-0 mr-3">
            {image ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={image}
                alt={name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-eduBlue-100 flex items-center justify-center">
                <span className="text-eduBlue-700 font-semibold text-sm">
                  {name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {role}{company ? `, ${company}` : ''}
            </p>
            <p className="text-xs text-eduBlue-600 dark:text-eduBlue-400 mt-1">
              {program}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
