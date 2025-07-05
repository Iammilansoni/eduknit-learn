import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Brain, Megaphone, Bot, Database, FlaskConical, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const programs = [
  {
    title: "Communication Skills",
    description: "Speak smart. Think sharp. Lead with confidence.",
    features: ["Personality development", "Interview & GD training", "Presentation & corporate etiquette"],
    icon: Users,
    gradient: "from-eduBlue-100 to-eduBlue-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/communication-skills"
  },
  {
    title: "Digital Marketing",
    description: "Learn how businesses grow in the real world — and how you can, too.",
    features: ["Social media strategy", "Performance marketing", "Branding & campaign planning"],
    icon: Megaphone,
    gradient: "from-eduOrange-100 to-eduOrange-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/digital-marketing"
  },
  {
    title: "Basics of AI",
    description: "AI is not just the future — it's your future.",
    features: ["Machine learning concepts", "AI in real life", "Ethical and practical AI use"],
    icon: Brain,
    gradient: "from-eduBlue-100 to-eduBlue-50",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
    path: "/programs/basics-of-ai"

  },
  {
    title: "AI Prompt Crafting",
    description: "Don't just use ChatGPT — command it like a pro.",
    features: ["Prompt engineering", "AI + human collaboration", "Hands-on mini-projects"],
    icon: Bot,
    gradient: "from-eduOrange-100 to-eduOrange-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/ai-prompt-crafting"
  },
  {
    title: "Data Analytics",
    description: "Make decisions like a CEO — with data.",
    features: ["Excel, Sheets & visualization tools", "Industry use-cases", "Intro to Python for analysis"],
    icon: Database,
    gradient: "from-eduBlue-100 to-eduBlue-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/data-analytics"
  },
  {
    title: "BioSkills",
    description: "Get beyond textbooks. Build industry-relevant biology skills.",
    features: ["Applied biology thinking", "Case-based learning", "Career paths in biosciences"],
    icon: FlaskConical,
    gradient: "from-eduOrange-100 to-eduOrange-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/bioskills"
  },
  {
    title: "Decision-Making Skills",
    description: "Learn how top leaders think.",
    features: ["Critical thinking", "Problem solving", "Real-life decision simulations"],
    icon: Lightbulb,
    gradient: "from-eduBlue-100 to-eduBlue-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/decision-making"
  },

 
    {
    title: "Mathemtics",
    description: "Your step-by-step guide to solve your queries.",
    features: ["Critical thinking", "Problem solving", "Real-life decision simulations"],
    icon: Lightbulb,
     gradient: "from-eduOrange-100 to-eduOrange-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    path: "/programs/mathematics"
  },
   {
    title: "Job Search Program",
    description: "Your step-by-step guide to land internships & jobs.",
    features: ["Resume & LinkedIn building", "Interview simulations", "Freelancing guidance"],
    icon: GraduationCap,
     gradient: "from-eduBlue-100 to-eduBlue-50",
     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwd-Jrsg6-Cf9DJyycq2CcMy9vEWQpebhu8mz8TEXINQ4FFhql486cJdDxQfEqUZvaAoA&usqp=CAU", // Add this line
   
    comingSoon: true
  }
];

