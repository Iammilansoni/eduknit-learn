
import React from 'react';
import ProgramPageTemplate from '@/components/programs/ProgramPageTemplate';
import { MessageSquare } from 'lucide-react';

const CommunicationSkillsPage = () => {
  return (
    <ProgramPageTemplate
      icon={<MessageSquare className="h-8 w-8" />}
      iconBgClass="bg-eduBlue-100"
      iconTextClass="text-eduBlue-600"
      title="Communication Skills"
      tagline="Transform your ideas into powerful messages that move people."
      videoSrc="https://player.vimeo.com/external/377669055.hd.mp4?s=dc0d6e7e0b4486595c50073257e9514b86b56376"
      
      overview={[
        "In today's interconnected world, effective communication is more than just speaking clearly—it's about connecting, persuading, and inspiring action. Our Communication Skills program builds the essential foundation you need for success in any field.",
        "Through practical exercises, real-world scenarios, and expert guidance, you'll develop the ability to communicate confidently across different contexts and platforms, from professional presentations to everyday interactions.",
        "Whether you're preparing for college interviews, future careers, or just want to express yourself more effectively, this program offers the tools and techniques to elevate your communication to the next level."
        
        
      ]}
      careerOutlook={{
        description: [
          "Strong communication skills consistently rank among the top qualities employers look for across all industries. By mastering these fundamental skills now, you're setting yourself up for success in virtually any career path.",
          "From marketing and public relations to leadership positions in any field, the ability to communicate effectively opens doors and accelerates professional growth."
        ],
        paths: [
          {
            title: " Academic and Career Boost",
            description:  "Effective communication improves performance in exams, competitions, interviews, and internships."
             
          },
          {
            title: " Confidence Building",
            description:  "Speak confidently in school events, debates, interviews, and future professional settings."
            
          },
          {
            title: "Life-long Impact",
            description: "Strong communication skills are key to success in every career field, from business to science."
          },
          {
            title: "Career",
            description: "Persuade potential clients and build lasting business relationships."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum is designed to build your skills progressively, from foundational concepts to advanced techniques. Each module combines theory with plenty of practice.",
        modules: [
          {
            id: "module-1",
            title: " Basics of Communication",
            description: "Master the core principles that make communication clear, compelling, and effective.",
            
            lessons: [
              {
                id: "lesson-1-1",
                title: "Communication Models and Principles",
                duration: "20 min",
                type: "text"
                
              },
              {
                id: "lesson-1-2",
                title: "Active Listening Techniques",
                duration: "35 min",
                type: "text"
              },
              {
                id: "lesson-1-3",
                title: "Overcoming Communication Barriers",
                duration: "15 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-2",
            title: " Public Speaking Essentials",
            description: "Learn to write clearly and persuasively across various formats and contexts.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Principles of Clear Writing",
                duration: "25 min",
                type: "text"
              },
              {
                id: "lesson-2-2",
                title: "Email and Professional Correspondence",
                duration: "30 min",
                type: "text"
              },
              {
                id: "lesson-2-3",
                title: "Writing Practice Exercise",
                duration: "45 min",
                type: "quiz"
              }
            ]
          },
          {
            id: "module-3",
            title: "Group Discussions and Debates",
            description: "Build confidence and skills for speaking effectively to any audience.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "Structuring Compelling Presentations",
                duration: "30 min",
                type: "text"
              },
              {
                id: "lesson-3-2",
                title: "Managing Speech Anxiety",
                duration: "20 min",
                type: "text"
              },
              {
                id: "lesson-3-3",
                title: "Voice, Body Language, and Delivery",
                duration: "40 min",
                type: "text"
              }
            ]
          },
          {
            id: "module-4",
            title: "Presentation Skills",
            description: "Navigate the unique challenges and opportunities of communicating in digital spaces.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Social Media Communication",
                duration: "25 min",
                type: "text"
              },
              {
                id: "lesson-4-2",
                title: "Virtual Meeting Best Practices",
                duration: "30 min",
                type: "text"
              },
              {
                id: "lesson-4-3",
                title: "Digital Communication Project",
                duration: "60 min",
                type: "quiz"
              },
              
            ]
          },
          {
            id: "module-5",
            title: " Interview Skills Training",
            description: "Navigate the unique challenges and opportunities of communicating in digital spaces.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Social Media Communication",
                duration: "25 min",
                type: "text"
              },
              {
                id: "lesson-4-2",
                title: "Virtual Meeting Best Practices",
                duration: "30 min",
                type: "text"
              },
              {
                id: "lesson-4-3",
                title: "Digital Communication Project",
                duration: "60 min",
                type: "quiz"
              },
              
            ]
          },
        {
            id: "module-6",
            title: "Building Leadership Presence",
            description: "Navigate the unique challenges and opportunities of communicating in digital spaces.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Social Media Communication",
                duration: "25 min",
                type: "text"
              },
              {
                id: "lesson-4-2",
                title: "Virtual Meeting Best Practices",
                duration: "30 min",
                type: "text"
              },
              {
                id: "lesson-4-3",
                title: "Digital Communication Project",
                duration: "60 min",
                type: "quiz"
              },
              
            ]
          }
        ]
      }}
      support={{
        description: [
          "We believe learning happens best with the right support system in place. That's why our program includes comprehensive resources to help you succeed.",
          "From personalized feedback to live sessions with instructors, you'll have everything you need to master communication skills."
        ],
        features: [
          {
            title: "1-on-1 Mentorship",
            description: " Get personal mentorship sessions to guide your learning."
          },
          {
            title: " Internship Support",
            description: " Get connected with internship opportunities after course completion"
          },
          {
            title: "Learning Community",
            description: " Join a like-minded group of students and grow together."
          },
          {
            title: " Weekly Assignment Review",
            description: " Receive personalized feedback on your practical assignments"
          }
        ]
      }}
      faqs={[
        {
          question: " Can I manage this course with my school studies?",
          answer: "Yes, the course is structured to be manageable with schoolwork."
        },
        {
          question: " Will I work on live projects?",
          answer: " Yes, we offer opportunities to practice on real-life case studies and mini-projects."
        },
        {
          question: "Do I need a laptop?",
          answer: "Having a laptop will be helpful, but not mandatory. Most tasks can also be managed through a mobile device."
        },
        {
          question: " I feel shy while speaking. Can I still join?",
          answer: " Absolutely! This course is specially designed to build confidence step."
        },
        {
          question: "Will I get live support?",
          answer: ": Yes, you will get live support to unblock your doubts."
        },
         {
          question: " Are there live practice sessions?",
          answer: ": Yes, you will participate in group discussions, debates, presentations, and mock interviews.."
        },
         {
          question: "Do I need any previous experience in public speaking?",
          answer: ": Not at all. We start from basics and move to advanced levels."
        }
      ]}
    />
  );
};

export default CommunicationSkillsPage;
