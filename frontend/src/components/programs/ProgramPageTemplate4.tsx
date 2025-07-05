
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, BookOpen, Play, FileText } from 'lucide-react';
import { CalendarDays, Clock } from 'lucide-react';
import { motion } from "framer-motion";

interface ProgramModule {
  id: string;
  title: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'reading' | 'quiz';
  }[];
}

interface CareerPath {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export interface ProgramPageProps {
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  title: string;
  tagline: string;
  videoSrc: string;
  overview: string[];
  careerOutlook: {
    description: string[];
    paths: CareerPath[];
  };
  curriculum: {
    description: string;
    modules: ProgramModule[];
  };
  support: {
    description: string[];
    features: {
      title: string;
      description: string;
    }[];
  };
  faqs: FAQ[];
   carouselImages?: string[]; // optional
  heroImage?: string; 
}

const ProgramPageTemplate: React.FC<ProgramPageProps> = ({
  icon,
  iconBgClass,
  iconTextClass,
  title,
  tagline,
  videoSrc,
  overview,
  careerOutlook,
  curriculum,
  support,
  faqs
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        {/* Hero Section with Video */}
        <section className="bg-[#142959] pt-20 pb-20">
  <div className="edu-container">
    <div className="flex flex-col lg:flex-row gap-12 items-center">
      
      {/* Left: Styled White Card */}
      <div className="w-full lg:w-1/2">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <p className="uppercase text-sm font-semibold text-gray-500 mb-2">Certificate Program</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Analytics</h1>
          <p className="text-lg text-gray-700 mb-6">
            Transform your ideas into powerful messages that move people.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>1-2 months</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>3-5 hours/week</span>
            </div>
          </div>

<div className="flex gap-x-4">
  <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-full">
    Enroll Now
  </Button>
  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-full">
    Download Syllabus
  </Button>
</div>
        </div>
      </div>

      {/* Right: Video Box */}
      <div className="w-full lg:w-1/2">
        <div className="rounded-xl overflow-hidden shadow-xl">
          <AspectRatio ratio={16 / 9}>
            <video
              src={videoSrc}
              controls
              poster="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80"
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        </div>
      </div>
    </div>
  </div>
</section>


        {/* Program Content Tabs */}
        <section className="py-8">
          <div className="edu-container">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-gray-300 border-gray-200 dark:border-gray-700">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0 mb-[-1px]">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-eduBlue-600 data-[state=active]:text-eduBlue-600 bg-transparent"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="career" 
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-eduBlue-600 data-[state=active]:text-eduBlue-600 bg-transparent"
                  >
                    Career Outlook
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum" 
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-eduBlue-600 data-[state=active]:text-eduBlue-600 bg-transparent"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger 
                    value="support" 
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-eduBlue-600 data-[state=active]:text-eduBlue-600 bg-transparent"
                  >
                    Support
                  </TabsTrigger>
                  <TabsTrigger 
                    value="faq" 
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-eduBlue-600 data-[state=active]:text-eduBlue-600 bg-transparent"
                  >
                    FAQ
                  </TabsTrigger>
                </TabsList>
              </div>



              {/* Overview Tab */}
              <TabsContent value="overview" className="py-8">
                <h2 className="text-2xl font-bold mb-6 bg-orange-200 text-gray-800 dark:text-gray-200">
    Program Overview
  </h2>

  {/* Responsive wrapper: flex on large screens, stacked on mobile */}
  <div className="flex flex-col lg:flex-row gap-8 items-start bg-blue-100">
    
    {/* Left: Text Content */}
    <div className="flex-1 space-y-4 max-w-3xl mb-8">
      {overview.map((paragraph, index) => (
        <p key={index} className="text-gray-600 dark:text-gray-300">
          {paragraph}
        </p>
      ))}
    </div>

    {/* Right: Image */}
    <div className="flex-1 mb-8 lg:mb-0">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpLcTGYPhHLePD-ErExHPMaMzdX8DQWqklIg&s" // Replace with your actual image path or URL
        alt="Program Overview Illustration"
        className="w-full h-auto rounded-xl shadow-lg object-cover"
      />
    </div>
  </div>

                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">What You'll Learn</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {curriculum.modules.slice(0, 3).map((module) => (
    <Card
      key={module.id}
      className="border border-transparent hover:border-orange-500 hover:shadow-lg hover:scale-[1.02] transition duration-300 ease-in-out rounded-xl"
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className={`h-6 w-6 mt-1 ${iconTextClass} flex-shrink-0`} />
          <div>
            <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{module.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>


                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setActiveTab("curriculum")}
                    className="bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                  >
                    Explore Full Curriculum <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Career Outlook Tab */}
              <TabsContent value="career" className="py-8">
                <h2 className="text-2xl font-bold mb-6 bg-orange-200 text-gray-800 dark:text-gray-200">Career Opportunities</h2>
                
                <div className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto mb-8 gap-8">
  {/* Text content on left */}
  <div className="space-y-4 max-w-3xl flex-1">
    {careerOutlook.description.map((paragraph, index) => (
      <p key={index} className="bg-blue-100 text-gray-600 dark:text-gray-300">
        {paragraph}
      </p>
    ))}
  </div>

  {/* Image on right */}
  <div className="flex-1 max-w-md lg:max-w-full">
    <img
      src="https://fsa2-assets.imgix.net/assets/Hero-Images/man-working-at-desktop-with-plants-in-the-background_gradient-added.jpg?auto=compress%2Cformat&crop=focalpoint&domain=fsa2-assets.imgix.net&fit=crop&fp-x=0.5&fp-y=0.5&h=900&ixlib=php-3.3.0&w=1200"  // Replace with your image URL or import
      alt="Career Outlook Illustration"
      className="w-full h-auto rounded-lg shadow-lg object-cover"
    />
  </div>
</div>


                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Career Paths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {careerOutlook.paths.map((path, index) => (
    <motion.div
      key={index}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="border border-transparent hover:border-orange-500 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <h4 className="font-semibold text-lg mb-2">{path.title}</h4>
          <p className="text-gray-600 dark:text-gray-400">{path.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  ))}
</div>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="py-8">
  <h2 className="text-2xl font-bold mb-6 bg-orange-200 text-gray-800 dark:text-gray-200">Program Curriculum</h2>
  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
    {curriculum.description}
  </p>

  <div className="space-y-6 mb-8">
    {curriculum.modules.map((module) => (
      <Accordion key={module.id} type="single" collapsible className="border rounded-lg overflow-hidden">
        <AccordionItem value={module.id} className="border-0">
          <AccordionTrigger className="px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">{module.title}</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <p className="mb-4 text-gray-600 dark:text-gray-300">{module.description}</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="text-base">
                  {lesson.title}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ))}
  </div>
</TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="py-8">
                <h2 className="text-2xl font-bold mb-6 bg-orange-200 text-gray-800 dark:text-gray-200">Student Support</h2>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
  {/* Text Section */}
  <div className="space-y-4 max-w-3xl lg:w-1/2">
    {support.description.map((paragraph, index) => (
      <p key={index} className="bg-blue-100 text-gray-600 dark:text-gray-300">
        {paragraph}
      </p>
    ))}
  </div>

  {/* Image Section */}
  <div className="lg:w-1/2 w-full flex justify-center">
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Tci3Pg0vG9f_Lay_02JMROvnaVq9B0KQxzCraL7biU1I0s7zN2QWA5PqkmvcvTNYlA4&usqp=CAU" // Replace with your actual image path
      alt="Support Illustration"
      className="w-full h-auto max-w-md rounded-lg shadow-md"
    />
  </div>
</div>


               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {support.features.map((feature, index) => (
    <Card
      key={index}
      className="border border-transparent shadow transition-transform duration-300 ease-in-out hover:border-orange-500 hover:scale-105"
      style={{ willChange: 'transform' }}
    >
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
      </CardContent>
    </Card>
  ))}
</div>

              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="py-8">
                <h2 className="text-2xl font-bold mb-6 bg-orange-200 text-gray-800 dark:text-gray-200">Frequently Asked Questions</h2>
                
                <div className="space-y-4 mb-8">
                  {faqs.map((faq, index) => (
                    <Accordion key={index} type="single" collapsible className="border rounded-lg overflow-hidden">
                      <AccordionItem value={`item-${index}`} className="border-0">
                        <AccordionTrigger className="px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-blue-100 dark:bg-gray-800/50">
          <div className="edu-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to advance your career with {title}?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join students across the globe who are building their future today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-eduBlue-600 hover:bg-eduBlue-700 text-white px-8 py-2 text-lg">
                Enroll Now
              </Button>
              <Button variant="outline" className="border-eduBlue-600 text-eduBlue-600 hover:bg-eduBlue-50 px-8 py-2 text-lg">
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProgramPageTemplate;
