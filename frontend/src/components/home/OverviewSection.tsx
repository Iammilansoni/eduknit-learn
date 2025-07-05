
import React from 'react';
import SectionHeader from '../ui/SectionHeader';
import { Layers, Target, BarChart3, Trophy } from 'lucide-react';
import { Button } from '../ui/button';

const OverviewSection = () => {
  return (
    <section className="section-padding bg-gray-100 dark:bg-gray-900 py-16">
      <div className="edu-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="edu-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div className="text-center">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0e2445] relative inline-block mb-2">
      Overview of EduKnit
      <span className="block w-20 h-1 bg-[#f57920] mx-auto mt-2 rounded-full"></span>
    </h2>
    <p className="mt-2 max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
      Empowering students through <span className="text-[#f57920] font-semibold">accessible, quality education</span> for career advancement.
    </p>
  </div>
</div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-eduBlue-50 to-eduBlue-100 dark:from-eduBlue-900 dark:to-gray-800 p-6 rounded-xl border border-eduBlue-200 dark:border-eduBlue-800">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Educational Philosophy</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                EduKnit is built on the belief that quality education should be accessible to everyone. 
                Our platform is designed to connect passionate educators with eager learners, creating 
                a vibrant community where knowledge flows freely and skills are developed 
                through practical application and expert guidance.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-eduBlue-100 dark:bg-eduBlue-900 rounded-lg shadow-sm">
                  <Target className="h-7 w-7 text-eduBlue-600 dark:text-eduBlue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-400">To democratize education and make quality learning accessible to everyone regardless of their background, location, or financial constraints.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-eduOrange-100 dark:bg-eduOrange-900 rounded-lg shadow-sm">
                  <Layers className="h-7 w-7 text-eduOrange-600 dark:text-eduOrange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">Learning Approach</h3>
                  <p className="text-gray-600 dark:text-gray-400">Our curriculum combines theoretical knowledge with hands-on projects, ensuring you gain practical skills that are highly valued in today's competitive job market.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-eduBlue-100 dark:bg-eduBlue-900 rounded-lg shadow-sm">
                  <BarChart3 className="h-7 w-7 text-eduBlue-600 dark:text-eduBlue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">Career Growth</h3>
                  <p className="text-gray-600 dark:text-gray-400">Our programs are designed to help you advance your career with industry-relevant skills, recognized certifications, and networking opportunities with industry leaders.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white font-medium">
                Learn More About Our Methodology
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-eduOrange-500" />
              What Sets Us Apart
            </h3>
            
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-eduBlue-500 flex items-center justify-center text-white font-medium">1</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Expert-Led Instruction</h4>
                  <p className="text-gray-600 dark:text-gray-400">Learn directly from industry professionals who bring real-world experience to every lesson, providing insights that go beyond textbook knowledge.</p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-eduBlue-500 flex items-center justify-center text-white font-medium">2</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Flexible Learning</h4>
                  <p className="text-gray-600 dark:text-gray-400">Study at your own pace with 24/7 access to course materials, recorded lectures, and dedicated support from instructors and teaching assistants.</p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-eduBlue-500 flex items-center justify-center text-white font-medium">3</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Community Support</h4>
                  <p className="text-gray-600 dark:text-gray-400">Join a vibrant community of learners, mentors, and industry professionals who collaborate, share knowledge, and provide mutual support throughout your learning journey.</p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-eduBlue-500 flex items-center justify-center text-white font-medium">4</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Industry Recognition</h4>
                  <p className="text-gray-600 dark:text-gray-400">Earn certificates that are recognized and valued by top employers worldwide, giving you a competitive edge in your job search and career advancement.</p>
                </div>
              </li>
              
              <li className="flex gap-3 mt-6">
                <div className="flex-none w-6 h-6 rounded-full bg-eduOrange-500 flex items-center justify-center text-white font-medium">5</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Continuous Innovation</h4>
                  <p className="text-gray-600 dark:text-gray-400">Our curriculum is regularly updated to reflect the latest industry trends, ensuring you're always learning the most relevant and in-demand skills.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 p-4 bg-eduBlue-50 dark:bg-gray-700 rounded-lg border border-eduBlue-100 dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Our Impact</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-eduBlue-600 dark:text-eduBlue-400">25,000+</p>
                  <p className="text-gray-600 dark:text-gray-400">Students Enrolled</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-eduBlue-600 dark:text-eduBlue-400">92%</p>
                  <p className="text-gray-600 dark:text-gray-400">Career Advancement Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