const ProgramsPage = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16">
          {/* Background element with #0e2545 color */}
          <div 
            className="absolute inset-0 bg-[#0e2545] z-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
              height: 'calc(100% - 100px)'
            }}
          />
          
          <div className="edu-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-1 mb-6 text-white">
                Our Skill-Building Programs
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                At EduKnit, we believe students shouldn't have to choose between academic preparation and
                career development.
              </p>
              
              {/* Orange highlighted section */}
              <div className="bg-[#f57920] p-5 rounded-lg">
                <p className="text-lg text-white font-medium">
                  Every program is flexible, beginner-friendly, and career-focused — built to give you a head-start
                  while others are still waiting for results.
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* Programs Grid */}
      <section className="py-16 bg-blue-200 dark:bg-gray-800/50">
  <div className="edu-container">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {programs.map((program, index) => (
        <Card
          key={index}
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: "60px",
            borderBottomLeftRadius: "60px",
            borderBottomRightRadius: 0,
          }}
          className={cn(
            "group transition-all duration-300 overflow-hidden border-2 shadow-md transform hover:scale-105",
            program.comingSoon && "opacity-75",
            program.gradient.includes("eduBlue")
              ? "border-[#0e2445]"
              : "border-[#f57920]",
            "hover:bg-[#f57920]"
          )}
        >
          {/* Top Gradient Strip */}
          <div className={cn("h-2 w-full bg-gradient-to-r", program.gradient)} />

          {/* Image */}
          {program.image && (
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-48 object-cover"
            />
          )}

          {/* Card Header */}
          <CardHeader className="space-y-1 pb-4 transition-colors duration-300 group-hover:text-white">
            <div className="flex items-center space-x-4">
              <div
                className={cn(
                  "p-2 rounded-lg transition-all",
                  program.gradient.includes("eduBlue")
                    ? "bg-eduBlue-100 text-eduBlue-600"
                    : "bg-eduOrange-100 text-eduOrange-600",
                  "group-hover:bg-white group-hover:text-[#f57920]"
                )}
              >
                <program.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2 group-hover:text-white">
                  {program.title}
                  {program.comingSoon && (
                    <span className="text-sm font-normal px-2 py-1 bg-eduOrange-100 text-eduOrange-600 rounded">
                      Coming Soon
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="space-y-4 transition-colors duration-300 group-hover:text-white">
            <p className="text-gray-600 dark:text-gray-300 group-hover:text-white">
              {program.description}
            </p>
            <ul className="space-y-2">
              {program.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center text-gray-600 dark:text-gray-300 group-hover:text-white"
                >
                  <span
                    className={cn(
                      "mr-2 h-1.5 w-1.5 rounded-full",
                      program.gradient.includes("eduBlue")
                        ? "bg-eduBlue-500"
                        : "bg-eduOrange-500"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Button */}
            <Button
              className={cn(
                "w-full mt-4 transition-colors duration-300 font-semibold",
                "bg-[#0e2445] text-white group-hover:bg-white group-hover:text-[#f57920]"
              )}
              disabled={program.comingSoon}
              asChild
            >
              <Link to={program.path || "#"}>
                {program.comingSoon ? "Coming Soon" : "Learn More"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>





      {/* Why Choose EduKnit Section */}
<section className="py-20 bg-gray-100 dark:bg-gray-900">
  <div className="edu-container">
    <div className="max-w-5xl mx-auto text-center">
      <h2 className="heading-2 mb-10 text-gray-900 dark:text-white">
        Why Choose <span className="text-eduOrange-500">EduKnit</span>?
      </h2>

      {/* Boxed Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {[
          "Designed for Class 11, 12 & early college students",
          "100% practical, mentor-led learning",
          "Skills that align with today's job market",
          "Learn at your own pace, with full support"
        ].map((point, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-eduBlue-500 bg-white dark:bg-gray-800 shadow-sm p-6 text-left transition-all hover:border-eduOrange-500 hover:shadow-md group"
          >
            <div className="flex items-start space-x-4">
              <span className="mt-1.5 h-3 w-3 rounded-full bg-eduBlue-500 group-hover:bg-eduOrange-500 transition-colors" />
              <p className="text-gray-700 dark:text-gray-300 group-hover:text-eduOrange-600 transition-colors font-medium">
                {point}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call-to-Action */}
      <div className="space-y-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Choose Your Program. Shape Your Future.
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No more waiting till after college.<br />
          With <span className="text-eduOrange-500 font-semibold">EduKnit</span>, your career starts right now.
        </p>
        <Button className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white px-8 py-4 text-lg rounded-full shadow-md transition-all duration-300 hover:scale-105">
          Get Started Today
        </Button>
      </div>
    </div>
  </div>
</section>


      </div>
    </Layout>
  );
};

export default ProgramsPage;
