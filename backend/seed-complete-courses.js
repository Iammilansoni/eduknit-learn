const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Programme = require('./src/models/Programme');
const ProgrammeModule = require('./src/models/ProgrammeModule');
const ProgrammeLesson = require('./src/models/ProgrammeLesson');

// Course data with proper slugs and rich content
const courses = [
  {
    title: "Communication Skills",
    slug: "communication-skills",
    description: "Speak smart. Think sharp. Lead with confidence.",
    overview: "Master the art of effective communication through practical exercises, real-world scenarios, and expert guidance. Develop confidence in public speaking, writing, and digital communication.",
    category: "PROFESSIONAL_SKILLS",
    level: "BEGINNER",
    instructor: "Dr. Sarah Johnson",
    duration: "6 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Public Speaking", "Active Listening", "Presentation Skills", "Digital Communication"],
    prerequisites: ["Basic English proficiency"],
    totalModules: 6,
    totalLessons: 18,
    estimatedDuration: 1440, // 24 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    isActive: true
  },
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Learn how businesses grow in the real world — and how you can, too.",
    overview: "Master digital marketing strategies including social media, SEO, content marketing, and analytics. Learn to create effective campaigns and measure their success.",
    category: "PROFESSIONAL_SKILLS",
    level: "INTERMEDIATE",
    instructor: "Mike Chen",
    duration: "8 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Social Media Marketing", "SEO", "Content Marketing", "Analytics"],
    prerequisites: ["Basic computer skills"],
    totalModules: 8,
    totalLessons: 24,
    estimatedDuration: 1920, // 32 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    isActive: true
  },
  {
    title: "Basics of AI",
    slug: "basics-of-ai",
    description: "AI is not just the future — it's your future.",
    overview: "Understand artificial intelligence fundamentals, machine learning concepts, and practical applications. Learn to use AI tools effectively in your daily life and career.",
    category: "AI_CERTIFICATE",
    level: "BEGINNER",
    instructor: "Dr. Alex Rodriguez",
    duration: "10 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Machine Learning", "AI Ethics", "Practical AI Tools", "Data Analysis"],
    prerequisites: ["Basic mathematics"],
    totalModules: 10,
    totalLessons: 30,
    estimatedDuration: 2400, // 40 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    isActive: true
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Don't just use ChatGPT — command it like a pro.",
    overview: "Master the art of prompt engineering to get the best results from AI tools. Learn advanced techniques for different AI applications and use cases.",
    category: "AI_CERTIFICATE",
    level: "INTERMEDIATE",
    instructor: "Lisa Wang",
    duration: "6 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Prompt Engineering", "AI Tools", "Creative Writing", "Problem Solving"],
    prerequisites: ["Basic AI knowledge"],
    totalModules: 6,
    totalLessons: 18,
    estimatedDuration: 1440, // 24 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1676299251950-8d9d7f9c8b8b?w=800",
    isActive: true
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    description: "Make decisions like a CEO — with data.",
    overview: "Learn to analyze data, create visualizations, and make data-driven decisions. Master Excel, Google Sheets, and basic Python for data analysis.",
    category: "DATA_CERTIFICATION",
    level: "INTERMEDIATE",
    instructor: "David Kim",
    duration: "12 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Excel", "Data Visualization", "Python", "Statistical Analysis"],
    prerequisites: ["Basic mathematics"],
    totalModules: 12,
    totalLessons: 36,
    estimatedDuration: 2880, // 48 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    isActive: true
  },
  {
    title: "BioSkills",
    slug: "bioskills",
    description: "Get beyond textbooks. Build industry-relevant biology skills.",
    overview: "Apply biological concepts to real-world problems. Learn case-based approaches and explore career paths in biosciences.",
    category: "PROFESSIONAL_SKILLS",
    level: "INTERMEDIATE",
    instructor: "Dr. Emily Brown",
    duration: "8 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Applied Biology", "Case Analysis", "Research Methods", "Lab Techniques"],
    prerequisites: ["High school biology"],
    totalModules: 8,
    totalLessons: 24,
    estimatedDuration: 1920, // 32 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f7?w=800",
    isActive: true
  },
  {
    title: "Decision-Making Skills",
    slug: "decision-making",
    description: "Learn how top leaders think.",
    overview: "Develop critical thinking and problem-solving skills through real-life decision simulations. Learn frameworks used by successful leaders.",
    category: "PROFESSIONAL_SKILLS",
    level: "BEGINNER",
    instructor: "Prof. Robert Wilson",
    duration: "6 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Critical Thinking", "Problem Solving", "Decision Frameworks", "Leadership"],
    prerequisites: ["None"],
    totalModules: 6,
    totalLessons: 18,
    estimatedDuration: 1440, // 24 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    isActive: true
  },
  {
    title: "Mathematics",
    slug: "mathematics",
    description: "Your step-by-step guide to solve your queries.",
    overview: "Master mathematical concepts through practical applications and problem-solving techniques. Build a strong foundation for advanced studies.",
    category: "PROFESSIONAL_SKILLS",
    level: "BEGINNER",
    instructor: "Dr. Maria Garcia",
    duration: "10 weeks",
    timeframe: "Self-paced",
    price: 0,
    currency: "USD",
    skills: ["Algebra", "Calculus", "Statistics", "Problem Solving"],
    prerequisites: ["Basic arithmetic"],
    totalModules: 10,
    totalLessons: 30,
    estimatedDuration: 2400, // 40 hours in minutes
    certificateAwarded: true,
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    isActive: true
  }
];

