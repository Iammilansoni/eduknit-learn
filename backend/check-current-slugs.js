const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Schema
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
}, { timestamps: true });

const Programme = mongoose.model('Programme', programmeSchema);

async function checkCourseSlugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    const courses = await Programme.find({ isActive: true })
      .select('title slug _id')
      .sort({ title: 1 });
    
    console.log('\n📋 Available Courses and Slugs:');
    console.log('=' .repeat(60));
    
    const mapping = {};
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Slug: ${course.slug || 'NO SLUG'}`);
      console.log(`   ID: ${course._id}`);
      console.log('');
      
      if (course.slug) {
        mapping[course.slug] = course._id.toString();
      }
    });
    
    console.log('\n🔗 Frontend Mapping Object:');
    console.log('=' .repeat(60));
    console.log('const courseSlugToId = {');
    Object.entries(mapping).forEach(([slug, id]) => {
      console.log(`  '${slug}': '${id}',`);
    });
    console.log('};');
    
    console.log('\n🔍 Testing Communication Skills:');
    const commSkills = courses.find(c => 
      c.title.toLowerCase().includes('communication') || 
      c.slug?.includes('communication')
    );
    
    if (commSkills) {
      console.log(`✅ Found: ${commSkills.title}`);
      console.log(`   Slug: ${commSkills.slug}`);
      console.log(`   ID: ${commSkills._id}`);
    } else {
      console.log('❌ Communication Skills course not found');
    }
    
    console.log('\n📊 Summary:');
    console.log(`Total courses: ${courses.length}`);
    console.log(`Courses with slugs: ${courses.filter(c => c.slug).length}`);
    console.log(`Courses without slugs: ${courses.filter(c => !c.slug).length}`);
    
  } catch (error) {
    console.error('❌ Error checking course slugs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
checkCourseSlugs();
