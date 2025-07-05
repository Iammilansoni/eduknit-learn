
import React from 'react';
import ProgramPageTemplate2 from '@/components/programs/ProgramPageTemplate2';
import { Brain } from 'lucide-react';

const BasicsOfAIPage = () => {
  return (
    <ProgramPageTemplate2
      icon={<Brain className="h-8 w-8" />}
      iconBgClass="bg-eduBlue-100"
      iconTextClass="text-eduBlue-600"
      title="Basics of AI"
      tagline="AI is not just the future — it's your future."
      videoSrc="https://player.vimeo.com/external/517090053.hd.mp4?s=56e3e91ad7924f7b7b441b57cebe15e77ff6c143"
      overview={[
        "Artificial Intelligence is transforming every industry, from healthcare to entertainment. Our Basics of AI program provides a solid foundation in AI concepts, applications, and implications without requiring advanced technical skills.",
        "You'll explore how AI systems work, how they're being used today, and the ethical considerations they raise. Through hands-on examples and guided projects, you'll gain practical understanding that will serve you in any career path.",
        "This program is designed specifically for students who want to understand AI technology and its impact, whether or not they plan to pursue technical roles in the field."
      ]}
      careerOutlook={{
        description: [
          "Understanding AI fundamentals is becoming essential across virtually all industries as organizations integrate these technologies into their operations.",
          "By building AI literacy now, you'll be better prepared for a future where working alongside intelligent systems is the norm, regardless of your chosen career path."
        ],
        paths: [
          {
            title: "AI Product Manager",
            description: "Guide the development of AI-enhanced products and features."
          },
          {
            title: "AI Ethics Specialist",
            description: "Address the ethical implications of AI implementation in organizations."
          },
          {
            title: "Business Intelligence Analyst",
            description: "Leverage AI tools to extract insights from business data."
          },
          {
            title: "AI-Enabled Professional",
            description: "Enhance your effectiveness in any role by intelligently leveraging AI tools."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum demystifies AI concepts and makes them accessible through clear explanations and practical applications.",
        modules: [
          {
            id: "module-1",
            title: "Introduction to Artificial Intelligence",
            description: "Understand what AI is, its history, and how it's changing our world.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "What is Artificial Intelligence?",
                duration: "20 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Brief History of AI Development",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "AI vs. Machine Learning vs. Deep Learning",
                duration: "30 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-2",
            title: "How AI Works",
            description: "Learn the basic principles behind AI technologies in simple terms.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Machine Learning Fundamentals",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Neural Networks Simplified",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "How AI Makes Decisions",
                duration: "25 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-3",
            title: "AI in Real Life",
            description: "Explore how AI is being used across different industries today.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "AI in Healthcare",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "AI in Business and Finance",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "AI in Entertainment and Creativity",
                duration: "25 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-4",
            title: "Ethics and Future of AI",
            description: "Consider the ethical implications and future directions of AI technology.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Ethical Considerations in AI",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Bias in AI Systems",
                duration: "25 min",
                type: "reading"
              },
              {
                id: "lesson-4-3",
                title: "The Future of AI and Society",
                duration: "40 min",
                type: "video"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "We understand that AI concepts can sometimes seem complex, which is why we provide robust support to ensure your learning experience is accessible and engaging.",
          "Our goal is to make AI understandable for everyone, regardless of technical background."
        ],
        features: [
          {
            title: "Simplified Explanations",
            description: "Complex concepts broken down into accessible, jargon-free explanations."
          },
          {
            title: "Hands-On Activities",
            description: "Interactive exercises to experience AI principles in action."
          },
          {
            title: "AI Tool Exploration",
            description: "Guided tours of real AI tools you can use without coding knowledge."
          },
          {
            title: "Expert Q&A Sessions",
            description: "Regular opportunities to ask questions and clarify concepts with AI specialists."
          }
        ]
      }}
      faqs={[
        {
          question: "Do I need a technical background to take this course?",
          answer: "No technical background is required. This program is specifically designed to make AI concepts accessible to everyone, regardless of their technical expertise."
        },
        {
          question: "Will I learn how to code AI systems?",
          answer: "This program focuses on understanding AI concepts rather than building AI systems from scratch. While we'll introduce some basic coding concepts, comprehensive programming skills are not part of this particular program."
        },
        {
          question: "How will this program help my future career?",
          answer: "AI literacy is becoming increasingly valuable across all industries. Understanding how AI works, its capabilities, and limitations will help you work more effectively with AI tools and make informed decisions about AI implementation."
        },
        {
          question: "What makes this program different from technical AI courses?",
          answer: "Unlike technical courses that focus on programming and building AI systems, our program emphasizes conceptual understanding, practical applications, and the societal implications of AI technologies."
        },
        {
          question: "Will the content become outdated quickly given how fast AI is evolving?",
          answer: "While specific AI applications evolve rapidly, the fundamental concepts we teach remain relevant. We regularly update our curriculum to include current examples and emerging trends in AI."
        }
      ]}
    />
  );
};

export default BasicsOfAIPage;
