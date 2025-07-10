const mongoose = require('mongoose');
const { Types } = require('mongoose');
require('dotenv').config();

// Import models
const Programme = require('./src/models/Programme');
const ProgrammeModule = require('./src/models/ProgrammeModule');
const ProgrammeLesson = require('./src/models/ProgrammeLesson');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Course data structure
const coursesData = [
  {
    title: "Communication Skills",
    slug: "communication-skills",
    description: "Transform your ideas into powerful messages that move people.",
    overview: "In today's interconnected world, effective communication is more than just speaking clearly—it's about connecting, persuading, and inspiring action. Our Communication Skills program builds the essential foundation you need for success in any field.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Dr. Sarah Johnson",
    level: "BEGINNER",
    price: 99,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Basics of Communication",
        description: "Master the core principles that make communication clear, compelling, and effective.",
        lessons: [
          { title: "Communication Models and Principles", duration: 20, type: "text" },
          { title: "Active Listening Techniques", duration: 35, type: "text" },
          { title: "Overcoming Communication Barriers", duration: 15, type: "reading" }
        ]
      },
      {
        title: "Public Speaking Essentials",
        description: "Learn to write clearly and persuasively across various formats and contexts.",
        lessons: [
          { title: "Principles of Clear Writing", duration: 25, type: "text" },
          { title: "Email and Professional Correspondence", duration: 30, type: "text" },
          { title: "Writing Practice Exercise", duration: 45, type: "quiz" }
        ]
      },
      {
        title: "Group Discussions and Debates",
        description: "Build confidence and skills for speaking effectively to any audience.",
        lessons: [
          { title: "Structuring Compelling Presentations", duration: 30, type: "text" },
          { title: "Managing Speech Anxiety", duration: 20, type: "text" },
          { title: "Voice, Body Language, and Delivery", duration: 40, type: "text" }
        ]
      },
      {
        title: "Presentation Skills",
        description: "Navigate the unique challenges and opportunities of communicating in digital spaces.",
        lessons: [
          { title: "Social Media Communication", duration: 25, type: "text" },
          { title: "Virtual Meeting Best Practices", duration: 30, type: "text" },
          { title: "Digital Communication Project", duration: 60, type: "quiz" }
        ]
      },
      {
        title: "Interview Skills Training",
        description: "Master the art of professional interviews and career communication.",
        lessons: [
          { title: "Interview Preparation Strategies", duration: 25, type: "text" },
          { title: "Common Interview Questions", duration: 30, type: "text" },
          { title: "Mock Interview Practice", duration: 60, type: "quiz" }
        ]
      },
      {
        title: "Building Leadership Presence",
        description: "Develop the communication skills needed for leadership roles.",
        lessons: [
          { title: "Leadership Communication Styles", duration: 25, type: "text" },
          { title: "Influencing and Persuasion", duration: 30, type: "text" },
          { title: "Team Communication Dynamics", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    description: "Make decisions like a CEO — with data.",
    overview: "In today's data-driven world, the ability to collect, analyze, and interpret data is an invaluable skill across all industries. Our Data Analytics program equips you with the foundational skills to work with data effectively.",
    category: "DATA_CERTIFICATION",
    instructor: "Prof. Anil Mehta",
    level: "INTERMEDIATE",
    price: 129,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Data Analytics Foundations",
        description: "Understand core concepts and processes in working with data.",
        lessons: [
          { title: "Introduction to Data Thinking", duration: 20, type: "video" },
          { title: "Data Collection & Cleaning", duration: 35, type: "video" },
          { title: "Types of Data Analysis", duration: 25, type: "reading" }
        ]
      },
      {
        title: "Excel & Sheets Mastery",
        description: "Learn essential spreadsheet tools for data manipulation and analysis.",
        lessons: [
          { title: "Spreadsheet Organization & Formatting", duration: 30, type: "video" },
          { title: "Formulas & Functions Deep Dive", duration: 45, type: "video" },
          { title: "Pivot Tables & Data Analysis", duration: 40, type: "video" }
        ]
      },
      {
        title: "Data Visualization",
        description: "Transform data into compelling visual insights.",
        lessons: [
          { title: "Visualization Principles", duration: 25, type: "video" },
          { title: "Chart Types & Best Practices", duration: 35, type: "video" },
          { title: "Creating Dashboards", duration: 40, type: "video" }
        ]
      },
      {
        title: "Introduction to Python for Analysis",
        description: "Begin your journey with programming for advanced data analysis.",
        lessons: [
          { title: "Python Basics for Data", duration: 40, type: "video" },
          { title: "Working with Pandas", duration: 45, type: "video" },
          { title: "Simple Data Projects in Python", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Learn how businesses grow in the real world — and how you can, too.",
    overview: "The Digital Marketing program equips you with the skills to navigate and excel in today's complex online landscape. From social media strategy to data-driven campaigns, you'll gain practical experience that translates directly to real-world results.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Ms. Priya Kapoor",
    level: "ALL_LEVELS",
    price: 119,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Digital Marketing Fundamentals",
        description: "Understand the core concepts and landscape of digital marketing.",
        lessons: [
          { title: "Introduction to Digital Marketing", duration: 25, type: "video" },
          { title: "Customer Journey & Digital Touchpoints", duration: 30, type: "video" },
          { title: "Digital Marketing Strategy Framework", duration: 20, type: "reading" }
        ]
      },
      {
        title: "Social Media Marketing",
        description: "Master strategies for effective marketing across social platforms.",
        lessons: [
          { title: "Platform Selection & Strategy", duration: 35, type: "video" },
          { title: "Content Creation for Social Media", duration: 40, type: "video" },
          { title: "Social Media Campaign Project", duration: 60, type: "quiz" }
        ]
      },
      {
        title: "Content Marketing",
        description: "Learn to create and distribute valuable, relevant content.",
        lessons: [
          { title: "Content Strategy Development", duration: 25, type: "video" },
          { title: "Blogging & Article Writing", duration: 30, type: "video" },
          { title: "Content Distribution Channels", duration: 20, type: "reading" }
        ]
      },
      {
        title: "Performance Marketing",
        description: "Develop data-driven campaigns that deliver measurable results.",
        lessons: [
          { title: "Introduction to Paid Advertising", duration: 30, type: "video" },
          { title: "Campaign Measurement & Analytics", duration: 35, type: "video" },
          { title: "Performance Marketing Project", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Decision-Making Skills",
    slug: "decision-making-skills",
    description: "Learn how top leaders think.",
    overview: "Effective decision-making is perhaps the most valuable skill for success in academics, careers, and life. Our Decision-Making Skills program teaches structured approaches to thinking that enable better choices in any context.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Dr. Rakesh Sinha",
    level: "INTERMEDIATE",
    price: 109,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Critical Thinking Foundations",
        description: "Build the analytical skills to evaluate information effectively.",
        lessons: [
          { title: "Cognitive Biases & Logical Fallacies", duration: 30, type: "video" },
          { title: "Evidence Evaluation", duration: 25, type: "video" },
          { title: "Critical Thinking Exercises", duration: 45, type: "quiz" }
        ]
      },
      {
        title: "Decision Frameworks",
        description: "Learn structured approaches to making different types of decisions.",
        lessons: [
          { title: "Cost-Benefit Analysis", duration: 30, type: "video" },
          { title: "Decision Trees & Expected Value", duration: 35, type: "video" },
          { title: "Multi-criteria Decision Analysis", duration: 40, type: "video" }
        ]
      },
      {
        title: "Problem-Solving Methods",
        description: "Master methodical approaches to tackle complex problems.",
        lessons: [
          { title: "Problem Definition & Framing", duration: 25, type: "video" },
          { title: "Root Cause Analysis", duration: 30, type: "video" },
          { title: "Solution Development & Evaluation", duration: 45, type: "video" }
        ]
      },
      {
        title: "Decision-Making in Practice",
        description: "Apply decision techniques to realistic scenarios.",
        lessons: [
          { title: "Decisions Under Uncertainty", duration: 35, type: "video" },
          { title: "Group Decision Processes", duration: 30, type: "video" },
          { title: "Decision Simulation Scenarios", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Basics of AI",
    slug: "basics-of-ai",
    description: "AI is not just the future — it's your future.",
    overview: "Artificial Intelligence is transforming every industry, from healthcare to entertainment. Our Basics of AI program provides a solid foundation in AI concepts, applications, and implications without requiring advanced technical skills.",
    category: "AI_CERTIFICATE",
    instructor: "Dr. Meera Iyer",
    level: "BEGINNER",
    price: 139,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Introduction to Artificial Intelligence",
        description: "Understand what AI is, its history, and how it's changing our world.",
        lessons: [
          { title: "What is Artificial Intelligence?", duration: 20, type: "video" },
          { title: "Brief History of AI Development", duration: 25, type: "video" },
          { title: "AI vs. Machine Learning vs. Deep Learning", duration: 30, type: "reading" }
        ]
      },
      {
        title: "How AI Works",
        description: "Learn the basic principles behind AI technologies in simple terms.",
        lessons: [
          { title: "Machine Learning Fundamentals", duration: 35, type: "video" },
          { title: "Neural Networks Simplified", duration: 30, type: "video" },
          { title: "How AI Makes Decisions", duration: 25, type: "reading" }
        ]
      },
      {
        title: "AI in Real Life",
        description: "Explore how AI is being used across different industries today.",
        lessons: [
          { title: "AI in Healthcare", duration: 25, type: "video" },
          { title: "AI in Business and Finance", duration: 30, type: "video" },
          { title: "AI in Entertainment and Creativity", duration: 25, type: "video" }
        ]
      },
      {
        title: "Ethics and Future of AI",
        description: "Consider the ethical implications and future directions of AI technology.",
        lessons: [
          { title: "Ethical Considerations in AI", duration: 30, type: "video" },
          { title: "Bias in AI Systems", duration: 25, type: "reading" },
          { title: "The Future of AI and Society", duration: 40, type: "video" }
        ]
      }
    ]
  },
  {
    title: "BioSkills",
    slug: "bioskills",
    description: "Get beyond textbooks. Build industry-relevant biology skills.",
    overview: "The BioSkills program bridges the gap between academic biology knowledge and practical, industry-relevant applications. Instead of focusing solely on memorization, we emphasize applied skills that prepare you for real-world roles.",
    category: "TECHNICAL_SKILLS",
    instructor: "Dr. Kavita Rao",
    level: "ALL_LEVELS",
    price: 129,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Applied Cellular Biology",
        description: "Understand cellular processes through practical applications.",
        lessons: [
          { title: "Cellular Structure & Function in Practice", duration: 30, type: "video" },
          { title: "Cell Communication Case Studies", duration: 25, type: "video" },
          { title: "Virtual Cell Imaging Lab", duration: 45, type: "video" }
        ]
      },
      {
        title: "Practical Genetics & Genomics",
        description: "Explore the applications of genetic knowledge in modern biosciences.",
        lessons: [
          { title: "Genetic Technologies in Practice", duration: 35, type: "video" },
          { title: "Genomics Data Interpretation", duration: 40, type: "video" },
          { title: "Genetic Testing Case Analysis", duration: 30, type: "reading" }
        ]
      },
      {
        title: "Biotechnology Applications",
        description: "Discover how biological knowledge is applied in industry.",
        lessons: [
          { title: "Pharmaceutical Development Process", duration: 30, type: "video" },
          { title: "Agricultural Biotechnology", duration: 25, type: "video" },
          { title: "Biomanufacturing Technologies", duration: 30, type: "reading" }
        ]
      },
      {
        title: "Biological Research Skills",
        description: "Develop fundamental skills for biological investigation.",
        lessons: [
          { title: "Experimental Design", duration: 35, type: "video" },
          { title: "Scientific Literature Analysis", duration: 30, type: "video" },
          { title: "Research Project Simulation", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Don't just use ChatGPT — command it like a pro.",
    overview: "AI language models like ChatGPT are powerful tools, but their effectiveness depends largely on how you communicate with them. Our AI Prompt Crafting program teaches you to write prompts that get consistently better results.",
    category: "AI_CERTIFICATE",
    instructor: "Ms. Ananya Singh",
    level: "ALL_LEVELS",
    price: 119,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Foundations of Prompt Engineering",
        description: "Learn the principles that make AI prompts effective.",
        lessons: [
          { title: "How AI Language Models Work", duration: 20, type: "video" },
          { title: "Clarity, Context, and Constraints", duration: 25, type: "video" },
          { title: "Common Prompt Pitfalls", duration: 15, type: "reading" }
        ]
      },
      {
        title: "Practical Prompt Patterns",
        description: "Master proven structures for different types of AI tasks.",
        lessons: [
          { title: "Role and Format Specification", duration: 30, type: "video" },
          { title: "Step-by-Step Instruction Patterns", duration: 25, type: "video" },
          { title: "Prompt Pattern Practice", duration: 40, type: "quiz" }
        ]
      },
      {
        title: "Creative & Academic Applications",
        description: "Apply prompt engineering to specific use cases.",
        lessons: [
          { title: "AI for Creative Writing & Brainstorming", duration: 35, type: "video" },
          { title: "Research, Citation & Fact-Checking", duration: 30, type: "video" },
          { title: "Academic Project Support", duration: 25, type: "reading" }
        ]
      },
      {
        title: "Advanced Techniques & Ethics",
        description: "Explore sophisticated prompt methods and responsible AI use.",
        lessons: [
          { title: "Chain-of-Thought & Self-Reflection", duration: 30, type: "video" },
          { title: "Ethical AI Interaction & Bias Mitigation", duration: 25, type: "video" },
          { title: "Advanced Prompt Engineering Project", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Mathematics",
    slug: "mathematics",
    description: "Master mathematical concepts through practical applications.",
    overview: "Our Mathematics program goes beyond traditional textbook learning to focus on practical applications and real-world problem-solving. You'll develop the mathematical thinking skills needed for success in any field.",
    category: "TECHNICAL_SKILLS",
    instructor: "Prof. Rajeev Menon",
    level: "ALL_LEVELS",
    price: 99,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Applied Mathematics Fundamentals",
        description: "Build a strong foundation in mathematical thinking and problem-solving.",
        lessons: [
          { title: "Mathematical Modeling Basics", duration: 30, type: "video" },
          { title: "Real-World Problem Solving", duration: 35, type: "video" },
          { title: "Mathematical Thinking Exercises", duration: 25, type: "reading" }
        ]
      },
      {
        title: "Advanced Problem-Solving Techniques",
        description: "Master sophisticated approaches to complex mathematical challenges.",
        lessons: [
          { title: "Problem Decomposition Strategies", duration: 30, type: "video" },
          { title: "Pattern Recognition in Mathematics", duration: 25, type: "video" },
          { title: "Advanced Problem-Solving Practice", duration: 45, type: "quiz" }
        ]
      },
      {
        title: "Mathematical Modeling",
        description: "Learn to create mathematical models for real-world phenomena.",
        lessons: [
          { title: "Modeling Principles and Methods", duration: 35, type: "video" },
          { title: "Statistical Modeling Applications", duration: 30, type: "video" },
          { title: "Model Validation and Testing", duration: 40, type: "video" }
        ]
      },
      {
        title: "Mathematics in Technology",
        description: "Explore how mathematics powers modern technology and innovation.",
        lessons: [
          { title: "Mathematics in Computer Science", duration: 30, type: "video" },
          { title: "Mathematical Applications in AI", duration: 35, type: "video" },
          { title: "Technology Project with Math", duration: 60, type: "quiz" }
        ]
      }
    ]
  },
  {
    title: "Job Search Program",
    slug: "job-search-program",
    description: "Your step-by-step guide to land internships & jobs.",
    overview: "The Job Search Program provides comprehensive guidance for students seeking internships and entry-level positions. From resume building to interview preparation, you'll develop the skills needed to stand out in today's competitive job market.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Ms. Ritu Sharma",
    level: "BEGINNER",
    price: 89,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "Resume & LinkedIn Building",
        description: "Create professional profiles that stand out to recruiters.",
        lessons: [
          { title: "Resume Writing Fundamentals", duration: 30, type: "video" },
          { title: "LinkedIn Profile Optimization", duration: 25, type: "video" },
          { title: "Portfolio Development", duration: 35, type: "reading" }
        ]
      },
      {
        title: "Interview Preparation",
        description: "Master interview techniques and strategies for success.",
        lessons: [
          { title: "Interview Types and Formats", duration: 25, type: "video" },
          { title: "Common Interview Questions", duration: 30, type: "video" },
          { title: "Mock Interview Practice", duration: 45, type: "quiz" }
        ]
      },
      {
        title: "Networking and Job Search Strategy",
        description: "Develop effective strategies for finding and securing opportunities.",
        lessons: [
          { title: "Professional Networking Techniques", duration: 30, type: "video" },
          { title: "Job Search Platforms and Tools", duration: 25, type: "video" },
          { title: "Follow-up and Follow-through", duration: 20, type: "reading" }
        ]
      },
      {
        title: "Freelancing and Entrepreneurship",
        description: "Learn how to start and build a freelancing career while studying.",
        lessons: [
          { title: "Freelancing Fundamentals", duration: 35, type: "video" },
          { title: "Building Your Personal Brand", duration: 30, type: "video" },
          { title: "Freelancing Project Planning", duration: 60, type: "quiz" }
        ]
      }
    ]
  }
];

// Seeding function
const seedCourses = async () => {
  try {
    console.log('Starting to seed courses...');
    
    // Clear existing data
    await Programme.deleteMany({});
    await ProgrammeModule.deleteMany({});
    await ProgrammeLesson.deleteMany({});
    console.log('Cleared existing data');

    for (const courseData of coursesData) {
      console.log(`Creating course: ${courseData.title}`);
      
      // Create course
      const course = new Programme({
        _id: new Types.ObjectId(),
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        overview: courseData.overview,
        category: courseData.category,
        instructor: courseData.instructor,
        level: courseData.level,
        price: courseData.price,
        currency: courseData.currency,
        isActive: courseData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await course.save();
      console.log(`Created course: ${course.title} with ID: ${course._id}`);

      // Create modules for this course
      for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
        const moduleData = courseData.modules[moduleIndex];
        console.log(`Creating module: ${moduleData.title}`);
        
        const module = new ProgrammeModule({
          _id: new Types.ObjectId(),
          programmeId: course._id,
          title: moduleData.title,
          description: moduleData.description,
          order: moduleIndex + 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await module.save();
        console.log(`Created module: ${module.title} with ID: ${module._id}`);

        // Create lessons for this module
        for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
          const lessonData = moduleData.lessons[lessonIndex];
          console.log(`Creating lesson: ${lessonData.title}`);
          
          const lesson = new ProgrammeLesson({
            _id: new Types.ObjectId(),
            programmeId: course._id,
            moduleId: module._id,
            title: lessonData.title,
            description: `Learn about ${lessonData.title.toLowerCase()}`,
            content: `This lesson covers ${lessonData.title.toLowerCase()}.`,
            duration: lessonData.duration,
            type: lessonData.type,
            order: lessonIndex + 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await lesson.save();
          console.log(`Created lesson: ${lesson.title} with ID: ${lesson._id}`);
        }
      }
    }

    console.log('✅ All courses, modules, and lessons seeded successfully!');
    
    // Summary
    const courseCount = await Programme.countDocuments();
    const moduleCount = await ProgrammeModule.countDocuments();
    const lessonCount = await ProgrammeLesson.countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`Courses created: ${courseCount}`);
    console.log(`Modules created: ${moduleCount}`);
    console.log(`Lessons created: ${lessonCount}`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(() => {
    seedCourses();
  });
}

module.exports = { seedCourses }; 