
import React from 'react';

const BlogHero = () => {
  return (
    <section className="bg-gradient-to-r from-eduBlue-500 to-eduBlue-700 text-white">
      <div className="edu-container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            EduKnit Blog
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Insights, tips, and resources to help you succeed in your educational journey
          </p>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full p-3 pl-5 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-eduOrange-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-eduOrange-500 text-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
