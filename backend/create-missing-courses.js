const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Schema
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

// Required courses data
const requiredCourses = [
  {
    title: "Communication Skills",
    slug: "communication-skills",
    description: "Develop effective communication skills for personal and professional success.",
    category: "Personal Development",
    instructor: "John Doe",
    duration: "6 weeks",
    timeframe: "Self-paced",
    level: "Beginner",
    price: 199,
    currency: "USD",
    overview: "Learn to communicate clearly and confidently in any situation.",
    skills: ["Public Speaking", "Active Listening", "Nonverbal Communication", "Presentation Skills", "Feedback"],
    prerequisites: ["None"],
    isActive: true,
    totalModules: 6,
    totalLessons: 24,
    estimatedDuration: 30,
    durationDays: 42,
    certificateAwarded: true
  },
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Master the fundamentals of digital marketing including SEO, social media, and content marketing.",
    category: "Marketing",
    instructor: "Sarah Johnson",
    duration: "8 weeks",
    timeframe: "Self-paced",
    level: "Beginner",
    price: 299,
    currency: "USD",
    overview: "Learn digital marketing strategies to grow your business online.",
    skills: ["SEO", "Social Media Marketing", "Content Marketing", "Email Marketing", "Analytics"],
    prerequisites: ["Basic computer skills", "Internet access"],
    isActive: true,
    totalModules: 8,
    totalLessons: 32,
    estimatedDuration: 40,
    durationDays: 56,
    certificateAwarded: true
  },
  {
    title: "Basics of AI",
    slug: "basics-of-ai",
    description: "Introduction to artificial intelligence concepts and applications.",
    category: "Technology",
    instructor: "Dr. Michael Chen",
    duration: "6 weeks",
    timeframe: "Self-paced",
    level: "Beginner",
    price: 399,
    currency: "USD",
    overview: "Understand AI fundamentals and real-world applications.",
    skills: ["Machine Learning", "Neural Networks", "Data Processing", "AI Ethics", "Python Basics"],
    prerequisites: ["Basic programming knowledge", "High school mathematics"],
    isActive: true,
    totalModules: 6,
    totalLessons: 24,
    estimatedDuration: 30,
    durationDays: 42,
    certificateAwarded: true
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Learn to create effective prompts for AI tools and language models.",
    category: "Technology",
    instructor: "Alex Rodriguez",
    duration: "4 weeks",
    timeframe: "Self-paced",
    level: "Intermediate",
    price: 199,
    currency: "USD",
    overview: "Master the art of writing prompts that get the best results from AI.",
    skills: ["Prompt Engineering", "AI Tools", "Creative Writing", "Problem Solving", "Critical Thinking"],
    prerequisites: ["Basic computer skills", "Familiarity with AI tools"],
    isActive: true,
    totalModules: 4,
    totalLessons: 16,
    estimatedDuration: 20,
    durationDays: 28,
    certificateAwarded: true
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    description: "Learn to analyze data and make data-driven decisions.",
    category: "Business",
    instructor: "Emily Watson",
    duration: "10 weeks",
    timeframe: "Self-paced",
    level: "Intermediate",
    price: 449,
    currency: "USD",
    overview: "Transform raw data into actionable insights for business growth.",
    skills: ["Data Visualization", "Statistical Analysis", "Excel", "SQL", "Business Intelligence"],
    prerequisites: ["Basic Excel knowledge", "High school mathematics"],
    isActive: true,
    totalModules: 10,
    totalLessons: 40,
    estimatedDuration: 50,
    durationDays: 70,
    certificateAwarded: true
  },
  {
    title: "BioSkills",
    slug: "bioskills",
    description: "Develop essential life skills for personal and professional success.",
    category: "Personal Development",
    instructor: "Lisa Thompson",
    duration: "6 weeks",
    timeframe: "Self-paced",
    level: "All Levels",
    price: 149,
    currency: "USD",
    overview: "Build resilience, adaptability, and essential life skills.",
    skills: ["Resilience", "Adaptability", "Emotional Intelligence", "Stress Management", "Goal Setting"],
    prerequisites: ["None"],
    isActive: true,
    totalModules: 6,
    totalLessons: 24,
    estimatedDuration: 25,
    durationDays: 42,
    certificateAwarded: true
  },
  {
    title: "Decision Making",
    slug: "decision-making",
    description: "Master the art of making better decisions in personal and professional life.",
    category: "Business",
    instructor: "David Kim",
    duration: "5 weeks",
    timeframe: "Self-paced",
    level: "All Levels",
    price: 179,
    currency: "USD",
    overview: "Learn systematic approaches to decision making and problem solving.",
    skills: ["Critical Thinking", "Problem Solving", "Risk Assessment", "Strategic Planning", "Leadership"],
    prerequisites: ["None"],
    isActive: true,
    totalModules: 5,
    totalLessons: 20,
    estimatedDuration: 22,
    durationDays: 35,
    certificateAwarded: true
  }
];

async function upsertCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const courseData of requiredCourses) {
      const slug = courseData.slug;
      const update = { ...courseData, isActive: true, slug };
      const result = await Programme.findOneAndUpdate(
        { slug },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result) {
        console.log(`✅ Upserted: ${result.title} (${result.slug}) [${result._id}]`);
      } else {
        console.log(`❌ Failed to upsert: ${courseData.title}`);
      }
    }

    // Print all active courses
    const allCourses = await Programme.find({ isActive: true });
    console.log('\n=== All Active Courses in DB ===');
    allCourses.forEach(course => {
      console.log(`- ${course.title} (${course.slug}) [${course._id}]`);
    });

    // Print mapping for frontend
    const mapping = {};
    allCourses.forEach(course => {
      mapping[course.slug] = course._id.toString();
    });
    console.log('\n=== Slug to ID Mapping ===');
    console.log(JSON.stringify(mapping, null, 2));

  } catch (error) {
    console.error('❌ Error upserting courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

upsertCourses(); 