const mongoose = require('mongoose');
require('dotenv').config();

async function checkLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('✅ Connected to MongoDB');
    
    // Define the schema
    const ProgrammeLessonSchema = new mongoose.Schema({}, { strict: false });
    const ProgrammeLesson = mongoose.model('ProgrammeLesson', ProgrammeLessonSchema);
    
    // Find all lessons
    console.log('\n🔍 Searching for lessons...');
    const lessons = await ProgrammeLesson.find({}).limit(20).select('_id title description content');
    
    if (lessons.length === 0) {
      console.log('❌ No lessons found in database');
    } else {
      console.log(`✅ Found ${lessons.length} lessons:`);
      console.log('='.repeat(80));
      
      lessons.forEach((lesson, index) => {
        console.log(`${index + 1}. ID: ${lesson._id}`);
        console.log(`   Title: ${lesson.title || 'No title'}`);
        console.log(`   Description: ${(lesson.description || 'No description').substring(0, 100)}...`);
        
        // Check if lesson has quiz
        const hasQuiz = lesson.content && lesson.content.quiz && 
                       lesson.content.quiz.questions && 
                       lesson.content.quiz.questions.length > 0;
        console.log(`   Has Quiz: ${hasQuiz ? '✅ Yes' : '❌ No'}`);
        
        if (hasQuiz) {
          console.log(`   Quiz Questions: ${lesson.content.quiz.questions.length}`);
        }
        console.log('');
      });
    }
    
    // Also check for the specific lesson ID that exists
    console.log('\n🔍 Checking specific lesson ID: 687141cc22d319e99ce98ff6');
    const specificLesson = await ProgrammeLesson.findById('687141cc22d319e99ce98ff6');
    if (specificLesson) {
      console.log('✅ Specific lesson found!');
      console.log('   Title:', specificLesson.title);
      console.log('   Description:', specificLesson.description);
      
      // Deep dive into content structure
      console.log('\n📊 Content Analysis:');
      if (specificLesson.content) {
        console.log('   Content object exists:', !!specificLesson.content);
        console.log('   Content keys:', Object.keys(specificLesson.content));
        
        if (specificLesson.content.quiz) {
          console.log('   Quiz object exists:', !!specificLesson.content.quiz);
          console.log('   Quiz keys:', Object.keys(specificLesson.content.quiz));
          
          if (specificLesson.content.quiz.questions) {
            console.log('   Questions array exists:', Array.isArray(specificLesson.content.quiz.questions));
            console.log('   Number of questions:', specificLesson.content.quiz.questions.length);
            
            if (specificLesson.content.quiz.questions.length > 0) {
              console.log('   First question preview:', JSON.stringify(specificLesson.content.quiz.questions[0], null, 2));
            }
          } else {
            console.log('   ❌ No questions array found');
          }
          
          if (specificLesson.content.quiz.settings) {
            console.log('   Quiz settings:', JSON.stringify(specificLesson.content.quiz.settings, null, 2));
          } else {
            console.log('   ❌ No quiz settings found');
          }
        } else {
          console.log('   ❌ No quiz object found in content');
        }
      } else {
        console.log('   ❌ No content object found');
      }
    } else {
      console.log('❌ Specific lesson NOT found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLessons();
