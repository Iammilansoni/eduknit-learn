const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Schema with slug field
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

async function updateProgrammeSlugs() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        console.log('🔄 Updating programme slugs...');
        
        // Get all programmes
        const programmes = await Programme.find({});
        console.log(`Found ${programmes.length} programmes to update`);
        
        for (const programme of programmes) {
            // Generate slug from title
            const slug = programme.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .trim();
            
            // Update the programme with the slug
            await Programme.findByIdAndUpdate(programme._id, { slug });
            console.log(`✅ Updated "${programme.title}" with slug: "${slug}"`);
        }
        
        console.log('🎉 All programme slugs updated successfully!');
        
        // Show the final mapping
        const updatedProgrammes = await Programme.find({}).select('title slug _id');
        console.log('\n📋 Final Course Mapping:');
        console.log('const courseSlugToId = {');
        updatedProgrammes.forEach(programme => {
            console.log(`  '${programme.slug}': '${programme._id}', // ${programme.title}`);
        });
        console.log('};');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error updating programme slugs:', error);
        process.exit(1);
    }
}

updateProgrammeSlugs(); 