
import React from 'react';
import ProgramPageTemplate3 from '@/components/programs/ProgramPageTemplate3';
import { Bot } from 'lucide-react';

const AIPromptCraftingPage = () => {
  return (
    <ProgramPageTemplate3
      icon={<Bot className="h-8 w-8" />}
      iconBgClass="bg-eduOrange-100"
      iconTextClass="text-eduOrange-600"
      title="AI Prompt Crafting"
      tagline="Don't just use ChatGPT — command it like a pro."
      videoSrc="https://player.vimeo.com/external/504109685.hd.mp4?s=c00a3ae886ed4cfd8b23b328747dd0d271a11abc"
      overview={[
        "AI language models like ChatGPT are powerful tools, but their effectiveness depends largely on how you communicate with them. Our AI Prompt Crafting program teaches you to write prompts that get consistently better results.",
        "Through practical exercises and real-world examples, you'll learn the principles and techniques that make AI systems work for you, not against you. From simple queries to complex creative projects, you'll gain skills to leverage AI as a true productivity multiplier.",
        "This program is perfect for students who want to harness AI tools effectively for academic research, creative projects, problem-solving, and future workplace applications."
      ]}
      careerOutlook={{
        description: [
          "As AI tools become standard in workplaces across industries, the ability to effectively communicate with and direct these systems is emerging as a valuable professional skill.",
          "Prompt engineering and AI interaction expertise is already creating specialized roles, while enhancing productivity in traditional positions across creative, analytical, and technical fields."
        ],
        paths: [
          {
            title: "Prompt Engineer",
            description: "Specialize in crafting effective prompts for AI systems in various applications."
          },
          {
            title: "AI Content Creator",
            description: "Combine creative skills with AI direction to produce innovative content."
          },
          {
            title: "Research Assistant",
            description: "Leverage AI tools to enhance academic and business research capabilities."
          },
          {
            title: "Productivity Specialist",
            description: "Help organizations implement AI tools effectively to boost efficiency."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum takes you from basic AI interactions to mastery of advanced prompt engineering techniques through hands-on practice.",
        modules: [
          {
            id: "module-1",
            title: "Foundations of Prompt Engineering",
            description: "Learn the principles that make AI prompts effective.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "How AI Language Models Work",
                duration: "20 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Clarity, Context, and Constraints",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "Common Prompt Pitfalls",
                duration: "15 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-2",
            title: "Practical Prompt Patterns",
            description: "Master proven structures for different types of AI tasks.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Role and Format Specification",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Step-by-Step Instruction Patterns",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "Prompt Pattern Practice",
                duration: "40 min",
                type: "quiz"
              }
            ]
          },
          {
            id: "module-3",
            title: "Creative & Academic Applications",
            description: "Apply prompt engineering to specific use cases.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "AI for Creative Writing & Brainstorming",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "Research, Citation & Fact-Checking",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "Academic Project Support",
                duration: "25 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-4",
            title: "Advanced Techniques & Ethics",
            description: "Explore sophisticated prompt methods and responsible AI use.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Chain-of-Thought & Self-Reflection",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Ethical AI Interaction & Bias Mitigation",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-4-3",
                title: "Advanced Prompt Engineering Project",
                duration: "60 min",
                type: "quiz"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "Learning to communicate effectively with AI requires practice and feedback. Our support system ensures you develop mastery through guided experience.",
          "We provide resources and assistance to help you refine your prompt crafting skills across different AI tools and applications."
        ],
        features: [
          {
            title: "AI Tool Access",
            description: "Practice with various AI systems to understand different response patterns."
          },
          {
            title: "Prompt Libraries",
            description: "Access collections of effective prompts for various use cases and purposes."
          },
          {
            title: "Prompt Analysis",
            description: "Get feedback on your prompts with suggestions for improvement."
          },
          {
            title: "AI Ethics Guidelines",
            description: "Learn to use AI tools responsibly and ethically in your work."
          }
        ]
      }}
      faqs={[
        {
          question: "Do I need prior experience with AI tools like ChatGPT?",
          answer: "No prior experience is necessary. We'll start with the basics and progressively build your skills, though those with some AI experience will still gain valuable new techniques."
        },
        {
          question: "Will this program help me with specific AI tools beyond ChatGPT?",
          answer: "Yes, while we use ChatGPT for many examples, the principles and techniques you'll learn apply broadly to interaction with various AI systems, including other language models and specialized AI tools."
        },
        {
          question: "How practical is this program? Will I work on real projects?",
          answer: "The program is highly practical, with approximately 70% of your time spent on hands-on practice. You'll work on real-world prompts and projects relevant to academic, personal, and professional applications."
        },
        {
          question: "Is prompt engineering a passing trend or a lasting skill?",
          answer: "While AI interfaces will evolve, the fundamental skill of effectively communicating instructions to AI systems will remain valuable for the foreseeable future as these tools become more integrated into work and education."
        },
        {
          question: "Will I learn to use AI ethically and responsibly?",
          answer: "Absolutely. Ethical considerations are integrated throughout the program, with specific focus on responsible use, understanding AI limitations, avoiding harmful outputs, and maintaining human oversight."
        }
      ]}
    />
  );
};

export default AIPromptCraftingPage;
