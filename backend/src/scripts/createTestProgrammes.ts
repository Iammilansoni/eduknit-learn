import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Programme from '../models/Programme';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

const testProgrammes = [
  {
    title: 'Communication Skills',
    description: 'Speak with confidence! Build communication skills through group discussions, debates, presentations, and real practice with peers and coaches — made for Class 11th & 12th students.',
    category: 'PROFESSIONAL_SKILLS',
    instructor: 'Dr. Sarah Johnson',
    duration: '3-5 hours/week',
    timeframe: '1-2 months',
    level: 'BEGINNER',
    price: 99,
    currency: 'USD',
    overview: 'Master the art of effective communication through practical exercises, real-world scenarios, and peer feedback. This comprehensive program covers public speaking, interpersonal communication, and presentation skills.',
    skills: ['Public Speaking', 'Active Listening', 'Presentation Skills', 'Interpersonal Communication', 'Leadership Communication'],
    prerequisites: ['Basic English proficiency', 'Willingness to participate in group activities'],
    isActive: true,
    totalModules: 4,
    totalLessons: 24,
    estimatedDuration: 40,
    durationDays: 60,
    certificateAwarded: true
  },
  {
    title: 'Digital Marketing Fundamentals',
    description: 'Learn the essentials of digital marketing including SEO, social media marketing, content creation, and analytics.',
    category: 'PROFESSIONAL_SKILLS',
    instructor: 'Mike Chen',
    duration: '4-6 hours/week',
    timeframe: '2-3 months',
    level: 'INTERMEDIATE',
    price: 149,
    currency: 'USD',
    overview: 'Comprehensive digital marketing course covering all major platforms and strategies used in modern marketing campaigns.',
    skills: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Google Analytics', 'Email Marketing'],
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
    description: 'Introduction to AI concepts, machine learning fundamentals, and practical applications in everyday technology.',
    category: 'AI_CERTIFICATE',
    instructor: 'Dr. Emily Rodriguez',
    duration: '5-7 hours/week',
    timeframe: '3-4 months',
    level: 'BEGINNER',
    price: 199,
    currency: 'USD',
    overview: 'Learn the fundamentals of AI and machine learning through hands-on projects and real-world applications.',
    skills: ['Machine Learning', 'Python Programming', 'Data Analysis', 'Neural Networks', 'AI Ethics'],
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
    description: 'Master the art of writing effective prompts for AI tools like ChatGPT, Claude, and other language models.',
    category: 'AI_CERTIFICATE',
    instructor: 'Alex Thompson',
    duration: '3-4 hours/week',
    timeframe: '1-2 months',
    level: 'ALL_LEVELS',
    price: 79,
    currency: 'USD',
    overview: 'Learn to communicate effectively with AI tools to get better results and improve productivity.',
    skills: ['Prompt Engineering', 'AI Communication', 'Creative Writing', 'Problem Solving', 'AI Tools'],
    prerequisites: ['Basic computer skills', 'Access to AI tools'],
    isActive: true,
    totalModules: 4,
    totalLessons: 20,
    estimatedDuration: 30,
    durationDays: 45,
    certificateAwarded: true
  },
  {
    title: 'Data Analytics for Beginners',
    description: 'Learn to analyze data, create visualizations, and make data-driven decisions using modern tools.',
    category: 'DATA_CERTIFICATION',
    instructor: 'Lisa Wang',
    duration: '4-5 hours/week',
    timeframe: '2-3 months',
    level: 'BEGINNER',
    price: 129,
    currency: 'USD',
    overview: 'Comprehensive introduction to data analytics with practical projects and real-world datasets.',
    skills: ['Data Analysis', 'Excel', 'SQL', 'Data Visualization', 'Statistical Analysis'],
    prerequisites: ['Basic computer skills', 'High school mathematics'],
    isActive: true,
    totalModules: 5,
    totalLessons: 30,
    estimatedDuration: 50,
    durationDays: 75,
    certificateAwarded: true
  },
  {
    title: 'Bioskills for Life Sciences',
    description: 'Essential laboratory skills and techniques for students pursuing careers in life sciences and biotechnology.',
    category: 'TECHNICAL_SKILLS',
    instructor: 'Dr. James Wilson',
    duration: '6-8 hours/week',
    timeframe: '3-4 months',
    level: 'INTERMEDIATE',
    price: 179,
    currency: 'USD',
    overview: 'Hands-on laboratory training covering essential techniques used in modern biological research.',
    skills: ['Laboratory Techniques', 'Microscopy', 'PCR', 'Cell Culture', 'Data Analysis'],
    prerequisites: ['High school biology', 'Basic chemistry knowledge'],
    isActive: true,
    totalModules: 7,
    totalLessons: 42,
    estimatedDuration: 70,
    durationDays: 105,
    certificateAwarded: true
  },
  {
    title: 'Decision Making and Problem Solving',
    description: 'Develop critical thinking skills and learn systematic approaches to complex decision-making scenarios.',
    category: 'PROFESSIONAL_SKILLS',
    instructor: 'Dr. Maria Garcia',
    duration: '3-4 hours/week',
    timeframe: '1-2 months',
    level: 'ALL_LEVELS',
    price: 89,
    currency: 'USD',
    overview: 'Learn frameworks and techniques for making better decisions in personal and professional contexts.',
    skills: ['Critical Thinking', 'Problem Solving', 'Decision Frameworks', 'Risk Assessment', 'Strategic Planning'],
    prerequisites: ['No prerequisites required'],
    isActive: true,
    totalModules: 4,
    totalLessons: 24,
    estimatedDuration: 35,
    durationDays: 52,
    certificateAwarded: true
  }
];

async function createTestProgrammes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get an admin user to use as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Creating test programmes...');

    const createdProgrammes = [];

    for (const programmeData of testProgrammes) {
      // Check if programme already exists
      const existingProgramme = await Programme.findOne({ title: programmeData.title });
      
      if (existingProgramme) {
        console.log(`Programme "${programmeData.title}" already exists with ID: ${existingProgramme._id}`);
        createdProgrammes.push({
          title: programmeData.title,
          id: existingProgramme._id,
          slug: programmeData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        });
        continue;
      }

      // Create new programme
      const programme = new Programme({
        ...programmeData,
        createdBy: adminUser._id,
        lastModifiedBy: adminUser._id
      });

      await programme.save();
      
      const slug = programmeData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      console.log(`Created programme: "${programmeData.title}" with ID: ${programme._id}`);
      createdProgrammes.push({
        title: programmeData.title,
        id: programme._id,
        slug
      });
    }

    console.log('\n=== Test Programmes Created ===');
    console.log('Update your frontend courseSlugToId mapping with these IDs:\n');
    
    createdProgrammes.forEach(programme => {
      console.log(`'${programme.slug}': '${programme.id}', // ${programme.title}`);
    });

    console.log('\n=== Frontend Mapping ===');
    console.log('const courseSlugToId: Record<string, string> = {');
    createdProgrammes.forEach(programme => {
      console.log(`  '${programme.slug}': '${programme.id}',`);
    });
    console.log('};');

    console.log('\nTest programmes created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating test programmes:', error);
    process.exit(1);
  }
}

createTestProgrammes(); 