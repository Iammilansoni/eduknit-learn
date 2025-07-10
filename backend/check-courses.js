const mongoose = require('mongoose');
const path = require('path');

// Define schema directly for simplicity
const programmeSchema = new mongoose.Schema({
  title: String,
  category: String,
  isActive: Boolean,
  slug: String,
  description: String,
  instructor: String,
  level: String,
  price: Number,
  currency: String,
  skills: [String],
  prerequisites: [String],
  totalModules: Number,
  totalLessons: Number,
  estimatedDuration: Number,
  durationDays: Number,
  certificateAwarded: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId
});

const Programme = mongoose.model('Programme', programmeSchema);

async function checkCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('Connected to MongoDB');
    
    // Get all courses
    const courses = await Programme.find({});
    console.log(`Total courses in database: ${courses.length}`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category}) - Active: ${course.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking courses:', error);
    process.exit(1);
  }
}

checkCourses();
