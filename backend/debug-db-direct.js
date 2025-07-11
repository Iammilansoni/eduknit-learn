const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

async function checkCourseData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => console.log(' -', col.name));

    // Get all documents from programmes collection
    const programmes = await mongoose.connection.db.collection('programmes').find({}).toArray();
    console.log(`\nFound ${programmes.length} programmes:`);
    programmes.forEach(prog => {
      console.log(`- ID: ${prog._id}`);
      console.log(`  Title: ${prog.title}`);
      console.log(`  Slug: ${prog.slug}`);
      console.log(`  Category: ${prog.category}`);
      console.log(`  Active: ${prog.isActive}`);
      console.log('');
    });

    // Check modules
    const modules = await mongoose.connection.db.collection('programmemodules').find({}).toArray();
    console.log(`Found ${modules.length} modules:`);
    modules.forEach(mod => {
      console.log(`- ${mod.title} (Programme ID: ${mod.programmeId})`);
    });

    // Check lessons
    const lessons = await mongoose.connection.db.collection('programmelessons').find({}).toArray();
    console.log(`\nFound ${lessons.length} lessons`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkCourseData();
