
import React from 'react';
import Layout from '@/components/layout/Layout';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const JobSearchPage = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen py-20">
        <div className="edu-container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-eduOrange-100 text-eduOrange-600">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="heading-1 text-gray-900 dark:text-white">Job Search Program</h1>
            </div>
            <Badge className="bg-eduOrange-100 text-eduOrange-600 text-sm px-3 py-1">Coming Soon</Badge>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your step-by-step guide to land internships & jobs.
          </p>
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">What You'll Learn</h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="h-6 w-6 rounded-full bg-eduOrange-100 text-eduOrange-600 flex items-center justify-center mt-1">✓</span>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Resume & LinkedIn building</p>
                  <p className="text-gray-600 dark:text-gray-400">Create professional profiles that stand out to recruiters</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="h-6 w-6 rounded-full bg-eduOrange-100 text-eduOrange-600 flex items-center justify-center mt-1">✓</span>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Interview simulations</p>
                  <p className="text-gray-600 dark:text-gray-400">Practice and master interview techniques with real-time feedback</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="h-6 w-6 rounded-full bg-eduOrange-100 text-eduOrange-600 flex items-center justify-center mt-1">✓</span>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Freelancing guidance</p>
                  <p className="text-gray-600 dark:text-gray-400">Learn how to start and build a freelancing career while studying</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Program Launch Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're currently finalizing this program to ensure it provides maximum value. Join our waitlist to be notified when it launches.
            </p>
            <div className="inline-block">
              <Badge variant="outline" className="border-eduOrange-300 bg-eduOrange-50 text-eduOrange-700 px-4 py-2 text-sm">
                Join the waitlist
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSearchPage;
