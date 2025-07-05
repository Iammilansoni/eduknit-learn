
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: 'Education Technology',
    count: 24,
    slug: 'education-technology'
  },
  {
    id: 2,
    name: 'Career Development',
    count: 18,
    slug: 'career-development'
  },
  {
    id: 3,
    name: 'Programming',
    count: 16,
    slug: 'programming'
  },
  {
    id: 4,
    name: 'Soft Skills',
    count: 12,
    slug: 'soft-skills'
  },
  {
    id: 5,
    name: 'AI & Machine Learning',
    count: 10,
    slug: 'ai-machine-learning'
  },
  {
    id: 6,
    name: 'Learning Tips',
    count: 8,
    slug: 'learning-tips'
  }
];

const CategorySection = () => {
  return (
    <section className="bg-white py-16">
      <div className="edu-container">
        <h2 className="text-3xl font-bold mb-8 text-eduBlue-700">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/blog/category/${category.slug}`}
              className="bg-gray-50 hover:bg-eduBlue-50 border border-gray-200 rounded-lg p-4 text-center transition-colors duration-300"
            >
              <h3 className="font-semibold text-eduBlue-600 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} articles</p>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 bg-eduBlue-50 border border-eduBlue-100 rounded-xl p-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-eduBlue-700 mb-2">Subscribe to our newsletter</h3>
            <p className="text-gray-600 mb-4 md:mb-0">Get the latest articles and resources sent straight to your inbox</p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eduBlue-500 min-w-[250px]"
              />
              <Button className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
