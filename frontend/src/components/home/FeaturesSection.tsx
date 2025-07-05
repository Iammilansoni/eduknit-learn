import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import {
  Laptop, Book, Users, MessageSquare, Award, Clock, Globe, BookOpen
} from 'lucide-react';

const features = [
  {
    title: "1-on-1 Mentorship",
    description: "Get personal mentorship sessions to guide your learning.",
    icon: Laptop,
    color: "eduBlue"
  },
  {
    title: "Internship Support",
    description: "Get connected with internship opportunities after course completion.",
    icon: Users,
    color: "eduOrange"
  },
  {
    title: "Learning Community",
    description: "Join a like-minded group of students and grow together.",
    icon: Book,
    color: "eduBlue"
  },
  {
    title: "Community Support",
    description: "Join a vibrant network of peers, alumni, and mentors who collaborate, share insights, and motivate each other to succeed.",
    icon: MessageSquare,
    color: "eduOrange"
  },
  {
    title: "Weekly Assignment Review",
    description: "Receive personalized feedback on your practical assignments.",
    icon: Award,
    color: "eduBlue"
  },
  {
    title: "Flexible Learning Schedule",
    description: "Learn at your own pace with on-demand content, allowing you to balance education with your personal and professional commitments.",
    icon: Clock,
    color: "eduOrange"
  },
 
  {
    title: "Comprehensive Curriculum",
    description: "Master both technical skills and soft skills with our well-rounded programs designed for holistic professional development.",
    icon: BookOpen,
    color: "eduBlue"
  }
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-gray-100 dark:bg-gray-800">
      <div className="edu-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0e2445] mb-4">
            Key Features
          </h2>
          <div className="w-20 h-1 bg-[#f57920] mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700">
            Discover what makes <span className="text-[#f57920] font-semibold">EduKnit the preferred choice</span> for learners worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card
                className={`group border-t-4 h-full transition-all duration-300
                  ${feature.color === "eduBlue" ? "border-[#0e2445]" : "border-[#f57920]"}
                  hover:shadow-lg bg-white hover:bg-[#f57920]
                `}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div
                    className={`mb-4 p-3 rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300
                      ${feature.color === "eduBlue" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}
                      group-hover:bg-white group-hover:text-[#f57920]
                    `}
                  >
                    {React.createElement(feature.icon, { className: "h-7 w-7" })}
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-white transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 flex-grow group-hover:text-white transition-all duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
