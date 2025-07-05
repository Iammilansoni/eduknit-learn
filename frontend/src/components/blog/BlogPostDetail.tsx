
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const BlogPostDetail = () => {
  const { slug } = useParams();
  
  // In a real app, you would fetch the post data from an API
  // based on the slug parameter
  
  return (
    <Layout>
      <div className="edu-container py-16">
        <Link to="/blog" className="inline-flex items-center text-eduBlue-600 mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to All Posts
        </Link>
        
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <div className="text-sm text-eduOrange-500 font-semibold mb-2">Category Name</div>
            <h1 className="text-4xl font-bold text-eduBlue-700 mb-4">
              {slug ? slug.split('-').join(' ').replace(/^\w/, c => c.toUpperCase()) : 'Blog Post Title'}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
              <span>May 15, 2025</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-eduBlue-100 text-eduBlue-700 font-bold rounded-full flex items-center justify-center mr-3">A</div>
              <div>
                <div className="font-medium text-gray-900">Author Name</div>
                <div className="text-sm text-gray-500">Content Writer</div>
              </div>
            </div>
            <div className="aspect-[16/9] mb-8 rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80" 
                alt="Featured" 
                className="w-full h-full object-cover"
              />
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none">
            <p className="lead">This is a placeholder for the blog post content. In a real application, this would be the actual content of the blog post fetched from a database or CMS based on the slug parameter.</p>
            
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.</p>
            
            <h2>Heading 2</h2>
            
            <p>Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.</p>
            
            <ul>
              <li>First item</li>
              <li>Second item</li>
              <li>Third item</li>
            </ul>
            
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            
            <h3>Heading 3</h3>
            
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            
            <blockquote>
              <p>This is a blockquote. It represents a quoted section of text from another source.</p>
            </blockquote>
            
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-eduBlue-700 mb-4">Share this article</h3>
            <div className="flex gap-4">
              <button className="p-2 bg-[#1877F2] text-white rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" fill="currentColor" />
                </svg>
              </button>
              <button className="p-2 bg-[#1DA1F2] text-white rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3.01006C22.0424 3.68547 20.9821 4.20085 19.86 4.54006C19.2577 3.84757 18.4573 3.35081 17.567 3.11686C16.6767 2.88291 15.7395 2.92211 14.8821 3.22987C14.0247 3.53763 13.2884 4.09795 12.773 4.82944C12.2575 5.56093 11.9877 6.4229 12 7.31006V8.31006C10.2426 8.35185 8.50127 7.93961 6.93101 7.11345C5.36074 6.28729 4.01032 5.07574 3 3.61006C3 3.61006 -1 13.6101 8 17.6101C5.94053 19.0148 3.48716 19.7308 1 19.6101C10 24.6101 21 19.6101 21 7.31006C20.9991 7.03526 20.9723 6.76109 20.92 6.49006C21.9406 5.4886 22.6608 4.30388 23 3.01006V3.01006Z" fill="currentColor" />
                </svg>
              </button>
              <button className="p-2 bg-[#0A66C2] text-white rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8V8Z" fill="currentColor" />
                  <path d="M6 9H2V21H6V9Z" fill="currentColor" />
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" fill="currentColor" />
                </svg>
              </button>
              <button className="p-2 bg-gray-100 text-gray-600 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </article>
        
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-eduBlue-700 mb-8">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Link key={item} to={`/blog/sample-post-${item}`} className="group">
                <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3">
                  <img 
                    src={`https://images.unsplash.com/photo-${1580000000000 + item * 10000}?auto=format&fit=crop&w=500&q=80`} 
                    alt={`Related post ${item}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <h4 className="font-semibold text-eduBlue-700 group-hover:text-eduOrange-500 transition-colors duration-300">
                  Related blog post title goes here
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPostDetail;
