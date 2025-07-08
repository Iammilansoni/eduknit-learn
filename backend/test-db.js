const mongoose = require('mongoose');
require('dotenv').config();

async function testDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    
    // Test basic operation
    const testSchema = new mongoose.Schema({ test: String });
    const Test = mongoose.model('Test', testSchema);
    
    const testDoc = new Test({ test: 'connection test' });
    await testDoc.save();
    console.log('✅ Test document saved successfully!');
    
    await testDoc.deleteOne();
    console.log('✅ Test document deleted successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testDB();
