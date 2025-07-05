
import React from 'react';
import SectionHeader from '../ui/SectionHeader';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Code, Database, Palette, ChartBar, Globe, Lightbulb, MessageSquare, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const programs = [
  {
    title: "Communication Skills",
    description: "Speak smart. Think sharp. Lead with confidence.",
    level: "Beginner to Advanced",
    duration: "12 weeks",
    icon: Code,
    color: "eduBlue",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAKS9LMzYTJSJuOlbdzDMtaG9mh6j8VDwcTA&s",
    path: "/programs/communication-skills"
  },
 
  {
    title: "Basics of AI",
    description: "AI is not just the future — it's your future.",
    level: "Beginner",
    duration: "8 weeks",
    icon: Palette,
    color: "eduBlue",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAKS9LMzYTJSJuOlbdzDMtaG9mh6j8VDwcTA&s",
    path: "/programs/basics-of-ai"
  },
  
  {
    title: "Data Analytics",
    description: "Make decisions like a CEO — with data.",
    level: "All Levels",
    duration: "8 weeks",
    icon: Globe,
    color: "eduBlue",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAKS9LMzYTJSJuOlbdzDMtaG9mh6j8VDwcTA&s",
    path: "/programs/data-analytics"
  },
  
  {
    title: "Decision-Making Skills",
    description: "Learn how top leaders think.",
    level: "All Levels",
    duration: "6 weeks",
    icon: MessageSquare,
    color: "eduBlue",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAKS9LMzYTJSJuOlbdzDMtaG9mh6j8VDwcTA&s",
    path: "/programs/decision-making"
  }
 
];

const PopularCoursesSection = () => {
  return (
    <section className="section-padding bg-blue-200 dark:bg-gray-900">
      <div className="edu-container">
        <div className="edu-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="text-center">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0e2445] mb-4">
     Explore Our Programs
    </h2>
    <div className="w-20 h-1 bg-[#f57920] mx-auto rounded-full mb-6"></div>
    <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-700">
      Discover courses <span className="text-[#f57920] font-semibold">designed to help you achieve</span> your career goals.
    </p>
  </div>
</div>
        


   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4"> 
  {programs.map((program, index) => (
    <div
  key={index}
  style={{
    borderTopLeftRadius: 0,
    borderTopRightRadius: '60px',
    borderBottomLeftRadius: '60px',
    borderBottomRightRadius: 0,
  }}
  className={`
    group overflow-hidden border-2 transition-all duration-300 flex flex-col justify-between h-full
    ${program.color === "eduBlue" ? "border-[#0e2445]" : "border-[#f57920]"}
    hover:border-[#0e2445] hover:bg-[#f57920]
  `}
>
  {/* Top part with image and content */}
  <div className="relative h-48 overflow-hidden rounded-t-xl">
    {/* Image */}
    <img
  src={program.image}
  alt={program.title}
  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
/>

    {/* Title + Description content on hover */}
    <div className="absolute inset-0 bg-white bg-opacity-90 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[#0e2445] rounded-t-xl">
      <h3 className="text-xl font-bold mb-2">{program.title}</h3>
      <p className="text-sm">{program.description}</p>
    </div>
  </div>

  {/* Bottom part with level, duration, button */}
  <div className="bg-[#2d2740] p-6 text-white space-y-3 rounded-b-xl group-hover:bg-[#f57920] transition-colors duration-300">
    <div className="flex justify-between text-sm">
      <p className="text-[#fca76d] font-medium">Level: {program.level}</p>
      <p>Duration: {program.duration}</p>
    </div>

    <button className="w-full bg-[#0e2445] text-white group-hover:bg-white group-hover:text-[#f57920] font-semibold py-2 px-4 rounded-md transition-colors duration-300">
    <Link to={program.path || "#"}>
      Learn More
      </Link>
    </button>
  </div>
</div>


  ))}
</div>


        
       <div className="mt-12 text-center">
  <Button
    className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white px-8 py-6 text-lg"
    asChild
  >
    <Link to="/programs">
      Find the right program for you
    </Link>
  </Button>
</div>
      </div>
    </section>
  );
};

export default PopularCoursesSection;
