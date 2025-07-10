const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Module Schema
const programmeModuleSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme' },
  title: String,
  description: String,
  orderIndex: Number,
  isUnlocked: Boolean,
  estimatedDuration: Number,
  totalLessons: Number,
  prerequisites: [mongoose.Schema.Types.ObjectId],
  dueDate: Date,
  learningObjectives: [String],
  isActive: Boolean
}, { timestamps: true });

const ProgrammeModule = mongoose.model('ProgrammeModule', programmeModuleSchema);

async function checkModules() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all modules
    const modules = await ProgrammeModule.find({}).populate('programmeId', 'title');
    console.log(`Total modules in database: ${modules.length}`);
    
    if (modules.length > 0) {
      console.log('\n=== All Modules ===');
      modules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (Course: ${module.programmeId?.title || 'Unknown'}) - Active: ${module.isActive}`);
      });
    } else {
      console.log('\nNo modules found in database!');
      console.log('This explains why the admin UI shows 0 modules.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking modules:', error);
    process.exit(1);
  }
}

checkModules();
