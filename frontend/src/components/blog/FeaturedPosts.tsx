
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const featuredPosts = [
  {
    id: 1,
    title: 'The Future of Education in the Digital Age',
    excerpt: 'Discover how technology is transforming the educational landscape and what it means for learners.',
    category: 'Education Technology',
    author: 'Dr. Sarah Johnson',
    date: 'May 12, 2025',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    slug: 'future-of-education'
  },
  {
    id: 2,
    title: 'How AI is Revolutionizing Career Development',
    excerpt: 'Explore the ways artificial intelligence is changing how we approach career advancement and skill building.',
    category: 'Career Growth',
    author: 'Michael Chen',
    date: 'May 10, 2025',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    readTime: '7 min read',
    slug: 'ai-career-development'
  }
];

const FeaturedPosts = () => {
  return (
    <section className="bg-white py-16">
      <div className="edu-container">
        <h2 className="text-3xl font-bold mb-8 text-eduBlue-700">Featured Posts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link to={`/blog/${post.slug}`}>
                <div className="relative">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="object-cover w-full h-full" 
                    />
                  </AspectRatio>
                  <div className="absolute top-4 left-4 bg-eduOrange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </div>
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold text-eduBlue-700 mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-eduBlue-200 flex items-center justify-center text-eduBlue-700 font-bold mr-2">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <span className="text-xs text-eduBlue-600 font-semibold">{post.readTime}</span>
                  </div>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
