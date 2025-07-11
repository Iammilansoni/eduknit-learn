const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

async function testConnection() {
  try {
    console.log('Attempting to connect to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(col => console.log('  -', col.name));
    
    await mongoose.connection.close();
    console.log('🔚 Connection closed');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
