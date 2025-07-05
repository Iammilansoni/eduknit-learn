import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, PieChart, Mic, TrendingUp } from 'lucide-react';

const careerOpportunities = [
  {
    title: "Software Developer",
    description: "Build and maintain scalable web applications using modern tech stacks.",
    icon: <Code className="h-10 w-10 text-eduOrange-500" />,
  },
  {
    title: "Data Analyst",
    description: "Turn raw data into actionable insights and compelling dashboards.",
    icon: <PieChart className="h-10 w-10 text-eduOrange-500" />,
  },
  {
    title: "Digital Marketer",
    description: "Plan, execute, and optimize digital campaigns across multiple platforms.",
    icon: <TrendingUp className="h-10 w-10 text-eduOrange-500" />,
  },
  {
    title: "Public Speaker",
    description: "Master stage presence and confidently deliver impactful messages.",
    icon: <Mic className="h-10 w-10 text-eduOrange-500" />,
  },
  {
    title: "Project Manager",
    description: "Lead cross-functional teams and deliver projects on time and within scope.",
    icon: <Briefcase className="h-10 w-10 text-eduOrange-500" />,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="edu-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0e2445] mb-4">
            Career Opportunities
          </h2>
          <div className="w-20 h-1 bg-[#f57920] mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700">
            Discover the exciting career paths our programs can help you achieve.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerOpportunities.map((career, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{career.icon}</div>
              <h3 className="text-xl font-semibold text-[#0e2445] dark:text-white group-hover:text-eduOrange-500 mb-2">
                {career.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {career.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;