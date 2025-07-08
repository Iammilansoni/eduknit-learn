import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, Calendar, Clock, Play, ArrowLeft, Users, FileText, Check } from 'lucide-react';
import CourseModule from '@/components/courses/CourseModule';
import EnrollButton from '@/components/courses/EnrollButton';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams();
  
  // Course data based on your programs dropdown
  const courses = [
    {
      id: 1,
      title: "Basics of AI",
      category: "AI CERTIFICATE",
      description: "Learn the fundamentals of artificial intelligence and how it affects our daily lives.",
      instructor: "Dr. Sarah Johnson",
      progress: 65,
      duration: "3-5 hours/week",
      timeframe: "1-2 months",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      overview: "Master the fundamental skills needed to leverage AI tools and applications in the workplace. Make AI your coworker, not your competition.",
      features: [
        {
          title: "Study anytime, anywhere",
          description: "Tailor your education to your schedule, preferences, and lifestyle with our flexible online learning platform.",
          icon: "https://lovable-uploads/ed78e675-8662-497a-826d-f3b5e6e3c093.png"
        },
        {
          title: "Learn from industry experts",
          description: "Unlock professional growth with 1:1 mentorship from an experienced professional in your field of study.",
          icon: "https://lovable-uploads/2e21954b-109a-4c32-8a12-a62e14490b9e.png"
        },
        {
          title: "Build portfolio-ready projects",
          description: "Showcase your skills to employers with hands-on projects that demonstrate your expertise and real-world readiness.",
          icon: "https://lovable-uploads/27d4257b-38cf-42ed-993f-051e47d47e2e.png"
        }
      ],
      skills: [
        "Understand core AI concepts",
        "Recognize AI applications",
        "Develop critical thinking around AI ethics",
        "Integrate AI into your daily workflows",
        "Evaluate AI tools effectively"
      ],
      modules: [
        {
          id: 1,
          title: "Introduction to AI Concepts",
          description: "Discover how artificial intelligence works, its history, and its fundamental principles.",
          isUnlocked: true,
          progress: 100,
          lessons: [
            {
              id: 1,
              title: "What is Artificial Intelligence?",
              duration: "25 min",
              isCompleted: true,
              type: "video",
              content: "This foundational lesson introduces you to the concept of artificial intelligence, exploring definitions, key terms, and the overall landscape of AI technology."
            },
            {
              id: 2,
              title: "History and Evolution of AI",
              duration: "35 min",
              isCompleted: true,
              type: "reading",
              content: "Explore the fascinating journey of AI from its earliest conceptual roots to today's advanced systems, understanding key milestones and breakthroughs along the way."
            },
            {
              id: 3,
              title: "Types of AI Systems",
              duration: "40 min",
              isCompleted: true,
              type: "video",
              content: "Learn to distinguish between narrow AI, general AI, and superintelligence while understanding the capabilities and limitations of each category."
            },
            {
              id: 4,
              title: "Module 1 Assessment",
              duration: "20 min",
              isCompleted: true,
              type: "quiz",
              content: "Test your understanding of core AI concepts through a comprehensive assessment covering definitions, history, and AI system classifications."
            }
          ]
        },
        {
          id: 2,
          title: "AI in Everyday Life",
          description: "Explore how AI is already integrated into our daily lives and how it's changing various industries.",
          isUnlocked: true,
          progress: 75,
          lessons: [
            {
              id: 5,
              title: "Consumer AI Applications",
              duration: "30 min",
              isCompleted: true,
              type: "video",
              content: "Discover how AI powers everyday technology from smartphone features to smart home devices, personalized recommendations, and digital assistants."
            },
            {
              id: 6,
              title: "AI in Business and Industry",
              duration: "45 min",
              isCompleted: true,
              type: "reading",
              content: "Explore AI applications across different sectors including healthcare, finance, retail, manufacturing, and transportation, with real-world case studies."
            },
            {
              id: 7,
              title: "Ethical Considerations in AI",
              duration: "35 min",
              isCompleted: false,
              type: "video",
              content: "Examine important ethical questions raised by AI deployment including privacy concerns, algorithmic bias, job displacement, and responsible AI development."
            },
            {
              id: 8,
              title: "Module 2 Assessment",
              duration: "25 min",
              isCompleted: false,
              type: "quiz",
              content: "Test your knowledge of real-world AI applications and ethical considerations through practical scenarios and critical thinking questions."
            }
          ]
        },
        {
          id: 3,
          title: "Machine Learning Fundamentals",
          description: "Learn the basics of how machines learn from data and make predictions.",
          isUnlocked: true,
          progress: 0,
          lessons: [
            {
              id: 9,
              title: "Introduction to Machine Learning",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Understand the basic principles behind machine learning, how it differs from traditional programming, and its relationship to broader AI concepts."
            },
            {
              id: 10,
              title: "Supervised vs. Unsupervised Learning",
              duration: "35 min",
              isCompleted: false,
              type: "reading",
              content: "Explore different learning paradigms in AI, understanding when and how to apply supervised, unsupervised, and reinforcement learning approaches."
            },
            {
              id: 11,
              title: "Neural Networks and Deep Learning",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Discover how artificial neural networks mimic the human brain, and how deep learning has revolutionized AI capabilities in image recognition, language processing, and more."
            },
            {
              id: 12,
              title: "Module 3 Assessment",
              duration: "30 min",
              isCompleted: false,
              type: "quiz",
              content: "Test your understanding of machine learning concepts through practical examples and scenario-based questions."
            }
          ]
        },
        {
          id: 4,
          title: "AI Tools and Applications",
          description: "Discover practical AI tools and how to integrate them into your workflow.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 13,
              title: "AI-Powered Productivity Tools",
              duration: "35 min",
              isCompleted: false,
              type: "video",
              content: "Explore various AI tools that can enhance productivity, automate routine tasks, and streamline workflows across different professional contexts."
            },
            {
              id: 14,
              title: "Effective Prompt Engineering",
              duration: "40 min",
              isCompleted: false,
              type: "reading",
              content: "Learn techniques to craft effective prompts for AI systems like ChatGPT and DALL-E to get more accurate, useful, and creative outputs."
            },
            {
              id: 15,
              title: "Building Simple AI Solutions",
              duration: "60 min",
              isCompleted: false,
              type: "video",
              content: "Discover no-code and low-code platforms that allow you to create AI-powered solutions without extensive programming knowledge."
            },
            {
              id: 16,
              title: "Module 4 Assessment",
              duration: "30 min",
              isCompleted: false,
              type: "quiz",
              content: "Demonstrate your ability to select appropriate AI tools for different scenarios and craft effective prompts for various AI systems."
            }
          ]
        },
        {
          id: 5,
          title: "The Future of AI",
          description: "Explore emerging AI trends and prepare for the future AI landscape.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 17,
              title: "Emerging AI Technologies",
              duration: "45 min",
              isCompleted: false,
              type: "video",
              content: "Learn about cutting-edge developments in AI research including multimodal systems, generative models, self-supervised learning, and more."
            },
            {
              id: 18,
              title: "AI's Impact on Future Careers",
              duration: "35 min",
              isCompleted: false,
              type: "reading",
              content: "Understand how AI will transform various professions and industries, with guidance on developing AI-complementary skills for career resilience."
            },
            {
              id: 19,
              title: "Final Course Project",
              duration: "90 min",
              isCompleted: false,
              type: "assignment",
              content: "Apply your knowledge by creating a detailed proposal on how AI could be effectively integrated into a workplace or industry of your choice."
            },
            {
              id: 20,
              title: "Final Assessment",
              duration: "60 min",
              isCompleted: false,
              type: "quiz",
              content: "A comprehensive evaluation covering all course topics with an emphasis on practical application and critical thinking about AI systems."
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Data Analytics",
      category: "DATA CERTIFICATION",
      description: "Make decisions like a CEO — with data. Master essential data analysis techniques and tools.",
      instructor: "Prof. Michael Chen",
      progress: 30,
      duration: "4-6 hours/week",
      timeframe: "2-3 months",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      overview: "Learn to analyze and interpret data to make informed business decisions. From spreadsheets to visualization tools, master the skills that drive today's data-driven organizations.",
      features: [
        {
          title: "Study anytime, anywhere",
          description: "Tailor your education to your schedule, preferences, and lifestyle with our flexible online learning platform.",
          icon: "https://lovable-uploads/ed78e675-8662-497a-826d-f3b5e6e3c093.png"
        },
        {
          title: "Learn from industry experts",
          description: "Unlock professional growth with 1:1 mentorship from an experienced professional in your field of study.",
          icon: "https://lovable-uploads/2e21954b-109a-4c32-8a12-a62e14490b9e.png"
        },
        {
          title: "Build portfolio-ready projects",
          description: "Showcase your skills to employers with hands-on projects that demonstrate your expertise and real-world readiness.",
          icon: "https://lovable-uploads/27d4257b-38cf-42ed-993f-051e47d47e2e.png"
        }
      ],
      skills: [
        "Excel and Google Sheets mastery",
        "Data visualization techniques",
        "Statistical analysis fundamentals",
        "Business intelligence reporting",
        "Basic Python for data analysis"
      ],
      modules: [
        {
          id: 1,
          title: "Fundamentals of Data Analysis",
          description: "Master the core concepts and tools needed for effective data analysis.",
          isUnlocked: true,
          progress: 100,
          lessons: [
            {
              id: 1,
              title: "Introduction to Data Analysis",
              duration: "30 min",
              isCompleted: true,
              type: "video",
              content: "Understand the data analysis life cycle, key terminology, and the importance of data-driven decision making in modern organizations."
            },
            {
              id: 2,
              title: "Types of Data and Collection Methods",
              duration: "40 min",
              isCompleted: true,
              type: "reading",
              content: "Learn to distinguish between qualitative and quantitative data, structured and unstructured data, and various methods of gathering information."
            },
            {
              id: 3,
              title: "Data Cleaning and Preparation",
              duration: "50 min",
              isCompleted: true,
              type: "video",
              content: "Master techniques for identifying and handling missing values, outliers, and inconsistencies to ensure your data is analysis-ready."
            },
            {
              id: 4,
              title: "Module 1 Assessment",
              duration: "25 min",
              isCompleted: true,
              type: "quiz",
              content: "Test your understanding of data analysis fundamentals through practical exercises and scenario-based questions."
            }
          ]
        },
        {
          id: 2,
          title: "Excel and Spreadsheet Mastery",
          description: "Learn essential spreadsheet skills for data analysis in Excel and Google Sheets.",
          isUnlocked: true,
          progress: 50,
          lessons: [
            {
              id: 5,
              title: "Spreadsheet Fundamentals",
              duration: "35 min",
              isCompleted: true,
              type: "video",
              content: "Master spreadsheet interfaces, cell references, basic formulas, and formatting techniques essential for data work."
            },
            {
              id: 6,
              title: "Advanced Functions and Formulas",
              duration: "55 min",
              isCompleted: true,
              type: "video",
              content: "Learn to use powerful functions like VLOOKUP, INDEX/MATCH, SUMIFS, and array formulas to process and analyze data efficiently."
            },
            {
              id: 7,
              title: "Data Tables and Pivot Tables",
              duration: "60 min",
              isCompleted: false,
              type: "video",
              content: "Discover how to summarize, aggregate, and explore data through powerful pivot tables and data tables for scenario analysis."
            },
            {
              id: 8,
              title: "Module 2 Assessment",
              duration: "35 min",
              isCompleted: false,
              type: "quiz",
              content: "Apply your spreadsheet skills to solve real-world data problems through hands-on exercises and projects."
            }
          ]
        },
        {
          id: 3,
          title: "Data Visualization",
          description: "Learn to create compelling visualizations that communicate insights effectively.",
          isUnlocked: true,
          progress: 0,
          lessons: [
            {
              id: 9,
              title: "Principles of Data Visualization",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Understand the science behind effective data visualization, including visual perception principles and best practices for clarity."
            },
            {
              id: 10,
              title: "Chart Types and Their Applications",
              duration: "50 min",
              isCompleted: false,
              type: "reading",
              content: "Learn when and how to use different chart types including bar charts, line charts, pie charts, scatter plots, and specialized visualizations."
            },
            {
              id: 11,
              title: "Creating Dashboards",
              duration: "65 min",
              isCompleted: false,
              type: "video",
              content: "Master the art of building interactive dashboards that present multiple related visualizations for comprehensive data storytelling."
            },
            {
              id: 12,
              title: "Module 3 Assessment",
              duration: "40 min",
              isCompleted: false,
              type: "quiz",
              content: "Demonstrate your visualization skills by creating appropriate charts and dashboards for various datasets and business scenarios."
            }
          ]
        },
        {
          id: 4,
          title: "Statistical Analysis",
          description: "Master statistical concepts and techniques essential for data analysis.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 13,
              title: "Descriptive Statistics",
              duration: "45 min",
              isCompleted: false,
              type: "video",
              content: "Learn to summarize and describe data using measures of central tendency, dispersion, and distribution characteristics."
            },
            {
              id: 14,
              title: "Inferential Statistics",
              duration: "60 min",
              isCompleted: false,
              type: "reading",
              content: "Understand how to draw conclusions about populations from sample data using statistical inference techniques."
            },
            {
              id: 15,
              title: "Correlation and Regression",
              duration: "55 min",
              isCompleted: false,
              type: "video",
              content: "Discover how to identify and quantify relationships between variables using correlation analysis and simple linear regression."
            },
            {
              id: 16,
              title: "Module 4 Assessment",
              duration: "45 min",
              isCompleted: false,
              type: "quiz",
              content: "Apply statistical concepts to analyze datasets and interpret results through problem-solving scenarios."
            }
          ]
        },
        {
          id: 5,
          title: "Introduction to Python for Data Analysis",
          description: "Learn the basics of Python programming for data analysis tasks.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 17,
              title: "Python Basics for Data Analysis",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Get started with Python syntax, data types, and basic operations relevant to data analysis workflows."
            },
            {
              id: 18,
              title: "Working with Pandas",
              duration: "65 min",
              isCompleted: false,
              type: "video",
              content: "Master the powerful Pandas library for data manipulation, cleaning, and analysis in Python."
            },
            {
              id: 19,
              title: "Final Course Project",
              duration: "120 min",
              isCompleted: false,
              type: "assignment",
              content: "Apply your data analysis skills to a comprehensive real-world dataset, creating insights and recommendations through appropriate methods."
            },
            {
              id: 20,
              title: "Final Assessment",
              duration: "60 min",
              isCompleted: false,
              type: "quiz",
              content: "A comprehensive evaluation covering all data analysis topics with emphasis on practical application and insight generation."
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Decision-Making Skills",
      category: "PROFESSIONAL SKILLS",
      description: "Learn how top leaders think. Master frameworks for better decision-making in complex situations.",
      instructor: "Dr. Emma Rodriguez",
      progress: 15,
      duration: "2-4 hours/week",
      timeframe: "4-6 weeks",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      overview: "Develop structured approaches to decision-making that will help you navigate complex problems with confidence and clarity. Learn from real-world cases and practical exercises.",
      features: [
        {
          title: "Study anytime, anywhere",
          description: "Tailor your education to your schedule, preferences, and lifestyle with our flexible online learning platform.",
          icon: "https://lovable-uploads/ed78e675-8662-497a-826d-f3b5e6e3c093.png"
        },
        {
          title: "Learn from industry experts",
          description: "Unlock professional growth with 1:1 mentorship from an experienced professional in your field of study.",
          icon: "https://lovable-uploads/2e21954b-109a-4c32-8a12-a62e14490b9e.png"
        },
        {
          title: "Build portfolio-ready projects",
          description: "Showcase your skills to employers with hands-on projects that demonstrate your expertise and real-world readiness.",
          icon: "https://lovable-uploads/27d4257b-38cf-42ed-993f-051e47d47e2e.png"
        }
      ],
      skills: [
        "Critical thinking",
        "Problem-solving strategies",
        "Decision frameworks",
        "Risk assessment",
        "Decision implementation planning"
      ],
      modules: [
        {
          id: 1,
          title: "Foundations of Decision-Making",
          description: "Understand the cognitive processes and common biases in decision-making.",
          isUnlocked: true,
          progress: 100,
          lessons: [
            {
              id: 1,
              title: "How We Make Decisions",
              duration: "30 min",
              isCompleted: true,
              type: "video",
              content: "Explore the psychology and neuroscience behind decision-making processes and how our brains evaluate options and outcomes."
            },
            {
              id: 2,
              title: "Cognitive Biases and Decision Traps",
              duration: "40 min",
              isCompleted: true,
              type: "reading",
              content: "Learn to identify and mitigate common cognitive biases that lead to poor decisions, including confirmation bias and sunk cost fallacy."
            },
            {
              id: 3,
              title: "Rational vs. Intuitive Decision-Making",
              duration: "35 min",
              isCompleted: true,
              type: "video",
              content: "Understand the strengths and weaknesses of analytical and intuitive approaches to decision-making and when to rely on each."
            },
            {
              id: 4,
              title: "Module 1 Assessment",
              duration: "25 min",
              isCompleted: true,
              type: "quiz",
              content: "Test your understanding of decision-making foundations through scenario analysis and self-reflection exercises."
            }
          ]
        },
        {
          id: 2,
          title: "Decision-Making Frameworks",
          description: "Learn structured approaches to making complex decisions.",
          isUnlocked: true,
          progress: 50,
          lessons: [
            {
              id: 5,
              title: "The WRAP Framework",
              duration: "35 min",
              isCompleted: true,
              type: "video",
              content: "Master the four-step WRAP process (Widen options, Reality-test assumptions, Attain distance, Prepare to be wrong) for better decisions."
            },
            {
              id: 6,
              title: "Cost-Benefit Analysis",
              duration: "40 min",
              isCompleted: true,
              type: "reading",
              content: "Learn to systematically evaluate decisions by quantifying and comparing the costs and benefits of different alternatives."
            },
            {
              id: 7,
              title: "Decision Trees and Expected Value",
              duration: "45 min",
              isCompleted: false,
              type: "video",
              content: "Explore visual decision modeling techniques that help clarify options, probabilities, and potential outcomes for complex choices."
            },
            {
              id: 8,
              title: "Module 2 Assessment",
              duration: "30 min",
              isCompleted: false,
              type: "quiz",
              content: "Apply different decision frameworks to real-world scenarios and compare their effectiveness in various contexts."
            }
          ]
        },
        {
          id: 3,
          title: "Group Decision-Making",
          description: "Master techniques for effective collective decision-making.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 9,
              title: "Collaborative Decision Processes",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Learn various methods for group decision-making including consensus building, voting systems, and facilitated discussions."
            },
            {
              id: 10,
              title: "Overcoming Groupthink",
              duration: "35 min",
              isCompleted: false,
              type: "reading",
              content: "Discover techniques to avoid groupthink and encourage healthy dissent and diverse perspectives in team decisions."
            },
            {
              id: 11,
              title: "Facilitation Skills for Decision-Making",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Master the art of facilitating productive decision-making meetings and discussions that lead to quality outcomes and buy-in."
            },
            {
              id: 12,
              title: "Module 3 Assessment",
              duration: "30 min",
              isCompleted: false,
              type: "quiz",
              content: "Demonstrate your understanding of group dynamics and facilitation techniques through case studies and role-play scenarios."
            }
          ]
        },
        {
          id: 4,
          title: "Decision Implementation",
          description: "Learn how to effectively implement decisions and manage their outcomes.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 13,
              title: "From Decision to Action Plan",
              duration: "35 min",
              isCompleted: false,
              type: "video",
              content: "Learn to transform decisions into actionable implementation plans with clear responsibilities and timelines."
            },
            {
              id: 14,
              title: "Communicating Decisions",
              duration: "30 min",
              isCompleted: false,
              type: "reading",
              content: "Master techniques for effectively communicating decisions to stakeholders to gain support and facilitate smooth implementation."
            },
            {
              id: 15,
              title: "Monitoring and Adjusting",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Develop systems for tracking decision outcomes and making necessary adjustments based on real-world feedback and results."
            },
            {
              id: 16,
              title: "Module 4 Assessment",
              duration: "40 min",
              isCompleted: false,
              type: "quiz",
              content: "Apply implementation planning techniques to complex decisions through case studies and actionable exercises."
            }
          ]
        },
        {
          id: 5,
          title: "Decision-Making in Action",
          description: "Apply your skills to real-world scenarios and complex cases.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 17,
              title: "Case Studies in Decision Excellence",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Analyze real-world examples of exceptional decision-making processes from business, politics, and other domains."
            },
            {
              id: 18,
              title: "Decision-Making Under Pressure",
              duration: "45 min",
              isCompleted: false,
              type: "reading",
              content: "Learn techniques for maintaining decision quality when facing time pressure, high stakes, or limited information."
            },
            {
              id: 19,
              title: "Final Course Project",
              duration: "90 min",
              isCompleted: false,
              type: "assignment",
              content: "Apply your decision-making skills to a complex real-world problem, documenting your process and rationale for evaluation."
            },
            {
              id: 20,
              title: "Final Assessment",
              duration: "60 min",
              isCompleted: false,
              type: "quiz",
              content: "A comprehensive evaluation testing your mastery of decision-making frameworks, implementation planning, and adaptability."
            }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Communication Skills",
      category: "PROFESSIONAL SKILLS",
      description: "Speak smart. Think sharp. Lead with confidence. Master effective communication in professional settings.",
      instructor: "Prof. James Wilson",
      progress: 5,
      duration: "2-3 hours/week",
      timeframe: "4-6 weeks",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80",
      overview: "Develop the verbal and written communication skills that will help you present ideas clearly, listen actively, and connect with others effectively in professional contexts.",
      features: [
        {
          title: "Study anytime, anywhere",
          description: "Tailor your education to your schedule, preferences, and lifestyle with our flexible online learning platform.",
          icon: "https://lovable-uploads/ed78e675-8662-497a-826d-f3b5e6e3c093.png"
        },
        {
          title: "Learn from industry experts",
          description: "Unlock professional growth with 1:1 mentorship from an experienced professional in your field of study.",
          icon: "https://lovable-uploads/2e21954b-109a-4c32-8a12-a62e14490b9e.png"
        },
        {
          title: "Build portfolio-ready projects",
          description: "Showcase your skills to employers with hands-on projects that demonstrate your expertise and real-world readiness.",
          icon: "https://lovable-uploads/27d4257b-38cf-42ed-993f-051e47d47e2e.png"
        }
      ],
      skills: [
        "Effective presentation",
        "Active listening",
        "Clear written communication",
        "Persuasive speaking",
        "Nonverbal communication"
      ],
      modules: [
        {
          id: 1,
          title: "Foundations of Effective Communication",
          description: "Master the core principles that underpin all forms of successful communication.",
          isUnlocked: true,
          progress: 100,
          lessons: [
            {
              id: 1,
              title: "Communication Process Model",
              duration: "30 min",
              isCompleted: true,
              type: "video",
              content: "Understand the fundamental elements of communication including senders, receivers, messages, channels, feedback, and potential barriers."
            },
            {
              id: 2,
              title: "Understanding Your Communication Style",
              duration: "40 min",
              isCompleted: true,
              type: "reading",
              content: "Identify your natural communication preferences and strengths through self-assessment tools and reflective exercises."
            },
            {
              id: 3,
              title: "Adapting to Different Audiences",
              duration: "35 min",
              isCompleted: true,
              type: "video",
              content: "Learn techniques for analyzing audiences and tailoring your communication approach to effectively connect with different types of listeners."
            },
            {
              id: 4,
              title: "Module 1 Assessment",
              duration: "25 min",
              isCompleted: true,
              type: "quiz",
              content: "Test your understanding of communication fundamentals through scenario analysis and application exercises."
            }
          ]
        },
        {
          id: 2,
          title: "Verbal Communication Excellence",
          description: "Develop powerful speaking skills for various professional contexts.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 5,
              title: "Structure and Organization",
              duration: "35 min",
              isCompleted: false,
              type: "video",
              content: "Master frameworks for organizing your thoughts and delivering messages with clarity, including the PREP method and other proven structures."
            },
            {
              id: 6,
              title: "Voice Dynamics and Delivery",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Learn techniques for using pace, pitch, volume, and pauses effectively to enhance your verbal communication impact."
            },
            {
              id: 7,
              title: "Handling Questions and Objections",
              duration: "45 min",
              isCompleted: false,
              type: "video",
              content: "Develop strategies for addressing questions, managing objections, and navigating difficult conversations with confidence."
            },
            {
              id: 8,
              title: "Module 2 Assessment",
              duration: "30 min",
              isCompleted: false,
              type: "quiz",
              content: "Demonstrate your verbal communication skills through recorded presentations and interactive feedback exercises."
            }
          ]
        },
        {
          id: 3,
          title: "Active Listening Skills",
          description: "Master the art of truly understanding others through effective listening.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 9,
              title: "Barriers to Effective Listening",
              duration: "30 min",
              isCompleted: false,
              type: "video",
              content: "Identify common obstacles to listening effectively, including distractions, biases, and the tendency to formulate responses prematurely."
            },
            {
              id: 10,
              title: "Active Listening Techniques",
              duration: "45 min",
              isCompleted: false,
              type: "reading",
              content: "Learn practical methods for demonstrating attention, understanding, and empathy through verbal and non-verbal listening behaviors."
            },
            {
              id: 11,
              title: "Reflective Listening Practice",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Master the skill of paraphrasing and summarizing what you've heard to confirm understanding and build stronger connections."
            },
            {
              id: 12,
              title: "Module 3 Assessment",
              duration: "35 min",
              isCompleted: false,
              type: "quiz",
              content: "Test your listening skills through interactive scenarios that require accurate comprehension and appropriate responses."
            }
          ]
        },
        {
          id: 4,
          title: "Written Communication",
          description: "Develop clear, concise, and compelling written communication skills.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 13,
              title: "Principles of Clear Writing",
              duration: "40 min",
              isCompleted: false,
              type: "video",
              content: "Learn the fundamentals of clear writing, including structure, word choice, tone, and reader-centered approaches."
            },
            {
              id: 14,
              title: "Email Communication Mastery",
              duration: "35 min",
              isCompleted: false,
              type: "reading",
              content: "Develop techniques for crafting effective emails that get read, understood, and acted upon in professional contexts."
            },
            {
              id: 15,
              title: "Reports and Formal Documents",
              duration: "50 min",
              isCompleted: false,
              type: "video",
              content: "Master the art of structuring longer documents, including reports, proposals, and formal business communications."
            },
            {
              id: 16,
              title: "Module 4 Assessment",
              duration: "45 min",
              isCompleted: false,
              type: "quiz",
              content: "Demonstrate your written communication skills through practical writing exercises with feedback and revision opportunities."
            }
          ]
        },
        {
          id: 5,
          title: "Advanced Communication Strategies",
          description: "Master specialized communication techniques for complex professional situations.",
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 17,
              title: "Persuasive Communication",
              duration: "45 min",
              isCompleted: false,
              type: "video",
              content: "Learn ethical persuasion techniques rooted in logos (logic), ethos (credibility), and pathos (emotion) to influence others effectively."
            },
            {
              id: 18,
              title: "Cross-Cultural Communication",
              duration: "50 min",
              isCompleted: false,
              type: "reading",
              content: "Develop awareness and strategies for communicating effectively across cultural differences in our increasingly global workplace."
            },
            {
              id: 19,
              title: "Final Course Project",
              duration: "90 min",
              isCompleted: false,
              type: "assignment",
              content: "Create a comprehensive communication plan for a complex scenario that demonstrates your integrated communication skills."
            },
            {
              id: 20,
              title: "Final Assessment",
              duration: "60 min",
              isCompleted: false,
              type: "quiz",
              content: "A holistic evaluation covering all aspects of professional communication with emphasis on adaptability and effectiveness."
            }
          ]
        }
      ]
    }
  ];

  // Find the selected course based on the courseId parameter
  const course = courses.find(c => c.id === Number(courseId)) || courses[0];
  
  // Calculate overall progress
  const overallProgress = course.modules.reduce((acc, module) => {
    return acc + module.progress;
  }, 0) / course.modules.length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back to dashboard link */}
        <Link to="/student-dashboard" className="inline-flex items-center text-eduBlue-500 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Course Hero */}
          <div className="lg:w-2/3">
            <div className="bg-gray-900 text-white rounded-xl overflow-hidden">
              <div className="relative h-60 md:h-80 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <Badge className="bg-eduOrange-500 mb-2">{course.category}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                  <p className="text-gray-200 text-lg max-w-2xl">{course.description}</p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 bg-gray-900 border-t border-gray-800">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-eduOrange-400 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-eduOrange-400 mr-2" />
                    <span>{course.timeframe}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-eduOrange-400 mr-2" />
                    <span>{course.instructor}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Course Progress</span>
                    <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
                
                <div className="flex mt-6 gap-4">
                  <EnrollButton 
                    courseId={courseId || "1"} 
                    courseName={course.title}
                    onEnrollmentChange={(enrolled, userCourse) => {
                      if (enrolled && userCourse) {
                        console.log('Enrollment successful:', userCourse);
                        // Could update local state or redirect to course content
                      }
                    }}
                  />
                  <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/10">
                    <FileText className="mr-2 h-4 w-4" /> Download Syllabus
                  </Button>
                </div>
              </div>
            </div>

            {/* Course Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curriculum" className="space-y-6">
                  <h2 className="text-2xl font-bold">Course Curriculum</h2>
                  
                  <div className="space-y-4">
                    {course.modules.map((module, index) => (
                      <Accordion key={module.id} type="single" collapsible className="border rounded-lg overflow-hidden">
                        <AccordionItem value={`module-${module.id}`} className="border-none">
                          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="flex flex-col md:flex-row md:items-center w-full space-y-2 md:space-y-0 md:justify-between text-left">
                              <div>
                                <span className="text-gray-500 text-sm mr-2">Module {index + 1}</span>
                                <h3 className="font-medium text-lg">{module.title}</h3>
                              </div>
                              <div className="flex items-center gap-3">
                                {module.isUnlocked ? (
                                  <>
                                    <Badge variant={module.progress === 100 ? "default" : "outline"} className={module.progress === 100 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}>
                                      {module.progress === 100 ? "Completed" : module.progress > 0 ? "In Progress" : "Not Started"}
                                    </Badge>
                                    <div className="w-24 hidden md:block">
                                      <Progress value={module.progress} className="h-2" />
                                    </div>
                                  </>
                                ) : (
                                  <Badge variant="outline" className="border-gray-300 text-gray-500">Locked</Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{module.description}</p>
                            <div className="space-y-3">
                              {module.lessons.map(lesson => (
                                <Collapsible key={lesson.id} className="border rounded-md">
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                      {lesson.type === 'video' && <BookOpen className="h-4 w-4 text-eduBlue-500" />}
                                      {lesson.type === 'reading' && <FileText className="h-4 w-4 text-eduOrange-500" />}
                                      {lesson.type === 'quiz' && <FileText className="h-4 w-4 text-purple-500" />}
                                      {lesson.type === 'assignment' && <FileText className="h-4 w-4 text-green-500" />}
                                      <div className="text-left">
                                        <p className="font-medium">{lesson.title}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {lesson.duration}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lesson.isCompleted && (
                                        <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                          <Check className="h-3 w-3" />
                                        </span>
                                      )}
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{lesson.content}</p>
                                    <div className="mt-3 flex justify-end">
                                      <Button size="sm" className="bg-eduBlue-500 hover:bg-eduBlue-600">
                                        {lesson.isCompleted ? "Review" : "Start"} Lesson
                                      </Button>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="overview" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">Make <span className="text-eduOrange-500">learning</span> your superpower</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{course.overview}</p>
                        <ul className="space-y-4 mt-6">
                          {course.skills.map((skill, index) => (
                            <li key={index} className="flex items-start">
                              <div className="h-5 w-5 rounded-full bg-eduOrange-100 text-eduOrange-600 dark:bg-eduOrange-900 dark:text-eduOrange-300 flex items-center justify-center mr-2 mt-1">
                                <Check className="h-3 w-3" />
                              </div>
                              <p>{skill}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {course.features.map((feature, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <img src={feature.icon} alt={feature.title} className="h-24 w-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-6">Skills you'll learn</h2>
                    <Card className="bg-orange-50 dark:bg-orange-900/20 border-0">
                      <CardContent className="p-6">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.skills.map((skill, index) => (
                            <li key={index} className="flex items-center">
                              <div className="h-5 w-5 rounded-full bg-eduOrange-100 text-eduOrange-600 dark:bg-eduOrange-900 dark:text-eduOrange-300 flex items-center justify-center mr-3">
                                <Check className="h-3 w-3" />
                              </div>
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right Side - Sidebar */}
          <div className="lg:w-1/3">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">PROGRAM SUPPORTS</h3>
                <h2 className="text-2xl font-bold mb-4">You're in <span className="text-eduOrange-500">good hands</span></h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Get expert support from an academic coach, live chat with experts, and more.
                </p>
                
                <div className="space-y-6">
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-2">Get instant access to answers, anytime</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Get real-time guidance and feedback around the clock, through tools like Live Chat, AI-powered simulations, and tutoring sessions with industry experts.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Bridge learning to career success</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Leverage professional development coaching to align program learnings with your career goals while building self-advocacy and communication skills.
                    </p>
                  </div>
                </div>
                
                <Button className="w-full mt-8 bg-eduOrange-500 hover:bg-eduOrange-600">
                  Start Learning Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailPage;
