const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schemas directly to avoid compilation issues
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  isEmailVerified: { type: Boolean, default: true },
  enrollmentStatus: { type: String, default: 'active' },
  loginAttempts: { type: Number, default: 0 },
  refreshTokens: [String],
  verificationMessageSeen: { type: Boolean, default: false },
  profileVisibility: { type: String, default: 'PUBLIC' }
}, { timestamps: true });

const programmeSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  level: String,
  duration: Number,
  price: Number,
  currency: String,
  language: String,
  learningObjectives: [String],
  prerequisites: [String],
  isActive: { type: Boolean, default: true },
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  estimatedDuration: Number,
  learningObjectives: [String],
  prerequisites: [String],
  isActive: { type: Boolean, default: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  order: Number,
  estimatedDuration: Number,
  lessonType: { type: String, enum: ['TEXT', 'VIDEO', 'QUIZ', 'INTERACTIVE'], default: 'TEXT' },
  isActive: { type: Boolean, default: true },
  hasQuiz: { type: Boolean, default: false },
  allowNotes: { type: Boolean, default: true },
  allowBookmarks: { type: Boolean, default: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgrammeModule' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Programme = mongoose.model('Programme', programmeSchema);
const ProgrammeModule = mongoose.model('ProgrammeModule', moduleSchema);
const ProgrammeLesson = mongoose.model('ProgrammeLesson', lessonSchema);

// Database connection
mongoose.connect('mongodb://localhost:27017/eduknit-learn');

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find admin user to set as creator
    let adminUser = await User.findOne({ email: 'admin@eduknit.com' });
    console.log('Looking for admin user...');
    console.log('Found admin user:', adminUser ? 'YES' : 'NO');
    
    if (!adminUser) {
      // Try to find any admin user
      const anyAdmin = await User.findOne({ role: 'admin' });
      console.log('Looking for any admin user...');
      console.log('Found any admin user:', anyAdmin ? 'YES' : 'NO');
      
      if (anyAdmin) {
        console.log('Using admin user:', anyAdmin.email);
        adminUser = anyAdmin;
      } else {
        // Use the first user in the database as fallback
        const firstUser = await User.findOne({});
        if (firstUser) {
          console.log('Using first user as creator:', firstUser.email);
          adminUser = firstUser;
        } else {
          console.log('No users found in database!');
          process.exit(1);
        }
      }
    }

    // Course data with modules and lessons
    const coursesData = [
      {
        title: 'Communication Skills',
        modules: [
          {
            title: 'Basics of Communication',
            description: 'Fundamental principles and models of effective communication',
            lessons: [
              'Communication Models and Principles',
              'Active Listening Techniques',
              'Overcoming Communication Barriers'
            ]
          },
          {
            title: 'Public Speaking Essentials',
            description: 'Core skills for effective public speaking and presentation',
            lessons: [
              'Principles of Clear Writing',
              'Email and Professional Correspondence',
              'Writing Practice Exercise'
            ]
          },
          {
            title: 'Group Discussions and Debates',
            description: 'Skills for effective group communication and debates',
            lessons: [
              'Structuring Compelling Presentations',
              'Managing Speech Anxiety',
              'Voice, Body Language, and Delivery'
            ]
          },
          {
            title: 'Presentation Skills',
            description: 'Advanced presentation and delivery techniques',
            lessons: [
              'Social Media Communication',
              'Virtual Meeting Best Practices',
              'Digital Communication Project'
            ]
          },
          {
            title: 'Interview Skills Training',
            description: 'Professional interview preparation and communication',
            lessons: [
              'Building Leadership Presence',
              'Professional Communication Ethics',
              'Interview Practice Sessions'
            ]
          }
        ]
      },
      {
        title: 'Data Analytics for Beginners',
        modules: [
          {
            title: 'Data Analytics Foundations',
            description: 'Introduction to data thinking and analysis concepts',
            lessons: [
              'Introduction to Data Thinking',
              'Data Collection & Cleaning',
              'Types of Data Analysis'
            ]
          },
          {
            title: 'Excel & Sheets Mastery',
            description: 'Advanced spreadsheet skills for data analysis',
            lessons: [
              'Spreadsheet Organization & Formatting',
              'Formulas & Functions Deep Dive',
              'Pivot Tables & Data Analysis'
            ]
          },
          {
            title: 'Data Visualization',
            description: 'Creating effective charts and dashboards',
            lessons: [
              'Visualization Principles',
              'Chart Types & Best Practices',
              'Creating Dashboards'
            ]
          },
          {
            title: 'Introduction to Python for Analysis',
            description: 'Python programming basics for data analysis',
            lessons: [
              'Python Basics for Data',
              'Working with Pandas',
              'Simple Data Projects in Python'
            ]
          }
        ]
      },
      {
        title: 'Digital Marketing Fundamentals',
        modules: [
          {
            title: 'Digital Marketing Fundamentals',
            description: 'Core concepts and strategies in digital marketing',
            lessons: [
              'Introduction to Digital Marketing',
              'Customer Journey & Digital Touchpoints',
              'Digital Marketing Strategy Framework'
            ]
          },
          {
            title: 'Social Media Marketing',
            description: 'Effective social media marketing strategies',
            lessons: [
              'Platform Selection & Strategy',
              'Content Creation for Social Media',
              'Social Media Campaign Project'
            ]
          },
          {
            title: 'Content Marketing',
            description: 'Creating and distributing valuable content',
            lessons: [
              'Content Strategy Development',
              'Blogging & Article Writing',
              'Content Distribution Channels'
            ]
          },
          {
            title: 'Performance Marketing',
            description: 'Measuring and optimizing marketing performance',
            lessons: [
              'Introduction to Paid Advertising',
              'Campaign Measurement & Analytics',
              'Performance Marketing Project'
            ]
          }
        ]
      },
      {
        title: 'Decision Making and Problem Solving',
        modules: [
          {
            title: 'Critical Thinking Foundations',
            description: 'Building strong critical thinking abilities',
            lessons: [
              'Cognitive Biases & Logical Fallacies',
              'Evidence Evaluation',
              'Critical Thinking Exercises'
            ]
          },
          {
            title: 'Decision Frameworks',
            description: 'Structured approaches to decision making',
            lessons: [
              'Cost-Benefit Analysis',
              'Decision Trees & Expected Value',
              'Multi-criteria Decision Analysis'
            ]
          },
          {
            title: 'Problem-Solving Methods',
            description: 'Systematic problem-solving techniques',
            lessons: [
              'Problem Definition & Framing',
              'Root Cause Analysis',
              'Solution Development & Evaluation'
            ]
          },
          {
            title: 'Decision-Making in Practice',
            description: 'Real-world decision making scenarios',
            lessons: [
              'Decisions Under Uncertainty',
              'Group Decision Processes',
              'Decision Simulation Scenarios'
            ]
          }
        ]
      },
      {
        title: 'Basics of Artificial Intelligence',
        modules: [
          {
            title: 'Introduction to Artificial Intelligence',
            description: 'Understanding AI fundamentals and concepts',
            lessons: [
              'What is Artificial Intelligence?',
              'Brief History of AI Development',
              'AI vs. Machine Learning vs. Deep Learning'
            ]
          },
          {
            title: 'How AI Works',
            description: 'Technical foundations of AI systems',
            lessons: [
              'Machine Learning Fundamentals',
              'Neural Networks Simplified',
              'How AI Makes Decisions'
            ]
          },
          {
            title: 'AI in Real Life',
            description: 'Practical applications of AI across industries',
            lessons: [
              'AI in Healthcare',
              'AI in Business and Finance',
              'AI in Entertainment and Creativity'
            ]
          },
          {
            title: 'Ethics and Future of AI',
            description: 'Ethical considerations and future implications',
            lessons: [
              'Ethical Considerations in AI',
              'Bias in AI Systems',
              'The Future of AI and Society'
            ]
          }
        ]
      }
    ];

    console.log('Creating modules and lessons for courses...');

    for (const courseData of coursesData) {
      // Find the course
      const course = await Programme.findOne({ title: courseData.title });
      if (!course) {
        console.log(`❌ Course '${courseData.title}' not found, skipping...`);
        continue;
      }

      console.log(`\n📚 Processing course: ${courseData.title}`);

      // Create modules for this course
      let moduleOrder = 1;
      for (const moduleData of courseData.modules) {
        console.log(`  📖 Creating module: ${moduleData.title}`);

        // Create the module
        const module = new ProgrammeModule({
          title: moduleData.title,
          description: moduleData.description,
          order: moduleOrder++,
          estimatedDuration: 120, // 2 hours default
          learningObjectives: [
            `Understand the fundamentals of ${moduleData.title.toLowerCase()}`,
            `Apply concepts learned in real-world scenarios`,
            `Complete practical exercises and assessments`
          ],
          prerequisites: moduleOrder > 2 ? ['Basic understanding of previous modules'] : [],
          isActive: true,
          courseId: course._id,
          createdBy: adminUser._id,
          lastModifiedBy: adminUser._id
        });

        const savedModule = await module.save();
        console.log(`    ✅ Module created: ${savedModule.title}`);

        // Create lessons for this module
        let lessonOrder = 1;
        for (const lessonTitle of moduleData.lessons) {
          console.log(`    📝 Creating lesson: ${lessonTitle}`);

          const lesson = new ProgrammeLesson({
            title: lessonTitle,
            description: `Learn about ${lessonTitle.toLowerCase()} and apply the concepts through practical exercises.`,
            content: `# ${lessonTitle}

## Introduction
This lesson covers the essential concepts of ${lessonTitle.toLowerCase()}. You will learn the key principles and practical applications.

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the core concepts of ${lessonTitle.toLowerCase()}
- Apply these concepts in practical scenarios
- Identify best practices and common challenges

## Key Topics
- Fundamental principles
- Practical applications
- Real-world examples
- Best practices
- Common challenges and solutions

## Activities
- Interactive exercises
- Case study analysis
- Practical assignments
- Discussion forums

## Summary
This lesson provides a comprehensive foundation in ${lessonTitle.toLowerCase()} that will serve as a building block for more advanced topics.`,
            order: lessonOrder++,
            estimatedDuration: 30, // 30 minutes default
            lessonType: 'TEXT',
            isActive: true,
            hasQuiz: lessonOrder % 3 === 0, // Every 3rd lesson has a quiz
            allowNotes: true,
            allowBookmarks: true,
            moduleId: savedModule._id,
            createdBy: adminUser._id,
            lastModifiedBy: adminUser._id
          });

          const savedLesson = await lesson.save();
          console.log(`      ✅ Lesson created: ${savedLesson.title}`);
        }
      }
    }

    console.log('\n🎉 All modules and lessons created successfully!');
    
    // Display summary
    const totalModules = await ProgrammeModule.countDocuments();
    const totalLessons = await ProgrammeLesson.countDocuments();
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Modules: ${totalModules}`);
    console.log(`   Total Lessons: ${totalLessons}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating modules and lessons:', error);
    process.exit(1);
  }
});
