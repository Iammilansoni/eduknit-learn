const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

console.log('🚀 Starting course setup...');
console.log('MongoDB URI:', MONGODB_URI);

// Define Programme Schema (simplified)
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
  imageUrl: String,
  overview: String,
  skills: [String],
  prerequisites: [String],
  isActive: { type: Boolean, default: true },
  totalModules: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 0 },
  durationDays: { type: Number, default: 0 },
  certificateAwarded: { type: Boolean, default: true },
  createdBy: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Programme = mongoose.model('Programme', programmeSchema);

// Communication Skills course data
const communicationSkillsCourse = {
  title: "Communication Skills",
  slug: "communication-skills",
  description: "Master effective communication for personal and professional success. Learn public speaking, active listening, and persuasive techniques.",
  category: "PROFESSIONAL_SKILLS",
  instructor: "Dr. Sarah Johnson",
  duration: "3-5 hours/week",
  timeframe: "6-8 weeks",
  level: "ALL_LEVELS",
  price: 99,
  currency: "USD",
  imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  overview: "Master the art of effective communication through practical exercises, real-world scenarios, and expert guidance.",
  skills: ["Public Speaking", "Active Listening", "Presentation Skills", "Interpersonal Communication", "Conflict Resolution"],
  prerequisites: ["Basic English proficiency", "Willingness to participate in group activities"],
  isActive: true,
  totalModules: 6,
  totalLessons: 24,
  estimatedDuration: 40,
  durationDays: 56,
  certificateAwarded: true
};

async function setupCommunicationSkillsCourse() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if Communication Skills course exists
    let course = await Programme.findOne({ slug: "communication-skills" });
    
    if (course) {
      console.log('✅ Communication Skills course already exists:', course.title);
      console.log('   ID:', course._id);
      console.log('   Slug:', course.slug);
    } else {
      console.log('📚 Creating Communication Skills course...');
      course = new Programme(communicationSkillsCourse);
      await course.save();
      console.log('✅ Communication Skills course created:', course.title);
      console.log('   ID:', course._id);
      console.log('   Slug:', course.slug);
    }
    
    // Check all courses
    const allCourses = await Programme.find({});
    console.log('\n📋 All courses in database:');
    allCourses.forEach((c, index) => {
      console.log(`${index + 1}. ${c.title} (${c.slug}) - ID: ${c._id}`);
    });
    
    // Create mapping
    const mapping = {};
    allCourses.forEach(c => {
      mapping[c.slug] = c._id.toString();
    });
    
    console.log('\n🔗 Course mapping for frontend:');
    console.log(JSON.stringify(mapping, null, 2));
    
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

setupCommunicationSkillsCourse();
