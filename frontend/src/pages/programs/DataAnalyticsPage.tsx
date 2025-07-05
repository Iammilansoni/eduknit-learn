
import React from 'react';
import ProgramPageTemplate4 from '@/components/programs/ProgramPageTemplate4';
import { Database } from 'lucide-react';

const DataAnalyticsPage = () => {
  return (
    <ProgramPageTemplate4
      icon={<Database className="h-8 w-8" />}
      iconBgClass="bg-eduBlue-100"
      iconTextClass="text-eduBlue-600"
      title="Data Analytics"
      tagline="Make decisions like a CEO — with data."
      videoSrc="https://player.vimeo.com/external/399362683.hd.mp4?s=fc90d2d004612a0bf7a2a8853a784c402d33cc79"
      overview={[
        "In today's data-driven world, the ability to collect, analyze, and interpret data is an invaluable skill across all industries. Our Data Analytics program equips you with the foundational skills to work with data effectively.",
        "You'll learn how to use essential tools like Excel, Google Sheets, and visualization platforms to transform raw data into meaningful insights. Through practical projects based on real-world scenarios, you'll develop analytical thinking that drives better decision-making.",
        "This program is designed for students who want to build quantitative skills that will serve them in college, business, research, or any field where evidence-based insights create competitive advantage."
      ]}
      careerOutlook={{
        description: [
          "Data literacy is rapidly becoming essential across virtually all career paths, with specialized data roles among the fastest-growing and highest-paying positions in the job market.",
          "By developing strong data analytics foundations now, you'll be positioned for success whether you pursue dedicated data roles or bring valuable analytical skills to any profession."
        ],
        paths: [
          {
            title: "Data Analyst",
            description: "Collect, process, and analyze data to support business decision-making."
          },
          {
            title: "Business Intelligence Analyst",
            description: "Transform complex data into strategic insights for organizations."
          },
          {
            title: "Marketing Analyst",
            description: "Apply data analysis to optimize marketing campaigns and strategy."
          },
          {
            title: "Research Analyst",
            description: "Use data to support academic or industry research initiatives."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum builds practical skills through hands-on exercises with real datasets and industry-relevant tools.",
        modules: [
          {
            id: "module-1",
            title: "Data Analytics Foundations",
            description: "Understand core concepts and processes in working with data.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "Introduction to Data Thinking",
                duration: "20 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Data Collection & Cleaning",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "Types of Data Analysis",
                duration: "25 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-2",
            title: "Excel & Sheets Mastery",
            description: "Learn essential spreadsheet tools for data manipulation and analysis.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Spreadsheet Organization & Formatting",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Formulas & Functions Deep Dive",
                duration: "45 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "Pivot Tables & Data Analysis",
                duration: "40 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-3",
            title: "Data Visualization",
            description: "Transform data into compelling visual insights.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "Visualization Principles",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "Chart Types & Best Practices",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "Creating Dashboards",
                duration: "40 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-4",
            title: "Introduction to Python for Analysis",
            description: "Begin your journey with programming for advanced data analysis.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Python Basics for Data",
                duration: "40 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Working with Pandas",
                duration: "45 min",
                type: "video"
              },
              {
                id: "lesson-4-3",
                title: "Simple Data Projects in Python",
                duration: "60 min",
                type: "quiz"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "Our Data Analytics program provides comprehensive support to ensure you develop practical skills that you can apply immediately.",
          "From quality datasets to expert guidance, you'll have everything you need to build confidence in your analytical abilities."
        ],
        features: [
          {
            title: "Practice Datasets",
            description: "Work with curated real-world datasets designed for meaningful analysis."
          },
          {
            title: "Tool Tutorials",
            description: "Step-by-step guidance on using essential data analysis software."
          },
          {
            title: "Analysis Reviews",
            description: "Receive feedback on your data projects with suggestions for improvement."
          },
          {
            title: "Data Community",
            description: "Connect with fellow learners to collaborate on data challenges."
          }
        ]
      }}
      faqs={[
        {
          question: "Do I need to be good at math to succeed in this program?",
          answer: "While basic math skills are helpful, the program focuses on practical analysis using tools that handle the complex calculations for you. We emphasize interpretation and insight rather than advanced mathematics."
        },
        {
          question: "Is coding experience required for this course?",
          answer: "No prior coding experience is necessary. We start with accessible tools like Excel and Sheets before gradually introducing Python basics in a way that's approachable for beginners."
        },
        {
          question: "What kind of data will I work with during the program?",
          answer: "You'll work with a variety of real-world datasets from different industries, including business, marketing, social trends, and environmental data, providing broad exposure to different types of analysis."
        },
        {
          question: "Will I build a data portfolio during this program?",
          answer: "Yes, throughout the program you'll complete projects that can be compiled into a portfolio demonstrating your data analysis skills to future employers or educational institutions."
        },
        {
          question: "How is this program different from a college statistics course?",
          answer: "While statistics courses often focus on theory and mathematical concepts, our program emphasizes practical, tool-based analysis skills that you can immediately apply in real-world situations. We focus on the most commonly used techniques in business and research."
        }
      ]}
    />
  );
};

export default DataAnalyticsPage;