// Rich content templates for lessons
const createRichContent = (type, title, content, metadata = {}) => {
  return {
    id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    content,
    metadata
  };
};

// Module and lesson data for Communication Skills
const communicationSkillsModules = [
  {
    title: "Basics of Communication",
    description: "Master the core principles that make communication clear, compelling, and effective.",
    orderIndex: 1,
    estimatedDuration: 120,
    learningObjectives: ["Understand communication models", "Practice active listening", "Overcome communication barriers"],
    lessons: [
      {
        title: "Communication Models and Principles",
        description: "Learn the fundamental models of communication and how they apply to real-world scenarios.",
        orderIndex: 1,
        estimatedDuration: 20,
        type: "TEXT",
        content: {
          richContent: [
            createRichContent("text", "Introduction", "<h2>Welcome to Communication Fundamentals</h2><p>Communication is the foundation of all human interaction. In this lesson, we'll explore the basic models and principles that govern effective communication.</p>"),
            createRichContent("image", "Communication Model", "", { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600", alt: "Communication process diagram" }),
            createRichContent("text", "Key Principles", "<h3>Core Communication Principles</h3><ul><li><strong>Clarity:</strong> Be clear and concise in your message</li><li><strong>Active Listening:</strong> Pay full attention to the speaker</li><li><strong>Feedback:</strong> Provide and seek feedback</li><li><strong>Context:</strong> Consider the situation and audience</li></ul>"),
            createRichContent("video", "Communication in Action", "", { url: "https://player.vimeo.com/external/377669055.hd.mp4?s=dc0d6e7e0b4486595c50073257e9514b86b56376", duration: 180, controls: true })
          ]
        }
      },
      {
        title: "Active Listening Techniques",
        description: "Develop the skills to listen actively and respond appropriately.",
        orderIndex: 2,
        estimatedDuration: 35,
        type: "TEXT",
        content: {
          richContent: [
            createRichContent("text", "What is Active Listening?", "<h2>Active Listening: Beyond Hearing</h2><p>Active listening involves fully concentrating, understanding, responding, and remembering what is being said. It's not just about hearing words, but understanding the complete message.</p>"),
            createRichContent("text", "Techniques", "<h3>Active Listening Techniques</h3><ol><li><strong>Pay Attention:</strong> Give the speaker your undivided attention</li><li><strong>Show You're Listening:</strong> Use body language and verbal cues</li><li><strong>Provide Feedback:</strong> Reflect on what has been said</li><li><strong>Defer Judgment:</strong> Allow the speaker to finish</li><li><strong>Respond Appropriately:</strong> Be honest and respectful in your response</li></ol>"),
            createRichContent("interactive", "Practice Exercise", "Complete this interactive exercise to practice active listening techniques.", { type: "exercise", duration: 300 })
          ]
        }
      }
    ]
  },
  {
    title: "Public Speaking Essentials",
    description: "Learn to write clearly and persuasively across various formats and contexts.",
    orderIndex: 2,
    estimatedDuration: 150,
    learningObjectives: ["Structure compelling presentations", "Manage speech anxiety", "Use effective body language"],
    lessons: [
      {
        title: "Structuring Compelling Presentations",
        description: "Learn how to organize your thoughts into a clear, engaging presentation structure.",
        orderIndex: 1,
        estimatedDuration: 30,
        type: "TEXT",
        content: {
          richContent: [
            createRichContent("text", "Presentation Structure", "<h2>The Three-Part Structure</h2><p>Every effective presentation follows a clear structure: Introduction, Body, and Conclusion. Let's explore each part in detail.</p>"),
            createRichContent("text", "Introduction", "<h3>Hook Your Audience</h3><p>The introduction should:</p><ul><li>Grab attention with a hook</li><li>Establish credibility</li><li>Preview main points</li><li>Set expectations</li></ul>"),
            createRichContent("video", "Presentation Example", "", { url: "https://player.vimeo.com/external/377669055.hd.mp4?s=dc0d6e7e0b4486595c50073257e9514b86b56376", duration: 240, controls: true })
          ]
        }
      }
    ]
  }
];

// Function to create modules and lessons for a course
const createCourseModules = async (programmeId, modulesData) => {
  for (const moduleData of modulesData) {
    const module = new ProgrammeModule({
      programmeId,
      title: moduleData.title,
      description: moduleData.description,
      orderIndex: moduleData.orderIndex,
      estimatedDuration: moduleData.estimatedDuration,
      learningObjectives: moduleData.learningObjectives,
      isActive: true
    });
    
    const savedModule = await module.save();
    console.log(`Created module: ${moduleData.title}`);

    // Create lessons for this module
    for (const lessonData of moduleData.lessons) {
      const lesson = new ProgrammeLesson({
        programmeId,
        moduleId: savedModule._id,
        title: lessonData.title,
        description: lessonData.description,
        orderIndex: lessonData.orderIndex,
        estimatedDuration: lessonData.estimatedDuration,
        type: lessonData.type,
        content: lessonData.content,
        learningObjectives: lessonData.learningObjectives || [],
        resources: lessonData.resources || [],
        isRequired: true,
        isActive: true
      });
      
      await lesson.save();
      console.log(`  Created lesson: ${lessonData.title}`);
    }
  }
};

// Main seeding function
const seedCourses = async () => {
  try {
    console.log('Starting course seeding...');

    // Clear existing courses
    await Programme.deleteMany({});
    await ProgrammeModule.deleteMany({});
    await ProgrammeLesson.deleteMany({});
    console.log('Cleared existing courses');

    // Create courses
    for (const courseData of courses) {
      const course = new Programme(courseData);
      const savedCourse = await course.save();
      console.log(`Created course: ${courseData.title} (${courseData.slug})`);

      // Create modules and lessons for Communication Skills
      if (courseData.slug === 'communication-skills') {
        await createCourseModules(savedCourse._id, communicationSkillsModules);
      } else {
        // Create basic modules for other courses
        const basicModules = [
          {
            title: "Introduction",
            description: "Get started with the fundamentals",
            orderIndex: 1,
            estimatedDuration: 60,
            learningObjectives: ["Understand course objectives", "Set up your learning environment"],
            lessons: [
              {
                title: "Welcome to the Course",
                description: "Introduction and course overview",
                orderIndex: 1,
                estimatedDuration: 30,
                type: "TEXT",
                content: {
                  richContent: [
                    createRichContent("text", "Welcome", `<h2>Welcome to ${courseData.title}</h2><p>This course will help you develop essential skills in ${courseData.title.toLowerCase()}. Let's get started!</p>`),
                    createRichContent("text", "Course Overview", `<h3>What You'll Learn</h3><ul>${courseData.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>`)
                  ]
                }
              }
            ]
          }
        ];
        await createCourseModules(savedCourse._id, basicModules);
      }
    }

    console.log('Course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seeding
seedCourses(); 