const mongoose = require('mongoose');
const { Types } = require('mongoose');
require('dotenv').config();

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

// Define schemas directly in JavaScript
const programmeSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  category: String,
  instructor: String,
  duration: String,
  timeframe: String,
  level: String,
  price: Number,
  currency: String,
  imageUrl: String,
  overview: String,
  skills: [String],
  prerequisites: [String],
  isActive: Boolean,
  totalModules: Number,
  totalLessons: Number,
  estimatedDuration: Number,
  durationDays: Number,
  certificateAwarded: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const moduleSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  title: String,
  description: String,
  order: Number,
  estimatedDuration: Number,
  learningObjectives: [String],
  prerequisites: [String],
  isActive: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgrammeModule', required: true },
  title: String,
  description: String,
  content: String,
  duration: Number,
  type: String,
  order: Number,
  isActive: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Programme = mongoose.model('Programme', programmeSchema);
const ProgrammeModule = mongoose.model('ProgrammeModule', moduleSchema);
const ProgrammeLesson = mongoose.model('ProgrammeLesson', lessonSchema);

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
          { title: "Digital Marketing Strategy Framework", duration: 35, type: "reading" }
        ]
      },
      {
        title: "Social Media Marketing",
        description: "Build brand presence and engage audiences across social platforms.",
        lessons: [
          { title: "Platform Selection & Strategy", duration: 30, type: "video" },
          { title: "Content Creation for Social Media", duration: 35, type: "video" },
          { title: "Community Management", duration: 25, type: "video" }
        ]
      },
      {
        title: "Content Marketing",
        description: "Create content that attracts, engages, and converts your audience.",
        lessons: [
          { title: "Content Strategy Development", duration: 30, type: "video" },
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
    description: "The future belongs to those who understand AI.",
    overview: "Artificial Intelligence is transforming every industry, and understanding its capabilities and limitations is essential for staying relevant in any field. Our Basics of AI program provides a practical, accessible introduction to AI concepts.",
    category: "AI_CERTIFICATE",
    instructor: "Dr. Priya Sharma",
    level: "BEGINNER",
    price: 149,
    currency: "USD",
    isActive: true,
    modules: [
      {
        title: "AI Fundamentals",
        description: "Understand what AI is, how it works, and its current capabilities.",
        lessons: [
          { title: "What is Artificial Intelligence?", duration: 25, type: "video" },
          { title: "Types of AI and Machine Learning", duration: 30, type: "video" },
          { title: "AI vs Human Intelligence", duration: 20, type: "reading" }
        ]
      },
      {
        title: "AI Tools & Applications",
        description: "Explore practical AI tools and their real-world applications.",
        lessons: [
          { title: "AI in Everyday Life", duration: 25, type: "video" },
          { title: "Popular AI Tools & Platforms", duration: 35, type: "video" },
          { title: "Hands-on with AI Tools", duration: 45, type: "video" }
        ]
      },
      {
        title: "AI in Industries",
        description: "Discover how different sectors are leveraging AI for innovation.",
        lessons: [
          { title: "AI in Healthcare & Medicine", duration: 30, type: "video" },
          { title: "AI in Business & Finance", duration: 30, type: "video" },
          { title: "AI in Entertainment & Creativity", duration: 25, type: "video" }
        ]
      },
      {
        title: "Ethics and Future of AI",
        description: "Examine the ethical considerations and future implications of AI.",
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
          { title: "Biotech Research Methods", duration: 35, type: "video" },
          { title: "Industry Case Studies", duration: 40, type: "reading" }
        ]
      },
      {
        title: "Laboratory Skills & Techniques",
        description: "Develop practical laboratory and research skills.",
        lessons: [
          { title: "Essential Lab Techniques", duration: 45, type: "video" },
          { title: "Data Collection & Analysis", duration: 35, type: "video" },
          { title: "Virtual Lab Simulations", duration: 60, type: "video" }
        ]
      }
    ]
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Write prompts that get AI to work for you.",
    overview: "As AI tools become increasingly powerful, the ability to communicate effectively with them through well-crafted prompts becomes a critical skill. Our AI Prompt Crafting program teaches you to harness the full potential of AI.",
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
          { title: "Few-Shot Learning Prompts", duration: 35, type: "video" }
        ]
      },
      {
        title: "Advanced Prompt Techniques",
        description: "Explore sophisticated strategies for complex AI interactions.",
        lessons: [
          { title: "Chain-of-Thought Prompting", duration: 30, type: "video" },
          { title: "Prompt Chaining & Workflows", duration: 35, type: "video" },
          { title: "Debugging and Optimizing Prompts", duration: 25, type: "reading" }
        ]
      },
      {
        title: "Prompt Applications Across Domains",
        description: "Apply prompt crafting skills to various professional contexts.",
        lessons: [
          { title: "Content Creation & Marketing", duration: 30, type: "video" },
          { title: "Research & Analysis", duration: 25, type: "video" },
          { title: "Creative Writing & Ideation", duration: 35, type: "video" }
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
        title: "Statistics & Probability",
        description: "Learn to work with data and understand uncertainty in practical contexts.",
        lessons: [
          { title: "Descriptive Statistics in Practice", duration: 30, type: "video" },
          { title: "Probability for Decision Making", duration: 35, type: "video" },
          { title: "Statistical Analysis Projects", duration: 45, type: "quiz" }
        ]
      },
      {
        title: "Financial Mathematics",
        description: "Apply mathematical concepts to personal and business finance.",
        lessons: [
          { title: "Interest, Loans, and Investments", duration: 35, type: "video" },
          { title: "Risk Assessment & Portfolio Analysis", duration: 30, type: "video" },
          { title: "Financial Planning Scenarios", duration: 40, type: "quiz" }
        ]
      },
      {
        title: "Mathematics in Technology",
        description: "Explore how mathematics drives innovation in technology and AI.",
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
    
    // Clear existing data for fresh start
    console.log('Clearing existing data...');
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
        totalModules: courseData.modules.length,
        totalLessons: courseData.modules.reduce((sum, module) => sum + module.lessons.length, 0),
        estimatedDuration: courseData.modules.reduce((sum, module) => 
          sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0), 0) / 60, // Convert to hours
        durationDays: 30, // Default
        certificateAwarded: true,
        skills: courseData.skills || [],
        prerequisites: courseData.prerequisites || [],
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
          estimatedDuration: moduleData.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
          learningObjectives: [
            `Master the key concepts of ${moduleData.title}`,
            `Apply learned skills in practical scenarios`,
            `Complete all module exercises and assessments`
          ],
          prerequisites: moduleIndex > 0 ? ['Completion of previous modules'] : [],
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
            content: `This lesson covers ${lessonData.title.toLowerCase()}. You'll explore key concepts, practical applications, and hands-on exercises to master this topic.`,
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

    console.log('\n✅ Successfully seeded all courses with modules and lessons!');
    
    // Verify the data
    const totalCourses = await Programme.countDocuments();
    const totalModules = await ProgrammeModule.countDocuments();
    const totalLessons = await ProgrammeLesson.countDocuments();
    
    console.log(`\n📊 Summary:`);
    console.log(`Total Courses: ${totalCourses}`);
    console.log(`Total Modules: ${totalModules}`);
    console.log(`Total Lessons: ${totalLessons}`);
    
    // List all courses
    const allCourses = await Programme.find({}).select('title slug category');
    console.log('\n📚 All Courses:');
    allCourses.forEach(course => {
      console.log(`- ${course.title} (${course.slug}) [${course.category}]`);
    });

  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Connect to database and run seeding
connectDB().then(() => {
  seedCourses().then(() => {
    console.log('Seeding completed');
    process.exit(0);
  });
}).catch(error => {
  console.error('Failed to seed courses:', error);
  process.exit(1);
});
