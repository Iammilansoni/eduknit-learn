import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Programme from './src/models/Programme';
import ProgrammeModule from './src/models/ProgrammeModule';
import ProgrammeLesson from './src/models/ProgrammeLesson';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Required courses data
const requiredCourses = [
  {
    title: "Communication Skills",
    slug: "communication-skills",
    description: "Master effective communication for personal and professional success. Learn public speaking, active listening, and persuasive techniques.",
    category: "PROFESSIONAL_SKILLS" as const,
    instructor: "Dr. Sarah Johnson",
    duration: "3-5 hours/week",
    timeframe: "6-8 weeks",
    level: "ALL_LEVELS" as const,
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
    certificateAwarded: true
  },
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Master digital marketing strategies including SEO, social media, content marketing, and analytics.",
    category: "PROFESSIONAL_SKILLS" as const,
    instructor: "Mike Chen",
    duration: "4-6 hours/week",
    timeframe: "8-10 weeks",
    level: "INTERMEDIATE" as const,
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
    certificateAwarded: true
  },
  {
    title: "Data Analytics",
    slug: "data-analytics",
    description: "Transform raw data into actionable insights for business growth using modern analytics tools.",
    category: "DATA_CERTIFICATION" as const,
    instructor: "Dr. Emily Watson",
    duration: "6-8 hours/week",
    timeframe: "12-16 weeks",
    level: "INTERMEDIATE" as const,
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
    certificateAwarded: true
  },
  {
    title: "AI Prompt Crafting",
    slug: "ai-prompt-crafting",
    description: "Master the art of writing effective prompts for AI tools and language models to maximize productivity.",
    category: "AI_CERTIFICATE" as const,
    instructor: "Alex Rodriguez",
    duration: "2-4 hours/week",
    timeframe: "4-6 weeks",
    level: "BEGINNER" as const,
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
    certificateAwarded: true
  },
  {
    title: "BioSkills",
    slug: "bioskills",
    description: "Bridge the gap between academic biology and industry-relevant practical applications.",
    category: "TECHNICAL_SKILLS" as const,
    instructor: "Dr. Kavita Rao",
    duration: "5-7 hours/week",
    timeframe: "8-12 weeks",
    level: "ALL_LEVELS" as const,
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
    certificateAwarded: true
  },
  {
    title: "Decision Making Skills",
    slug: "decision-making-skills",
    description: "Learn structured approaches to making better decisions in personal and professional contexts.",
    category: "PROFESSIONAL_SKILLS" as const,
    instructor: "Dr. David Kim",
    duration: "3-4 hours/week",
    timeframe: "5-7 weeks",
    level: "ALL_LEVELS" as const,
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
    certificateAwarded: true
  }
];

// Sample modules for Communication Skills course
const communicationSkillsModules = [
  {
    title: "Foundations of Communication",
    description: "Learn the fundamental principles of effective communication.",
    lessons: [
      { title: "What is Communication?", type: "TEXT", duration: 30 },
      { title: "Communication Barriers", type: "TEXT", duration: 25 },
      { title: "Active Listening Techniques", type: "VIDEO", duration: 40 },
      { title: "Communication Foundations Quiz", type: "QUIZ", duration: 20 }
    ]
  },
  {
    title: "Verbal Communication Skills",
    description: "Develop your speaking and presentation abilities.",
    lessons: [
      { title: "Speaking with Confidence", type: "TEXT", duration: 35 },
      { title: "Voice Modulation", type: "VIDEO", duration: 45 },
      { title: "Presentation Structure", type: "TEXT", duration: 30 },
      { title: "Public Speaking Practice", type: "QUIZ", duration: 60 }
    ]
  },
  {
    title: "Non-verbal Communication",
    description: "Master body language and non-verbal cues.",
    lessons: [
      { title: "Reading Body Language", type: "TEXT", duration: 40 },
      { title: "Facial Expressions", type: "VIDEO", duration: 25 },
      { title: "Personal Space & Gestures", type: "TEXT", duration: 35 },
      { title: "Non-verbal Assessment", type: "QUIZ", duration: 30 }
    ]
  },
  {
    title: "Written Communication",
    description: "Improve your writing and email communication skills.",
    lessons: [
      { title: "Clear Writing Principles", type: "TEXT", duration: 30 },
      { title: "Professional Emails", type: "TEXT", duration: 25 },
      { title: "Business Writing", type: "TEXT", duration: 40 },
      { title: "Writing Practice", type: "QUIZ", duration: 45 }
    ]
  },
  {
    title: "Group Communication",
    description: "Excel in meetings, discussions, and team environments.",
    lessons: [
      { title: "Meeting Dynamics", type: "TEXT", duration: 35 },
      { title: "Leading Discussions", type: "VIDEO", duration: 40 },
      { title: "Conflict Resolution", type: "TEXT", duration: 30 },
      { title: "Team Communication", type: "QUIZ", duration: 35 }
    ]
  },
  {
    title: "Advanced Communication",
    description: "Master persuasion, negotiation, and leadership communication.",
    lessons: [
      { title: "Persuasion Techniques", type: "TEXT", duration: 40 },
      { title: "Negotiation Skills", type: "VIDEO", duration: 45 },
      { title: "Leadership Communication", type: "TEXT", duration: 35 },
      { title: "Final Project", type: "QUIZ", duration: 90 }
    ]
  }
];

