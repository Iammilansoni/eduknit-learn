const axios = require('axios');

async function testCompleteSystem() {
  console.log('🧪 Testing Complete My Courses & Analytics System\n');
  
  try {
    // Create axios instance with cookie handling
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'milansoni96946@gmail.com',
      password: 'Milansoni1$'
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.data.username);
    
    // Step 2: Test My Courses endpoint
    console.log('\n2️⃣ Testing My Courses endpoint...');
    const enrollmentsResponse = await api.get('/student/enrollments');
    
    console.log('✅ My Courses endpoint working');
    console.log('Enrollments found:', enrollmentsResponse.data.data.enrollments.length);
    
    // Step 3: Test enrollment in a course
    console.log('\n3️⃣ Testing course enrollment...');
    const enrollmentResponse = await api.post('/student/enroll', {
      programmeId: '686f5f0185350adfe788358a'
    });
    
    console.log('✅ Enrollment successful');
    console.log('Enrollment ID:', enrollmentResponse.data.data.id);
    
    // Step 4: Test lesson completion
    console.log('\n4️⃣ Testing lesson completion...');
    const lessonCompletionResponse = await api.post('/student/lesson/complete', {
      enrollmentId: enrollmentResponse.data.data.id,
      lessonId: 'test-lesson-id',
      timeSpent: 30
    });
    
    console.log('✅ Lesson completion working');
    console.log('Updated progress:', lessonCompletionResponse.data.data.enrollment.progress.totalProgress + '%');
    
    // Step 5: Test analytics endpoint
    console.log('\n5️⃣ Testing analytics endpoint...');
    const analyticsResponse = await api.get('/student/analytics');
    
    console.log('✅ Analytics endpoint working');
    console.log('Total enrollments:', analyticsResponse.data.data.overview.totalEnrollments);
    
    // Step 6: Test dashboard endpoint
    console.log('\n6️⃣ Testing dashboard endpoint...');
    const dashboardResponse = await api.get('/student/dashboard');
    
    console.log('✅ Dashboard endpoint working');
    console.log('Active enrollments:', dashboardResponse.data.data.stats.inProgressCourses);
    
    console.log('\n🎉 All tests passed! The system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- Authentication: ✅ Working');
    console.log('- My Courses: ✅ Working');
    console.log('- Enrollment: ✅ Working');
    console.log('- Progress Tracking: ✅ Working');
    console.log('- Analytics: ✅ Working');
    console.log('- Dashboard: ✅ Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

testCompleteSystem(); 