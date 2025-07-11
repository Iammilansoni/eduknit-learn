const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define schemas
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

async function createModulesAndLessons() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all active courses
    const courses = await Programme.find({ isActive: true });
    console.log(`Found ${courses.length} active courses:`);
    courses.forEach(course => {
      console.log(`- ${course.title} (${course.slug}) [${course._id}]`);
    });

    // Clear existing modules and lessons
    await ProgrammeModule.deleteMany({});
    await ProgrammeLesson.deleteMany({});
    console.log('Cleared existing modules and lessons');

    // Module and lesson data for each course
    const courseModules = {
      'communication-skills': [
        {
          title: 'Basics of Communication',
          description: 'Master the core principles that make communication clear, compelling, and effective.',
          lessons: [
            { title: 'Communication Models and Principles', duration: 20, type: 'video' },
            { title: 'Active Listening Techniques', duration: 35, type: 'video' },
            { title: 'Overcoming Communication Barriers', duration: 15, type: 'reading' }
          ]
        },
        {
          title: 'Public Speaking Essentials',
          description: 'Learn to write clearly and persuasively across various formats and contexts.',
          lessons: [
            { title: 'Principles of Clear Writing', duration: 25, type: 'video' },
            { title: 'Email and Professional Correspondence', duration: 30, type: 'video' },
            { title: 'Writing Practice Exercise', duration: 45, type: 'quiz' }
          ]
        },
        {
          title: 'Group Discussions and Debates',
          description: 'Build confidence and skills for speaking effectively to any audience.',
          lessons: [
            { title: 'Structuring Compelling Presentations', duration: 30, type: 'video' },
            { title: 'Managing Speech Anxiety', duration: 20, type: 'video' },
            { title: 'Voice, Body Language, and Delivery', duration: 40, type: 'video' }
          ]
        },
        {
          title: 'Interview Skills Training',
          description: 'Master the art of professional interviews and career communication.',
          lessons: [
            { title: 'Interview Preparation Strategies', duration: 25, type: 'video' },
            { title: 'Common Interview Questions', duration: 30, type: 'video' },
            { title: 'Mock Interview Practice', duration: 60, type: 'quiz' }
          ]
        }
      ],
      'data-analytics': [
        {
          title: 'Data Analytics Foundations',
          description: 'Understand core concepts and processes in working with data.',
          lessons: [
            { title: 'Introduction to Data Thinking', duration: 20, type: 'video' },
            { title: 'Data Collection & Cleaning', duration: 35, type: 'video' },
            { title: 'Types of Data Analysis', duration: 25, type: 'reading' }
          ]
        },
        {
          title: 'Excel & Sheets Mastery',
          description: 'Learn essential spreadsheet tools for data manipulation and analysis.',
          lessons: [
            { title: 'Spreadsheet Organization & Formatting', duration: 30, type: 'video' },
            { title: 'Formulas & Functions Deep Dive', duration: 45, type: 'video' },
            { title: 'Pivot Tables & Data Analysis', duration: 40, type: 'video' }
          ]
        },
        {
          title: 'Data Visualization',
          description: 'Transform data into compelling visual insights.',
          lessons: [
            { title: 'Visualization Principles', duration: 25, type: 'video' },
            { title: 'Chart Types & Best Practices', duration: 35, type: 'video' },
            { title: 'Creating Dashboards', duration: 40, type: 'video' }
          ]
        }
      ],
      'digital-marketing': [
        {
          title: 'Digital Marketing Fundamentals',
          description: 'Understand the core concepts and landscape of digital marketing.',
          lessons: [
            { title: 'Introduction to Digital Marketing', duration: 25, type: 'video' },
            { title: 'Customer Journey & Digital Touchpoints', duration: 30, type: 'video' },
            { title: 'Digital Marketing Strategy Framework', duration: 35, type: 'reading' }
          ]
        },
        {
          title: 'Social Media Marketing',
          description: 'Build brand presence and engage audiences across social platforms.',
          lessons: [
            { title: 'Platform Selection & Strategy', duration: 30, type: 'video' },
            { title: 'Content Creation for Social Media', duration: 35, type: 'video' },
            { title: 'Community Management', duration: 25, type: 'video' }
          ]
        },
        {
          title: 'Content Marketing',
          description: 'Create content that attracts, engages, and converts your audience.',
          lessons: [
            { title: 'Content Strategy Development', duration: 30, type: 'video' },
            { title: 'Blogging & Article Writing', duration: 30, type: 'video' },
            { title: 'Content Distribution Channels', duration: 20, type: 'reading' }
          ]
        }
      ],
      'basics-of-ai': [
        {
          title: 'AI Fundamentals',
          description: 'Understand what AI is, how it works, and its current capabilities.',
          lessons: [
            { title: 'What is Artificial Intelligence?', duration: 25, type: 'video' },
            { title: 'Types of AI and Machine Learning', duration: 30, type: 'video' },
            { title: 'AI vs Human Intelligence', duration: 20, type: 'reading' }
          ]
        },
        {
          title: 'AI Tools & Applications',
          description: 'Explore practical AI tools and their real-world applications.',
          lessons: [
            { title: 'AI in Everyday Life', duration: 25, type: 'video' },
            { title: 'Popular AI Tools & Platforms', duration: 35, type: 'video' },
            { title: 'Hands-on with AI Tools', duration: 45, type: 'video' }
          ]
        },
        {
          title: 'Ethics and Future of AI',
          description: 'Examine the ethical considerations and future implications of AI.',
          lessons: [
            { title: 'Ethical Considerations in AI', duration: 30, type: 'video' },
            { title: 'Bias in AI Systems', duration: 25, type: 'reading' },
            { title: 'The Future of AI and Society', duration: 40, type: 'video' }
          ]
        }
      ],
      'ai-prompt-crafting': [
        {
          title: 'Foundations of Prompt Engineering',
          description: 'Learn the principles that make AI prompts effective.',
          lessons: [
            { title: 'How AI Language Models Work', duration: 20, type: 'video' },
            { title: 'Clarity, Context, and Constraints', duration: 25, type: 'video' },
            { title: 'Common Prompt Pitfalls', duration: 15, type: 'reading' }
          ]
        },
        {
          title: 'Practical Prompt Patterns',
          description: 'Master proven structures for different types of AI tasks.',
          lessons: [
            { title: 'Role and Format Specification', duration: 30, type: 'video' },
            { title: 'Step-by-Step Instruction Patterns', duration: 25, type: 'video' },
            { title: 'Few-Shot Learning Prompts', duration: 35, type: 'video' }
          ]
        },
        {
          title: 'Advanced Prompt Techniques',
          description: 'Explore sophisticated strategies for complex AI interactions.',
          lessons: [
            { title: 'Chain-of-Thought Prompting', duration: 30, type: 'video' },
            { title: 'Prompt Chaining & Workflows', duration: 35, type: 'video' },
            { title: 'Debugging and Optimizing Prompts', duration: 25, type: 'reading' }
          ]
        }
      ],
      'bioskills': [
        {
          title: 'Applied Cellular Biology',
          description: 'Understand cellular processes through practical applications.',
          lessons: [
            { title: 'Cellular Structure & Function in Practice', duration: 30, type: 'video' },
            { title: 'Cell Communication Case Studies', duration: 25, type: 'video' },
            { title: 'Virtual Cell Imaging Lab', duration: 45, type: 'video' }
          ]
        },
        {
          title: 'Practical Genetics & Genomics',
          description: 'Explore the applications of genetic knowledge in modern biosciences.',
          lessons: [
            { title: 'Genetic Technologies in Practice', duration: 35, type: 'video' },
            { title: 'Genomics Data Interpretation', duration: 40, type: 'video' },
            { title: 'Genetic Testing Case Analysis', duration: 30, type: 'reading' }
          ]
        },
        {
          title: 'Laboratory Skills & Techniques',
          description: 'Develop practical laboratory and research skills.',
          lessons: [
            { title: 'Essential Lab Techniques', duration: 45, type: 'video' },
            { title: 'Data Collection & Analysis', duration: 35, type: 'video' },
            { title: 'Virtual Lab Simulations', duration: 60, type: 'video' }
          ]
        }
      ],
      'decision-making': [
        {
          title: 'Critical Thinking Foundations',
          description: 'Build the analytical skills to evaluate information effectively.',
          lessons: [
            { title: 'Cognitive Biases & Logical Fallacies', duration: 30, type: 'video' },
            { title: 'Evidence Evaluation', duration: 25, type: 'video' },
            { title: 'Critical Thinking Exercises', duration: 45, type: 'quiz' }
          ]
        },
        {
          title: 'Decision Frameworks',
          description: 'Learn structured approaches to making different types of decisions.',
          lessons: [
            { title: 'Cost-Benefit Analysis', duration: 30, type: 'video' },
            { title: 'Decision Trees & Expected Value', duration: 35, type: 'video' },
            { title: 'Multi-criteria Decision Analysis', duration: 40, type: 'video' }
          ]
        },
        {
          title: 'Problem-Solving Methods',
          description: 'Master methodical approaches to tackle complex problems.',
          lessons: [
            { title: 'Problem Definition & Framing', duration: 25, type: 'video' },
            { title: 'Root Cause Analysis', duration: 30, type: 'video' },
            { title: 'Solution Development & Evaluation', duration: 45, type: 'video' }
          ]
        }
      ],
      'mathematics': [
        {
          title: 'Applied Mathematics Fundamentals',
          description: 'Build a strong foundation in mathematical thinking and problem-solving.',
          lessons: [
            { title: 'Mathematical Modeling Basics', duration: 30, type: 'video' },
            { title: 'Real-World Problem Solving', duration: 35, type: 'video' },
            { title: 'Mathematical Thinking Exercises', duration: 25, type: 'reading' }
          ]
        },
        {
          title: 'Statistics & Probability',
          description: 'Learn to work with data and understand uncertainty in practical contexts.',
          lessons: [
            { title: 'Descriptive Statistics in Practice', duration: 30, type: 'video' },
            { title: 'Probability for Decision Making', duration: 35, type: 'video' },
            { title: 'Statistical Analysis Projects', duration: 45, type: 'quiz' }
          ]
        },
        {
          title: 'Financial Mathematics',
          description: 'Apply mathematical concepts to personal and business finance.',
          lessons: [
            { title: 'Interest, Loans, and Investments', duration: 35, type: 'video' },
            { title: 'Risk Assessment & Portfolio Analysis', duration: 30, type: 'video' },
            { title: 'Financial Planning Scenarios', duration: 40, type: 'quiz' }
          ]
        }
      ],
      'job-search-program': [
        {
          title: 'Resume & LinkedIn Building',
          description: 'Create professional profiles that stand out to recruiters.',
          lessons: [
            { title: 'Resume Writing Fundamentals', duration: 30, type: 'video' },
            { title: 'LinkedIn Profile Optimization', duration: 25, type: 'video' },
            { title: 'Portfolio Development', duration: 35, type: 'reading' }
          ]
        },
        {
          title: 'Interview Preparation',
          description: 'Master interview techniques and strategies for success.',
          lessons: [
            { title: 'Interview Types and Formats', duration: 25, type: 'video' },
            { title: 'Common Interview Questions', duration: 30, type: 'video' },
            { title: 'Mock Interview Practice', duration: 45, type: 'quiz' }
          ]
        },
        {
          title: 'Networking and Job Search Strategy',
          description: 'Develop effective strategies for finding and securing opportunities.',
          lessons: [
            { title: 'Professional Networking Techniques', duration: 30, type: 'video' },
            { title: 'Job Search Platforms and Tools', duration: 25, type: 'video' },
            { title: 'Follow-up and Follow-through', duration: 20, type: 'reading' }
          ]
        }
      ]
    };

    // Create modules and lessons for each course
    for (const course of courses) {
      const moduleData = courseModules[course.slug];
      if (!moduleData) {
        console.log(`No module data found for ${course.slug}, skipping...`);
        continue;
      }

      console.log(`\nCreating modules for ${course.title}:`);
      
      for (let moduleIndex = 0; moduleIndex < moduleData.length; moduleIndex++) {
        const modData = moduleData[moduleIndex];
        
        // Create module
        const module = new ProgrammeModule({
          programmeId: course._id,
          title: modData.title,
          description: modData.description,
          order: moduleIndex + 1,
          estimatedDuration: modData.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
          learningObjectives: [
            `Master the key concepts of ${modData.title}`,
            `Apply learned skills in practical scenarios`,
            `Complete all module exercises and assessments`
          ],
          prerequisites: moduleIndex > 0 ? ['Completion of previous modules'] : [],
          isActive: true
        });
        
        await module.save();
        console.log(`  ✓ Created module: ${module.title}`);

        // Create lessons for this module
        for (let lessonIndex = 0; lessonIndex < modData.lessons.length; lessonIndex++) {
          const lessonData = modData.lessons[lessonIndex];
          
          const lesson = new ProgrammeLesson({
            programmeId: course._id,
            moduleId: module._id,
            title: lessonData.title,
            description: `Learn about ${lessonData.title.toLowerCase()}`,
            content: `This lesson covers ${lessonData.title.toLowerCase()}. You'll explore key concepts, practical applications, and hands-on exercises to master this topic.`,
            duration: lessonData.duration,
            type: lessonData.type,
            order: lessonIndex + 1,
            isActive: true
          });
          
          await lesson.save();
          console.log(`    ✓ Created lesson: ${lesson.title} (${lesson.duration}min)`);
        }
      }
    }

    // Update course totals
    for (const course of courses) {
      const moduleCount = await ProgrammeModule.countDocuments({ programmeId: course._id });
      const lessonCount = await ProgrammeLesson.countDocuments({ programmeId: course._id });
      const totalDuration = await ProgrammeLesson.aggregate([
        { $match: { programmeId: course._id } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);
      
      await Programme.findByIdAndUpdate(course._id, {
        totalModules: moduleCount,
        totalLessons: lessonCount,
        estimatedDuration: totalDuration.length > 0 ? Math.ceil(totalDuration[0].total / 60) : 0
      });
      
      console.log(`Updated ${course.title}: ${moduleCount} modules, ${lessonCount} lessons`);
    }

    console.log('\n✅ Successfully created all modules and lessons!');

    // Final verification
    const totalCourses = await Programme.countDocuments({ isActive: true });
    const totalModules = await ProgrammeModule.countDocuments();
    const totalLessons = await ProgrammeLesson.countDocuments();
    
    console.log(`\n📊 Final Summary:`);
    console.log(`Active Courses: ${totalCourses}`);
    console.log(`Total Modules: ${totalModules}`);
    console.log(`Total Lessons: ${totalLessons}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createModulesAndLessons();
