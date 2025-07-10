const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Schema with slug
const programmeSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, required: true },
  description: String,
  category: String,
  instructor: String,
  duration: String,
  timeframe: String,
  level: String,
  price: Number,
  currency: String,
  overview: String,
  skills: [String],
  prerequisites: [String],
  isActive: Boolean,
  totalModules: Number,
  totalLessons: Number,
  estimatedDuration: Number,
  durationDays: Number,
  certificateAwarded: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Programme = mongoose.model('Programme', programmeSchema);

// Function to generate slug from title
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const testProgrammes = [
  {
    title: 'Digital Marketing Fundamentals',
    slug: 'digital-marketing-fundamentals',
    description: 'Learn the essentials of digital marketing including SEO, social media marketing, content creation, and analytics.',
    category: 'PROFESSIONAL_SKILLS',
    instructor: 'Mike Chen',
    duration: '4-6 hours/week',
    timeframe: '2-3 months',
    level: 'INTERMEDIATE',
    price: 149,
    currency: 'USD',
    overview: 'Comprehensive digital marketing course covering all major platforms and strategies.',
    skills: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Google Analytics'],
    prerequisites: ['Basic computer skills', 'Understanding of business concepts'],
    isActive: true,
    totalModules: 6,
    totalLessons: 36,
    estimatedDuration: 60,
    durationDays: 90,
    certificateAwarded: true
  },
  {
    title: 'Basics of Artificial Intelligence',
    slug: 'basics-of-artificial-intelligence',
    description: 'Introduction to AI concepts, machine learning fundamentals, and practical applications.',
    category: 'AI_CERTIFICATE',
    instructor: 'Dr. Emily Rodriguez',
    duration: '5-7 hours/week',
    timeframe: '3-4 months',
    level: 'BEGINNER',
    price: 199,
    currency: 'USD',
    overview: 'Learn the fundamentals of AI and machine learning through hands-on projects.',
    skills: ['Machine Learning', 'Python Programming', 'Data Analysis', 'Neural Networks'],
    prerequisites: ['Basic mathematics', 'No programming experience required'],
    isActive: true,
    totalModules: 8,
    totalLessons: 48,
    estimatedDuration: 80,
    durationDays: 120,
    certificateAwarded: true
  },
  {
    title: 'AI Prompt Crafting',
    slug: 'ai-prompt-crafting',
    description: 'Master the art of writing effective prompts for AI tools like ChatGPT, Claude, and other language models.',
    category: 'AI_CERTIFICATE',
    instructor: 'Alex Thompson',
    duration: '3-4 hours/week',
    timeframe: '1-2 months',
    level: 'ALL_LEVELS',
    price: 79,
    currency: 'USD',
    overview: 'Learn advanced prompt engineering techniques to maximize AI tool effectiveness.',
    skills: ['Prompt Engineering', 'AI Tools', 'Content Generation', 'Critical Thinking'],
    prerequisites: ['Basic computer skills', 'Familiarity with AI tools helpful'],
    isActive: true,
    totalModules: 4,
    totalLessons: 20,
    estimatedDuration: 30,
    durationDays: 45,
    certificateAwarded: true
  },
  {
    title: 'Data Science for Beginners',
    slug: 'data-science-for-beginners',
    description: 'Introduction to data science concepts, tools, and techniques for analyzing and interpreting data.',
    category: 'DATA_CERTIFICATION',
    instructor: 'Dr. Maria Santos',
    duration: '6-8 hours/week',
    timeframe: '3-4 months',
    level: 'BEGINNER',
    price: 179,
    currency: 'USD',
    overview: 'Comprehensive introduction to data science with hands-on projects and real-world applications.',
    skills: ['Python', 'Data Analysis', 'Statistics', 'Data Visualization'],
    prerequisites: ['Basic mathematics', 'No programming experience required'],
    isActive: true,
    totalModules: 8,
    totalLessons: 52,
    estimatedDuration: 100,
    durationDays: 120,
    certificateAwarded: true
  },
  {
    title: 'Python Programming Mastery',
    slug: 'python-programming-mastery',
    description: 'Complete Python programming course from basics to advanced concepts including web development and data science.',
    category: 'TECHNICAL_SKILLS',
    instructor: 'James Wilson',
    duration: '5-7 hours/week',
    timeframe: '4-6 months',
    level: 'INTERMEDIATE',
    price: 229,
    currency: 'USD',
    overview: 'Master Python programming with real-world projects and comprehensive coverage of the language.',
    skills: ['Python', 'Object-Oriented Programming', 'Web Development', 'Data Structures'],
    prerequisites: ['Basic programming knowledge', 'Computer science fundamentals'],
    isActive: true,
    totalModules: 10,
    totalLessons: 65,
    estimatedDuration: 150,
    durationDays: 180,
    certificateAwarded: true
  },
  {
    title: 'Project Management Essentials',
    slug: 'project-management-essentials',
    description: 'Learn project management methodologies, tools, and best practices for successful project delivery.',
    category: 'PROFESSIONAL_SKILLS',
    instructor: 'Lisa Chang',
    duration: '4-5 hours/week',
    timeframe: '2-3 months',
    level: 'INTERMEDIATE',
    price: 159,
    currency: 'USD',
    overview: 'Comprehensive project management course covering Agile, Scrum, and traditional methodologies.',
    skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership'],
    prerequisites: ['Work experience', 'Basic understanding of business processes'],
    isActive: true,
    totalModules: 6,
    totalLessons: 42,
    estimatedDuration: 70,
    durationDays: 90,
    certificateAwarded: true
  }
];

async function createTestProgrammes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');
    
    // First, check existing courses
    const existingCourses = await Programme.find({});
    console.log(`Existing courses: ${existingCourses.length}`);
    
    // Create each programme
    for (const programme of testProgrammes) {
      try {
        const existing = await Programme.findOne({ slug: programme.slug });
        if (existing) {
          console.log(`Course already exists: ${programme.title}`);
          continue;
        }
        
        const newProgramme = new Programme(programme);
        await newProgramme.save();
        console.log(`Created: ${programme.title}`);
      } catch (error) {
        console.error(`Error creating ${programme.title}:`, error.message);
      }
    }
    
    // Check final count
    const finalCount = await Programme.countDocuments({});
    console.log(`\nTotal courses after creation: ${finalCount}`);
    
    // List all courses
    const allCourses = await Programme.find({}).select('title category isActive');
    console.log('\n=== All Courses ===');
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category}) - Active: ${course.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestProgrammes();
