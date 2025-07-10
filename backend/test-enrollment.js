const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define Programme Schema
const programmeSchema = new mongoose.Schema({
  title: String,
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

async function testEnrollment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if there are any programmes in the database
    const programmes = await Programme.find({});
    console.log(`Found ${programmes.length} programmes in the database:`);
    
    programmes.forEach(programme => {
      const slug = programme.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      console.log(`- ${programme.title} (ID: ${programme._id}, Slug: ${slug})`);
    });

    if (programmes.length === 0) {
      console.log('\nNo programmes found. Creating a test programme...');
      
      // Create a test programme
      const testProgramme = new Programme({
        title: 'Communication Skills',
        description: 'Speak with confidence! Build communication skills through group discussions, debates, presentations, and real practice with peers and coaches.',
        category: 'PROFESSIONAL_SKILLS',
        instructor: 'Dr. Sarah Johnson',
        duration: '3-5 hours/week',
        timeframe: '1-2 months',
        level: 'BEGINNER',
        price: 99,
        currency: 'USD',
        overview: 'Master the art of effective communication through practical exercises.',
        skills: ['Public Speaking', 'Active Listening', 'Presentation Skills'],
        prerequisites: ['Basic English proficiency'],
        isActive: true,
        totalModules: 4,
        totalLessons: 24,
        estimatedDuration: 40,
        durationDays: 60,
        certificateAwarded: true,
        createdBy: new mongoose.Types.ObjectId(),
        lastModifiedBy: new mongoose.Types.ObjectId()
      });

      await testProgramme.save();
      console.log(`Created test programme: ${testProgramme.title} with ID: ${testProgramme._id}`);
      
      const slug = testProgramme.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      console.log(`\nFrontend mapping should be:`);
      console.log(`'${slug}': '${testProgramme._id}',`);
    }

    console.log('\n=== Testing Enrollment Endpoint ===');
    console.log('To test the enrollment endpoint, you can use:');
    console.log('curl -X POST http://localhost:5000/api/student/enroll \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log('  -d \'{"programmeId": "PROGRAMME_ID_HERE"}\'');

    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testEnrollment(); 