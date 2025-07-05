
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="section-padding bg-eduBlue-600 dark:bg-eduBlue-800 text-white">
      <div className="edu-container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Start Your Learning Journey?</h2>
            <p className="text-lg text-white/90 mb-6">
              Join thousands of students already learning with EduKnit. Our courses are designed to help you achieve your goals and advance your career.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-eduOrange-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Flexible learning schedule</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-eduOrange-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Expert instructors with industry experience</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-eduOrange-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Hands-on projects for practical learning</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white" asChild>
                <Link to="/programs" className="flex items-center">
                  Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full lg:w-auto lg:min-w-[350px] shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request Information</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eduBlue-500 focus:border-eduBlue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eduBlue-500 focus:border-eduBlue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program of Interest</label>
                <select
                  id="program"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eduBlue-500 focus:border-eduBlue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a program</option>
                  <option value="tech">Technology Courses</option>
                  <option value="business">Business & Marketing</option>
                  <option value="comm">Communication Skills</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-eduBlue-500 hover:bg-eduBlue-600 text-white">
                Get More Information
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