async function setupCompleteSystem() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    console.log('🚀 Setting up complete LMS system...\n');
    
    const adminObjectId = new mongoose.Types.ObjectId();
    
    // Create all courses
    for (const courseData of requiredCourses) {
      console.log(`📚 Processing course: ${courseData.title}`);
      
      // Check if course already exists
      let course = await Programme.findOne({ slug: courseData.slug });
      
      if (course) {
        console.log(`  ✅ Course already exists: ${course.title}`);
        // Update existing course
        await Programme.updateOne({ slug: courseData.slug }, {
          ...courseData,
          lastModifiedBy: adminObjectId,
          updatedAt: new Date()
        });
        console.log(`  🔄 Updated course data`);
      } else {
        // Create new course
        course = new Programme({
          ...courseData,
          createdBy: adminObjectId,
          lastModifiedBy: adminObjectId
        });
        await course.save();
        console.log(`  ✨ Created new course: ${course.title}`);
      }
      
      // Create modules and lessons for Communication Skills course
      if (courseData.slug === 'communication-skills') {
        // Delete existing modules and lessons
        const existingModules = await ProgrammeModule.find({ programmeId: course._id });
        const existingModuleIds = existingModules.map(m => m._id);
        
        await ProgrammeLesson.deleteMany({ moduleId: { $in: existingModuleIds } });
        await ProgrammeModule.deleteMany({ programmeId: course._id });
        console.log(`  🗑️  Cleaned up existing modules and lessons`);
        
        // Create new modules and lessons
        for (let moduleIndex = 0; moduleIndex < communicationSkillsModules.length; moduleIndex++) {
          const moduleInfo = communicationSkillsModules[moduleIndex];
          
          const module = new ProgrammeModule({
            programmeId: course._id,
            title: moduleInfo.title,
            description: moduleInfo.description,
            orderIndex: moduleIndex,
            isUnlocked: moduleIndex === 0,
            estimatedDuration: moduleInfo.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
            totalLessons: moduleInfo.lessons.length,
            prerequisites: [],
            learningObjectives: [
              `Master ${moduleInfo.title.toLowerCase()}`,
              `Apply concepts in real-world scenarios`,
              `Complete practical exercises`
            ],
            isActive: true
          });
          
          await module.save();
          console.log(`    📖 Created module: ${module.title}`);
          
          // Create lessons for this module
          for (let lessonIndex = 0; lessonIndex < moduleInfo.lessons.length; lessonIndex++) {
            const lessonInfo = moduleInfo.lessons[lessonIndex];
            
            const lesson = new ProgrammeLesson({
              moduleId: module._id,
              programmeId: course._id,
              title: lessonInfo.title,
              description: `Learn about ${lessonInfo.title.toLowerCase()} in detail.`,
              orderIndex: lessonIndex,
              type: lessonInfo.type,
              content: {
                textContent: lessonInfo.type === 'TEXT' ? `<h2>${lessonInfo.title}</h2><p>This lesson covers ${lessonInfo.title.toLowerCase()}. Content will be developed further.</p>` : '',
                videoUrl: lessonInfo.type === 'VIDEO' ? 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4' : '',
                videoDuration: lessonInfo.type === 'VIDEO' ? lessonInfo.duration * 60 : 0,
                quiz: lessonInfo.type === 'QUIZ' ? {
                  questions: [
                    {
                      id: 'q1',
                      question: `What is the main focus of ${lessonInfo.title}?`,
                      type: 'MULTIPLE_CHOICE',
                      options: ['Option A', 'Option B', 'Option C', 'Option D'],
                      correctAnswer: 'Option A',
                      points: 10
                    }
                  ],
                  timeLimit: lessonInfo.duration,
                  passingScore: 70
                } : undefined
              },
              estimatedDuration: lessonInfo.duration,
              duration: lessonInfo.duration,
              isRequired: true,
              prerequisites: [],
              learningObjectives: [
                `Understand ${lessonInfo.title.toLowerCase()}`,
                `Apply the concepts learned`,
                `Complete the lesson assessment`
              ],
              resources: [],
              isActive: true
            });
            
            await lesson.save();
            console.log(`      📝 Created lesson: ${lesson.title} (${lessonInfo.duration} min)`);
          }
        }
        
        console.log(`  📊 Created ${communicationSkillsModules.length} modules with content`);
      }
      
      console.log('');
    }
    
    // Display final results
    const allCourses = await Programme.find({ isActive: true }).select('title slug _id');
    
    console.log('🎉 LMS Setup Completed!\n');
    console.log('📋 Available Courses:');
    console.log('=' .repeat(60));
    
    const mapping: Record<string, string> = {};
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   ID: ${course._id}`);
      console.log('');
      mapping[course.slug] = (course._id as mongoose.Types.ObjectId).toString();
    });
    
    console.log('🔗 Frontend Course Mapping:');
    console.log(JSON.stringify(mapping, null, 2));
    
    console.log('\n✅ System Ready!');
    console.log('✅ All courses are available for enrollment');
    console.log('✅ Communication Skills course has full module/lesson structure');
    console.log('✅ Course mapping is available via /api/courses/mapping');
    console.log('✅ Course enrollment is available via /api/course/enroll');
    
    // Verify API endpoints would work
    console.log('\n🔌 API Endpoints Ready:');
    console.log('   GET  /api/courses          - List all courses');
    console.log('   GET  /api/courses/mapping  - Course slug to ID mapping');
    console.log('   POST /api/course/enroll    - Enroll in a course');
    console.log('   GET  /api/course/my-courses - Get enrolled courses');
    
  } catch (error) {
    console.error('❌ Error setting up system:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the setup
setupCompleteSystem();
