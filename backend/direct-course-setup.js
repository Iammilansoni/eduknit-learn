const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/eduknit-learn';

const communicationSkillsCourse = {
  title: "Communication Skills",
  slug: "communication-skills",
  description: "Master effective communication for personal and professional success. Learn public speaking, active listening, and persuasive techniques.",
  category: "PROFESSIONAL_SKILLS",
  instructor: "Dr. Sarah Johnson",
  duration: "3-5 hours/week",
  timeframe: "6-8 weeks",
  level: "ALL_LEVELS",
  price: 99,
  currency: "USD",
  imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  overview: "Master the art of effective communication through practical exercises, real-world scenarios, and expert guidance.",
  skills: ["Public Speaking", "Active Listening", "Presentation Skills", "Interpersonal Communication", "Conflict Resolution"],
  prerequisites: ["Basic English proficiency", "Willingness to participate in group activities"],
  isActive: true,
  totalModules: 6,
  totalLessons: 24,
  estimatedDuration: 40,
  durationDays: 56,
  certificateAwarded: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const allRequiredCourses = [
  communicationSkillsCourse,
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Master digital marketing strategies including SEO, social media, content marketing, and analytics.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Mike Chen",
    duration: "4-6 hours/week",
    timeframe: "8-10 weeks",
    level: "INTERMEDIATE",
    price: 149,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    overview: "Comprehensive digital marketing course covering all major platforms and strategies to grow your business online.",
    skills: ["SEO", "Social Media Marketing", "Content Marketing", "Google Analytics", "Email Marketing"],
    prerequisites: ["Basic computer skills", "Understanding of business concepts"],
    isActive: true,
    totalModules: 8,
    totalLessons: 32,
    estimatedDuration: 60,
    durationDays: 70,
    certificateAwarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    description: "Transform raw data into actionable insights for business growth using modern analytics tools.",
    category: "DATA_CERTIFICATION",
    instructor: "Dr. Emily Watson",
    duration: "6-8 hours/week",
    timeframe: "12-16 weeks",
    level: "INTERMEDIATE",
    price: 449,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    overview: "Learn to analyze data and make data-driven decisions using statistical methods and visualization tools.",
    skills: ["Data Visualization", "Statistical Analysis", "Excel", "SQL", "Business Intelligence"],
    prerequisites: ["Basic Excel knowledge", "High school mathematics"],
    isActive: true,
    totalModules: 10,
    totalLessons: 40,
    estimatedDuration: 80,
    durationDays: 112,
    certificateAwarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Master the art of writing effective prompts for AI tools and language models to maximize productivity.",
    category: "AI_CERTIFICATE",
    instructor: "Alex Rodriguez",
    duration: "2-4 hours/week",
    timeframe: "4-6 weeks",
    level: "BEGINNER",
    price: 199,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
    overview: "Learn to create effective prompts that get the best results from AI tools and language models.",
    skills: ["Prompt Engineering", "AI Tools", "Creative Writing", "Problem Solving", "Critical Thinking"],
    prerequisites: ["Basic computer skills", "Familiarity with AI tools helpful"],
    isActive: true,
    totalModules: 4,
    totalLessons: 16,
    estimatedDuration: 20,
    durationDays: 28,
    certificateAwarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "BioSkills",
    slug: "bioskills",
    description: "Bridge the gap between academic biology and industry-relevant practical applications.",
    category: "TECHNICAL_SKILLS",
    instructor: "Dr. Kavita Rao",
    duration: "5-7 hours/week",
    timeframe: "8-12 weeks",
    level: "ALL_LEVELS",
    price: 129,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80",
    overview: "Get beyond textbooks and build industry-relevant biology skills through practical applications.",
    skills: ["Laboratory Techniques", "Microscopy", "Data Analysis", "Scientific Writing", "Research Methods"],
    prerequisites: ["Basic biology knowledge", "High school science"],
    isActive: true,
    totalModules: 8,
    totalLessons: 32,
    estimatedDuration: 50,
    durationDays: 84,
    certificateAwarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Decision Making Skills",
    slug: "decision-making-skills",
    description: "Learn structured approaches to making better decisions in personal and professional contexts.",
    category: "PROFESSIONAL_SKILLS",
    instructor: "Dr. David Kim",
    duration: "3-4 hours/week",
    timeframe: "5-7 weeks",
    level: "ALL_LEVELS",
    price: 179,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80",
    overview: "Master the art of making better decisions using systematic approaches and critical thinking frameworks.",
    skills: ["Critical Thinking", "Problem Solving", "Risk Assessment", "Strategic Planning", "Leadership"],
    prerequisites: ["None"],
    isActive: true,
    totalModules: 5,
    totalLessons: 20,
    estimatedDuration: 25,
    durationDays: 35,
    certificateAwarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function setupCourses() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eduknit-learn');
    const collection = db.collection('programmes');
    
    console.log('🧹 Clearing existing courses...');
    await collection.deleteMany({});
    
    console.log('📚 Inserting courses...');
    const result = await collection.insertMany(allRequiredCourses);
    console.log(`✅ Inserted ${result.insertedCount} courses`);
    
    // Display the courses with their IDs
    const insertedCourses = await collection.find({}).toArray();
    console.log('\n📋 Courses created:');
    const mapping = {};
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.slug}) - ID: ${course._id}`);
      mapping[course.slug] = course._id.toString();
    });
    
    console.log('\n🔗 Course Mapping:');
    console.log(JSON.stringify(mapping, null, 2));
    
    console.log('\n✅ All courses successfully created!');
    console.log('✅ Communication Skills course is now available!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔚 Database connection closed');
  }
}

setupCourses();
