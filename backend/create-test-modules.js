const mongoose = require('mongoose');
require('dotenv').config();

// Import models - using compiled JavaScript
const ProgrammeModule = require('./dist/models/ProgrammeModule').default;
const ProgrammeLesson = require('./dist/models/ProgrammeLesson').default;

async function createTestModules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const programmeId = '686f5f0185350adfe788358a'; // The course ID from the logs

    // Check if modules already exist
    const existingModules = await ProgrammeModule.find({ programmeId });
    if (existingModules.length > 0) {
      console.log(`Course already has ${existingModules.length} modules. Skipping creation.`);
      return;
    }

    // Create test modules
    const modules = [
      {
        title: 'Introduction to Communication',
        description: 'Learn the fundamentals of effective communication',
        programmeId: programmeId,
        orderIndex: 1,
        estimatedDuration: 30,
        learningObjectives: [
          'Understand the importance of communication',
          'Identify different communication styles',
          'Practice active listening techniques'
        ],
        prerequisites: [],
        isActive: true,
        totalLessons: 3
      },
      {
        title: 'Verbal Communication Skills',
        description: 'Master the art of speaking clearly and effectively',
        programmeId: programmeId,
        orderIndex: 2,
        estimatedDuration: 45,
        learningObjectives: [
          'Improve speaking clarity and pace',
          'Use appropriate tone and volume',
          'Structure messages effectively'
        ],
        prerequisites: [],
        isActive: true,
        totalLessons: 3
      },
      {
        title: 'Non-Verbal Communication',
        description: 'Understand body language and visual cues',
        programmeId: programmeId,
        orderIndex: 3,
        estimatedDuration: 40,
        learningObjectives: [
          'Interpret body language signals',
          'Use appropriate gestures and posture',
          'Maintain eye contact effectively'
        ],
        prerequisites: [],
        isActive: true,
        totalLessons: 3
      }
    ];

    // Insert modules
    const createdModules = await ProgrammeModule.insertMany(modules);
    console.log(`Created ${createdModules.length} modules`);

    // Create test lessons for each module
    for (const module of createdModules) {
      const lessons = [
        {
          title: `${module.title} - Lesson 1`,
          description: `First lesson of ${module.title}`,
          moduleId: module._id,
          programmeId: programmeId,
          orderIndex: 1,
          estimatedDuration: 15,
          type: 'article',
          content: {
            sections: [
              {
                type: 'text',
                content: `Welcome to ${module.title}! This is the first lesson where you'll learn the basics.`
              }
            ]
          },
          learningObjectives: module.learningObjectives.slice(0, 1),
          resources: [],
          isRequired: true,
          isActive: true
        },
        {
          title: `${module.title} - Lesson 2`,
          description: `Second lesson of ${module.title}`,
          moduleId: module._id,
          programmeId: programmeId,
          orderIndex: 2,
          estimatedDuration: 20,
          type: 'video',
          content: {
            videoUrl: 'https://example.com/sample-video.mp4',
            sections: [
              {
                type: 'video',
                content: 'Watch this video to learn more about the topic.'
              }
            ]
          },
          learningObjectives: module.learningObjectives.slice(1, 2),
          resources: [],
          isRequired: true,
          isActive: true
        },
        {
          title: `${module.title} - Quiz`,
          description: `Assessment for ${module.title}`,
          moduleId: module._id,
          programmeId: programmeId,
          orderIndex: 3,
          estimatedDuration: 10,
          type: 'quiz',
          content: {
            quiz: {
              passingScore: 70,
              questions: [
                {
                  question: 'What is the main purpose of communication?',
                  type: 'single',
                  options: [
                    'To impress others',
                    'To convey information clearly',
                    'To speak quickly',
                    'To use complex words'
                  ],
                  correctAnswer: 'To convey information clearly',
                  points: 10
                }
              ]
            }
          },
          learningObjectives: module.learningObjectives.slice(2),
          resources: [],
          isRequired: true,
          isActive: true
        }
      ];

      const createdLessons = await ProgrammeLesson.insertMany(lessons);
      console.log(`Created ${createdLessons.length} lessons for module: ${module.title}`);
    }

    console.log('Test modules and lessons created successfully!');
    
    // Test the next-module endpoint
    console.log('\nTesting next-module endpoint...');
    const testResponse = await fetch(`http://localhost:5000/api/courses/next-module/${programmeId}?studentId=686f9f6e095973554bb99b25`);
    const testData = await testResponse.json();
    console.log('Next module response:', JSON.stringify(testData, null, 2));

  } catch (error) {
    console.error('Error creating test modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestModules(); 