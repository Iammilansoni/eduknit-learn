/**
 * Database Debugging Script
 * Run this to check lesson data directly in MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

const LESSON_ID = '6871418b22d319e99ce98ff1';

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
};

// Lesson Schema (simplified)
const lessonSchema = new mongoose.Schema({}, { strict: false });
const ProgrammeLesson = mongoose.model('ProgrammeLesson', lessonSchema);

async function debugLesson() {
    console.log('🔍 Database Lesson Debug');
    console.log('========================\n');
    
    const connected = await connectDB();
    if (!connected) {
        console.log('❌ Cannot connect to database');
        return;
    }
    
    try {
        console.log(`🔎 Searching for lesson: ${LESSON_ID}`);
        
        // Check if lesson exists
        const lesson = await ProgrammeLesson.findById(LESSON_ID);
        
        if (!lesson) {
            console.log('❌ Lesson not found in database');
            
            // Search for similar IDs
            console.log('\n🔍 Searching for lessons with similar IDs...');
            const similarLessons = await ProgrammeLesson.find({
                _id: { $regex: LESSON_ID.substring(0, 10) }
            }).limit(5);
            
            if (similarLessons.length > 0) {
                console.log('📋 Found similar lessons:');
                similarLessons.forEach(l => {
                    console.log(`  - ${l._id}: ${l.title}`);
                });
            } else {
                console.log('🔍 No similar lessons found');
            }
            
            // Get total lesson count
            const totalLessons = await ProgrammeLesson.countDocuments();
            console.log(`\n📊 Total lessons in database: ${totalLessons}`);
            
            if (totalLessons > 0) {
                console.log('\n📋 Recent lessons:');
                const recentLessons = await ProgrammeLesson.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('_id title createdAt');
                    
                recentLessons.forEach(l => {
                    console.log(`  - ${l._id}: ${l.title} (${l.createdAt})`);
                });
            }
            
        } else {
            console.log('✅ Lesson found!');
            console.log(`📖 Title: ${lesson.title}`);
            console.log(`📝 Type: ${lesson.type}`);
            console.log(`🆔 ID: ${lesson._id}`);
            
            // Check content structure
            console.log('\n📋 Content Analysis:');
            console.log(`  - Has content object: ${!!lesson.content}`);
            
            if (lesson.content) {
                console.log(`  - Has quiz property: ${!!lesson.content.quiz}`);
                console.log(`  - Has textContent: ${!!lesson.content.textContent}`);
                console.log(`  - Has videoUrl: ${!!lesson.content.videoUrl}`);
                console.log(`  - Has richContent: ${!!lesson.content.richContent}`);
                console.log(`  - Content format: ${lesson.content.contentFormat || 'not specified'}`);
                
                if (lesson.content.quiz) {
                    console.log('\n🧩 Quiz Analysis:');
                    console.log(`  - Has questions: ${!!lesson.content.quiz.questions}`);
                    console.log(`  - Question count: ${lesson.content.quiz.questions?.length || 0}`);
                    console.log(`  - Time limit: ${lesson.content.quiz.timeLimit || 'none'}`);
                    console.log(`  - Passing score: ${lesson.content.quiz.passingScore || 'not set'}%`);
                    
                    if (lesson.content.quiz.questions && lesson.content.quiz.questions.length > 0) {
                        console.log('\n📝 Quiz Questions:');
                        lesson.content.quiz.questions.forEach((q, i) => {
                            console.log(`  ${i + 1}. ${q.question} (${q.type}, ${q.points} pts)`);
                        });
                    }
                } else {
                    console.log('\n❌ No quiz data found in lesson.content.quiz');
                }
            } else {
                console.log('❌ No content object found in lesson');
            }
        }
        
    } catch (error) {
        console.error('❌ Database query error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

debugLesson().catch(console.error);
