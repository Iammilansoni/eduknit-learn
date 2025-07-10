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

async function checkCourseMapping() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all active programmes
    const programmes = await Programme.find({ isActive: true });
    console.log(`Found ${programmes.length} active programmes in the database:\n`);
    
    const mapping = {};
    
    programmes.forEach(programme => {
      const slug = programme.slug || programme.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      mapping[slug] = programme._id.toString();
      
      console.log(`- ${programme.title}`);
      console.log(`  ID: ${programme._id}`);
      console.log(`  Slug: ${slug}`);
      console.log(`  Has slug field: ${!!programme.slug}`);
      console.log('');
    });

    console.log('=== Course Mapping ===');
    console.log('const courseSlugToId = {');
    Object.entries(mapping).forEach(([slug, id]) => {
      console.log(`  '${slug}': '${id}',`);
    });
    console.log('};');

    // Check which courses are missing slugs
    const coursesWithoutSlugs = programmes.filter(p => !p.slug);
    if (coursesWithoutSlugs.length > 0) {
      console.log('\n=== Courses without slugs ===');
      coursesWithoutSlugs.forEach(course => {
        console.log(`- ${course.title} (ID: ${course._id})`);
      });
    }

    // Test the mapping
    console.log('\n=== Testing Frontend URLs ===');
    const testUrls = [
      'communication-skills',
      'digital-marketing',
      'basics-of-ai',
      'ai-prompt-crafting',
      'data-analytics',
      'bioskills',
      'decision-making'
    ];

    testUrls.forEach(url => {
      const id = mapping[url];
      if (id) {
        console.log(`✅ ${url} -> ${id}`);
      } else {
        console.log(`❌ ${url} -> NOT FOUND`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkCourseMapping(); 