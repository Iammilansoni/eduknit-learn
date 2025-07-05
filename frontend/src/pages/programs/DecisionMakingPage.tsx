
import React from 'react';
import ProgramPageTemplate6 from '@/components/programs/ProgramPageTemplate6';
import { Lightbulb } from 'lucide-react';

const DecisionMakingPage = () => {
  return (
    <ProgramPageTemplate6
      icon={<Lightbulb className="h-8 w-8" />}
      iconBgClass="bg-eduBlue-100"
      iconTextClass="text-eduBlue-600"
      title="Decision-Making Skills"
      tagline="Learn how top leaders think."
      videoSrc="https://player.vimeo.com/external/434045526.hd.mp4?s=78834fde61b26c3f0de96c7f7ff43b94f72c3abb"
      overview={[
        "Effective decision-making is perhaps the most valuable skill for success in academics, careers, and life. Our Decision-Making Skills program teaches structured approaches to thinking that enable better choices in any context.",
        "Through practical exercises and real-world scenarios, you'll learn proven frameworks used by top leaders and problem solvers. From analyzing information critically to managing uncertainty, you'll develop a toolkit for tackling decisions of all types and scales.",
        "This program is designed to help students develop cognitive skills that transcend specific subjects or roles, providing lifelong techniques for clearer thinking and better outcomes."
      ]}
      careerOutlook={{
        description: [
          "Strong decision-making skills are consistently rated among the most valuable abilities in leadership positions across all industries and sectors.",
          "By developing structured thinking and decision processes now, you'll build a foundation for success in any career path, particularly those involving management, strategy, or complex problem solving."
        ],
        paths: [
          {
            title: "Business Leadership",
            description: "Make strategic decisions that drive organizational success."
          },
          {
            title: "Project Management",
            description: "Navigate complex projects with effective decision frameworks."
          },
          {
            title: "Consulting",
            description: "Advise organizations on solving challenging problems."
          },
          {
            title: "Entrepreneurship",
            description: "Make crucial decisions for business launch and growth."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum takes you through proven decision-making frameworks and provides extensive practice applying them to real-world scenarios.",
        modules: [
          {
            id: "module-1",
            title: "Critical Thinking Foundations",
            description: "Build the analytical skills to evaluate information effectively.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "Cognitive Biases & Logical Fallacies",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Evidence Evaluation",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "Critical Thinking Exercises",
                duration: "45 min",
                type: "quiz"
              }
            ]
          },
          {
            id: "module-2",
            title: "Decision Frameworks",
            description: "Learn structured approaches to making different types of decisions.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Cost-Benefit Analysis",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Decision Trees & Expected Value",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "Multi-criteria Decision Analysis",
                duration: "40 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-3",
            title: "Problem-Solving Methods",
            description: "Master methodical approaches to tackle complex problems.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "Problem Definition & Framing",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "Root Cause Analysis",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "Solution Development & Evaluation",
                duration: "45 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-4",
            title: "Decision-Making in Practice",
            description: "Apply decision techniques to realistic scenarios.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Decisions Under Uncertainty",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Group Decision Processes",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-4-3",
                title: "Decision Simulation Scenarios",
                duration: "60 min",
                type: "quiz"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "Developing strong decision-making skills requires both learning frameworks and practicing their application. Our program provides comprehensive support for this skill development.",
          "From scenario-based exercises to feedback on your decision processes, you'll have the resources needed to refine your thinking."
        ],
        features: [
          {
            title: "Decision Scenarios",
            description: "Practice with realistic situations requiring thoughtful analysis and decisions."
          },
          {
            title: "Process Feedback",
            description: "Receive guidance on improving your approach to decision problems."
          },
          {
            title: "Decision Tools",
            description: "Access templates and digital tools that support structured decision-making."
          },
          {
            title: "Peer Discussion",
            description: "Engage with other students to explore different perspectives on decisions."
          }
        ]
      }}
      faqs={[
        {
          question: "Is this program focused on business decisions or personal decisions?",
          answer: "The program covers decision-making frameworks that apply to both business and personal contexts. The skills you'll develop are transferable across all areas of life where choices need to be made."
        },
        {
          question: "How will I practice the decision-making techniques I learn?",
          answer: "Throughout the program, you'll work through numerous scenario-based exercises, simulations, and case studies that require application of the frameworks and techniques you're learning."
        },
        {
          question: "Do I need any background in statistics or economics?",
          answer: "No prior knowledge is required. When we cover concepts like expected value or utility, we introduce them from first principles with clear explanations and examples."
        },
        {
          question: "How is decision-making taught as a skill?",
          answer: "We break down decision-making into learnable components: information gathering, analysis techniques, structuring choices, evaluating alternatives, and implementation planning. Each component is taught through examples and practice."
        },
        {
          question: "Will this help me with academic decisions like choosing a college major?",
          answer: "Absolutely! The frameworks you learn will be directly applicable to important life decisions like educational paths, and we include specific examples related to academic and career planning."
        }
      ]}
    />
  );
};

export default DecisionMakingPage;
