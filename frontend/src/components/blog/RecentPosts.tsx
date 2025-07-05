
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const recentPosts = [
  {
    id: 1,
    title: 'Top 10 Skills Employers Are Looking For in 2025',
    category: 'Career Development',
    author: 'Emma Rodriguez',
    date: 'May 8, 2025',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    readTime: '4 min read',
    slug: 'top-skills-employers-2025'
  },
  {
    id: 2,
    title: 'How to Effectively Learn a New Programming Language',
    category: 'Programming',
    author: 'Alex Thompson',
    date: 'May 6, 2025',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    readTime: '6 min read',
    slug: 'learn-programming-language'
  },
  {
    id: 3,
    title: 'The Importance of Soft Skills in Technical Roles',
    category: 'Soft Skills',
    author: 'Jamie Lee',
    date: 'May 4, 2025',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    readTime: '5 min read',
    slug: 'soft-skills-technical-roles'
  },
  {
    id: 4,
    title: 'Building a Learning Routine That Actually Works',
    category: 'Learning Tips',
    author: 'Dr. Marcus Webb',
    date: 'May 2, 2025',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    readTime: '8 min read',
    slug: 'effective-learning-routine'
  },
  {
    id: 5,
    title: 'The Role of AI in Modern Education Systems',
    category: 'AI in Education',
    author: 'Dr. Sarah Johnson',
    date: 'April 30, 2025',
    image: 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=600&q=80',
    readTime: '7 min read',
    slug: 'ai-modern-education'
  },
  {
    id: 6,
    title: 'How to Prepare for a Technical Interview',
    category: 'Interview Prep',
    author: 'Michael Chen',
    date: 'April 28, 2025',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    readTime: '6 min read',
    slug: 'technical-interview-prep'
  }
];

const RecentPosts = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="edu-container">
        <h2 className="text-3xl font-bold mb-8 text-eduBlue-700">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <Link to={`/blog/${post.slug}`}>
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                </div>
                <CardContent className="pt-5">
                  <div className="text-xs font-semibold text-eduOrange-500 mb-2">{post.category}</div>
                  <h3 className="font-bold text-lg mb-2 text-eduBlue-700 line-clamp-2">{post.title}</h3>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center text-sm text-gray-500">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            to="/blog/archive" 
            className="inline-flex items-center px-6 py-3 bg-eduBlue-600 text-white rounded-md hover:bg-eduBlue-700 transition-colors"
          >
            View All Posts
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentPosts;
