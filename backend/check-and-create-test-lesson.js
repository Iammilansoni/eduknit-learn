const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function checkAndCreateTestData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check what collections exist
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\n📂 Available collections:');
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });

        // Define schemas
        const ProgrammeSchema = new Schema({
            title: { type: String, required: true },
            description: String,
            category: String,
            totalLessons: { type: Number, default: 0 },
            estimatedDuration: { type: Number, default: 30 },
            durationDays: { type: Number, default: 30 },
            slug: String,
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const ProgrammeModuleSchema = new Schema({
            programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
            title: { type: String, required: true },
            description: String,
            orderIndex: { type: Number, required: true },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const ProgrammeLessonSchema = new Schema({
            moduleId: { type: Schema.Types.ObjectId, ref: 'ProgrammeModule', required: true },
            programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            orderIndex: { type: Number, required: true },
            type: { type: String, enum: ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE', 'DOCUMENT'], required: true },
            content: {
                textContent: String,
                videoUrl: String,
                quiz: {
                    questions: [{
                        id: String,
                        question: String,
                        type: { type: String, enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] },
                        options: [String],
                        correctAnswer: Schema.Types.Mixed,
                        points: Number
                    }],
                    timeLimit: Number,
                    passingScore: Number
                }
            },
            estimatedDuration: { type: Number, required: true },
            duration: Number,
            isRequired: { type: Boolean, default: true },
            isActive: { type: Boolean, default: true },
            quiz: {
                questions: [{
                    id: String,
                    question: String,
                    type: { type: String, enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] },
                    options: [String],
                    correctAnswer: Schema.Types.Mixed,
                    points: Number
                }],
                timeLimit: Number,
                passingScore: Number,
                settings: {
                    timeLimit: Number,
                    passingScore: Number,
                    allowMultipleAttempts: Boolean,
                    showCorrectAnswers: Boolean,
                    showFeedback: Boolean,
                    maxAttempts: Number,
                    questionsRandomized: Boolean,
                    optionsRandomized: Boolean
                }
            },
            hasQuiz: { type: Boolean, default: false }
        }, { timestamps: true });

        const Programme = mongoose.model('Programme', ProgrammeSchema);
        const ProgrammeModule = mongoose.model('ProgrammeModule', ProgrammeModuleSchema);
        const ProgrammeLesson = mongoose.model('ProgrammeLesson', ProgrammeLessonSchema);

        // Check if we have any data
        const programmeCount = await Programme.countDocuments();
        const moduleCount = await ProgrammeModule.countDocuments();
        const lessonCount = await ProgrammeLesson.countDocuments();

        console.log(`\n📊 Current data counts:`);
        console.log(`  - Programmes: ${programmeCount}`);
        console.log(`  - Modules: ${moduleCount}`);
        console.log(`  - Lessons: ${lessonCount}`);

        if (lessonCount === 0) {
            console.log('\n🔨 Creating test data...');

            // Create a test programme
            const programme = new Programme({
                title: 'Demo Programming Course',
                description: 'A comprehensive programming course for beginners',
                category: 'Programming',
                totalLessons: 1,
                estimatedDuration: 30,
                durationDays: 30,
                slug: 'demo-programming-course'
            });
            await programme.save();
            console.log(`✅ Created programme: ${programme.title} (${programme._id})`);

            // Create a test module
            const module = new ProgrammeModule({
                programmeId: programme._id,
                title: 'Introduction to Programming',
                description: 'Learn the basics of programming',
                orderIndex: 1
            });
            await module.save();
            console.log(`✅ Created module: ${module.title} (${module._id})`);

            // Create a test lesson
            const lesson = new ProgrammeLesson({
                moduleId: module._id,
                programmeId: programme._id,
                title: 'What is Programming?',
                description: 'An introduction to programming concepts and fundamentals',
                orderIndex: 1,
                type: 'TEXT',
                content: {
                    textContent: '<h2>What is Programming?</h2><p>Programming is the process of creating instructions for computers to follow. These instructions, called code, tell the computer what to do and how to do it.</p><p>In this lesson, we will explore the fundamental concepts of programming and understand how it works.</p>'
                },
                estimatedDuration: 15,
                duration: 15
            });
            await lesson.save();
            console.log(`✅ Created lesson: ${lesson.title} (${lesson._id})`);

            // Now add a demo quiz to this lesson
            const demoQuiz = {
                questions: [
                    {
                        id: 'q1_demo',
                        question: 'What is programming?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                            'Creating instructions for computers',
                            'Playing video games',
                            'Using social media',
                            'Watching videos'
                        ],
                        correctAnswer: 'Creating instructions for computers',
                        points: 10
                    },
                    {
                        id: 'q2_demo',
                        question: 'Is programming only for computer science students?',
                        type: 'TRUE_FALSE',
                        options: ['True', 'False'],
                        correctAnswer: false,
                        points: 5
                    },
                    {
                        id: 'q3_demo',
                        question: 'What is the main benefit of learning programming?',
                        type: 'SHORT_ANSWER',
                        correctAnswer: 'problem solving',
                        points: 15
                    }
                ],
                timeLimit: 10,
                passingScore: 70,
                settings: {
                    timeLimit: 10,
                    passingScore: 70,
                    allowMultipleAttempts: true,
                    showCorrectAnswers: true,
                    showFeedback: true,
                    maxAttempts: 3,
                    questionsRandomized: false,
                    optionsRandomized: false
                }
            };

            const updatedLesson = await ProgrammeLesson.findByIdAndUpdate(
                lesson._id,
                {
                    $set: {
                        'content.quiz': demoQuiz,
                        quiz: demoQuiz,
                        hasQuiz: true
                    }
                },
                { new: true }
            );

            console.log(`✅ Added quiz to lesson: ${lesson.title}`);
            console.log(`📊 Quiz details:`);
            console.log(`   - Questions: ${demoQuiz.questions.length}`);
            console.log(`   - Max Score: ${demoQuiz.questions.reduce((sum, q) => sum + q.points, 0)}`);
            console.log(`   - Passing Score: ${demoQuiz.passingScore}%`);
            console.log(`   - Time Limit: ${demoQuiz.timeLimit} minutes`);

            console.log('\n🔗 Test URLs:');
            console.log(`   Debug: http://localhost:3001/api/quiz/debug/lesson/${lesson._id}`);
            console.log(`   Quiz API: http://localhost:3001/api/quiz/lesson/${lesson._id}`);
            console.log(`   Frontend: http://localhost:5173/lessons/${lesson._id}`);

        } else {
            console.log('\n✅ Lessons already exist in the database');
            
            // Get a random lesson and check for quiz
            const randomLesson = await ProgrammeLesson.findOne({});
            if (randomLesson) {
                console.log(`\n🔍 Sample lesson: ${randomLesson.title} (${randomLesson._id})`);
                console.log(`   Has quiz in content: ${!!randomLesson.content?.quiz}`);
                console.log(`   Has quiz at root: ${!!randomLesson.quiz}`);
                console.log(`   Has quiz flag: ${randomLesson.hasQuiz}`);
                
                console.log('\n🔗 Test URLs:');
                console.log(`   Debug: http://localhost:3001/api/quiz/debug/lesson/${randomLesson._id}`);
                console.log(`   Quiz API: http://localhost:3001/api/quiz/lesson/${randomLesson._id}`);
                console.log(`   Frontend: http://localhost:5173/lessons/${randomLesson._id}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

checkAndCreateTestData();
