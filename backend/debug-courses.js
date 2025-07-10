const mongoose = require('mongoose');
const fs = require('fs');
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

async function debugCourses() {
  const log = [];
  
  try {
    log.push('Starting course debug...');
    await mongoose.connect(MONGODB_URI);
    log.push('Connected to MongoDB');

    // Get all courses
    const allCourses = await Programme.find({});
    log.push(`Total courses in database: ${allCourses.length}`);

    // Get active courses
    const activeCourses = await Programme.find({ isActive: true });
    log.push(`Active courses: ${activeCourses.length}`);

    log.push('\n=== All Courses ===');
    allCourses.forEach(course => {
      log.push(`- ${course.title} (${course.slug}) [${course._id}] - Active: ${course.isActive}`);
    });

    log.push('\n=== Active Courses ===');
    activeCourses.forEach(course => {
      log.push(`- ${course.title} (${course.slug}) [${course._id}]`);
    });

    // Create mapping
    const mapping = {};
    activeCourses.forEach(course => {
      mapping[course.slug] = course._id.toString();
    });

    log.push('\n=== Mapping for /api/courses/mapping ===');
    log.push(JSON.stringify(mapping, null, 2));

    // Write to file
    fs.writeFileSync('course-debug.log', log.join('\n'));
    console.log('Debug output written to course-debug.log');

  } catch (error) {
    log.push(`Error: ${error.message}`);
    fs.writeFileSync('course-debug.log', log.join('\n'));
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    log.push('Disconnected from MongoDB');
  }
}

debugCourses(); 