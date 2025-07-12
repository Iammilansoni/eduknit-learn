const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the lesson schema inline for CommonJS compatibility
const ProgrammeLessonSchema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, ref: 'ProgrammeModule', required: true },
    programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    type: { type: String, enum: ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE', 'DOCUMENT'], required: true },
    content: {
        videoUrl: String,
        videoDuration: Number,
        textContent: String,
        documentUrl: String,
        interactiveElements: [Schema.Types.Mixed],
        richContent: [{
            id: String,
            type: { type: String, enum: ['text', 'video', 'image', 'code', 'interactive', 'embed'] },
            title: String,
            content: String,
            metadata: Schema.Types.Mixed
        }],
        contentFormat: { type: String, enum: ['HTML', 'JSON', 'LEGACY'], default: 'LEGACY' },
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
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'ProgrammeLesson' }],
    learningObjectives: [String],
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['PDF', 'LINK', 'VIDEO', 'DOCUMENT'] }
    }],
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

const ProgrammeLesson = mongoose.model('ProgrammeLesson', ProgrammeLessonSchema);

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function createDemoQuiz() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get any lesson to add a demo quiz
        const lesson = await ProgrammeLesson.findOne({});

        if (!lesson) {
            console.log('No lessons found in the database');
            return;
        }

        console.log(`Found lesson: ${lesson.title} (${lesson._id})`);

        // Create a demo quiz
        const demoQuiz = {
            questions: [
                {
                    id: 'q1_demo',
                    question: 'What is the main topic of this lesson?',
                    type: 'MULTIPLE_CHOICE',
                    options: [
                        'Programming fundamentals',
                        'Data structures',
                        'Web development',
                        'Database management'
                    ],
                    correctAnswer: 'Programming fundamentals',
                    points: 10
                },
                {
                    id: 'q2_demo',
                    question: 'Is this lesson part of a larger course?',
                    type: 'TRUE_FALSE',
                    options: ['True', 'False'],
                    correctAnswer: true,
                    points: 5
                },
                {
                    id: 'q3_demo',
                    question: 'What is one key concept you learned?',
                    type: 'SHORT_ANSWER',
                    correctAnswer: 'learning',
                    points: 15
                }
            ],
            timeLimit: 15, // 15 minutes
            passingScore: 70,
            settings: {
                timeLimit: 15,
                passingScore: 70,
                allowMultipleAttempts: true,
                showCorrectAnswers: true,
                showFeedback: true,
                maxAttempts: 3,
                questionsRandomized: false,
                optionsRandomized: false
            }
        };

        // Update the lesson with the quiz data
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

        console.log('✅ Demo quiz created successfully!');
        console.log(`Lesson ID: ${lesson._id}`);
        console.log(`Quiz questions: ${demoQuiz.questions.length}`);
        console.log(`Max score: ${demoQuiz.questions.reduce((sum, q) => sum + q.points, 0)}`);
        console.log(`Passing score: ${demoQuiz.passingScore}%`);
        
        console.log('\n🔗 Test URLs:');
        console.log(`Debug: http://localhost:3001/api/quiz/debug/lesson/${lesson._id}`);
        console.log(`Quiz: http://localhost:3001/api/quiz/lesson/${lesson._id}`);
        console.log(`Frontend: http://localhost:5173/lessons/${lesson._id}`);

    } catch (error) {
        console.error('Error creating demo quiz:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createDemoQuiz();
