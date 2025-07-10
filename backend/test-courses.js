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
  createdBy: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Programme = mongoose.model('Programme', programmeSchema);

async function testCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all courses
    const allCourses = await Programme.find({});
    console.log(`\nTotal courses in database: ${allCourses.length}`);

    // Get active courses
    const activeCourses = await Programme.find({ isActive: true });
    console.log(`Active courses: ${activeCourses.length}`);

    console.log('\n=== All Courses ===');
    allCourses.forEach(course => {
      console.log(`- ${course.title} (${course.slug}) [${course._id}] - Active: ${course.isActive}`);
    });

    console.log('\n=== Active Courses ===');
    activeCourses.forEach(course => {
      console.log(`- ${course.title} (${course.slug}) [${course._id}]`);
    });

    // Create mapping
    const mapping = {};
    activeCourses.forEach(course => {
      mapping[course.slug] = course._id.toString();
    });

    console.log('\n=== Mapping for /api/courses/mapping ===');
    console.log(JSON.stringify(mapping, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testCourses(); 