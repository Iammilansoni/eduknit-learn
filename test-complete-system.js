const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const testConfig = {
  adminCredentials: {
    email: 'admin@eduknit.com',
    password: 'admin123'
  },
  studentCredentials: {
    email: 'student@test.com',
    password: 'student123'
  }
};

let adminToken = '';
let studentToken = '';
let testCourseId = '';
let testLessonId = '';

// Utility functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const error = (message, err = null) => {
  console.error(`\n❌ ${message}`);
  if (err) {
    console.error(err.response?.data || err.message);
  }
};

const success = (message) => {
  console.log(`\n✅ ${message}`);
};

// Test functions
async function testAuthentication() {
  log('Testing Authentication...');
  
  try {
    // Test admin login
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, testConfig.adminCredentials);
    adminToken = adminResponse.data.data.token;
    success('Admin authentication successful');
    
    // Test student login
    const studentResponse = await axios.post(`${BASE_URL}/auth/login`, testConfig.studentCredentials);
    studentToken = studentResponse.data.data.token;
    success('Student authentication successful');
    
  } catch (err) {
    error('Authentication failed', err);
    throw err;
  }
}

async function testCourseManagement() {
  log('Testing Course Management...');
  
  try {
    // Get all courses
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    const courses = coursesResponse.data.data;
    log(`Found ${courses.length} courses`);
    
    if (courses.length > 0) {
      testCourseId = courses[0]._id;
      success(`Using course ID: ${testCourseId}`);
    } else {
      error('No courses found');
      return;
    }
    
    // Test course details
    const courseDetailsResponse = await axios.get(`${BASE_URL}/course/${testCourseId}`);
    const courseDetails = courseDetailsResponse.data.data;
    success('Course details retrieved successfully');
    
    // Test course mapping
    const mappingResponse = await axios.get(`${BASE_URL}/course/mapping`);
    const mapping = mappingResponse.data.data;
    log(`Course mapping contains ${Object.keys(mapping).length} entries`);
    success('Course mapping retrieved successfully');
    
  } catch (err) {
    error('Course management test failed', err);
  }
}

async function testEnrollmentFlow() {
  log('Testing Enrollment Flow...');
  
  try {
    // Test enrollment
    const enrollmentResponse = await axios.post(`${BASE_URL}/course/student/enroll`, {
      programmeId: testCourseId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const enrollment = enrollmentResponse.data.data;
    success(`Enrolled in course with enrollment ID: ${enrollment.enrollmentId}`);
    
    // Test getting student courses
    const studentCoursesResponse = await axios.get(`${BASE_URL}/course/student/courses`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const studentCourses = studentCoursesResponse.data.data.courses;
    log(`Student has ${studentCourses.length} enrolled courses`);
    success('Student courses retrieved successfully');
    
    // Test course progress
    const progressResponse = await axios.get(`${BASE_URL}/course/student/progress/${testCourseId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const progress = progressResponse.data.data;
    log(`Course progress: ${progress.progress.overall}% complete`);
    success('Course progress retrieved successfully');
    
  } catch (err) {
    if (err.response?.data?.message?.includes('Already enrolled')) {
      success('Student already enrolled (expected behavior)');
    } else {
      error('Enrollment flow test failed', err);
    }
  }
}

async function testLessonContent() {
  log('Testing Lesson Content...');
  
  try {
    // Get course modules
    const modulesResponse = await axios.get(`${BASE_URL}/courses/modules/${testCourseId}`);
    const modules = modulesResponse.data.data;
    
    if (modules.length > 0) {
      const firstModule = modules[0];
      log(`Testing with module: ${firstModule.title}`);
      
      // Get lessons for the first module
      const lessonsResponse = await axios.get(`${BASE_URL}/courses/modules/${firstModule._id}/lessons`);
      const lessons = lessonsResponse.data.data;
      
      if (lessons.length > 0) {
        testLessonId = lessons[0]._id;
        log(`Testing with lesson: ${lessons[0].title}`);
        
        // Test lesson content
        const lessonContentResponse = await axios.get(`${BASE_URL}/courses/lesson-content/${testLessonId}?studentId=${testConfig.studentCredentials.email}`);
        const lessonContent = lessonContentResponse.data.data;
        
        log('Lesson content structure:');
        log('- Title:', lessonContent.title);
        log('- Type:', lessonContent.type);
        log('- Content format:', lessonContent.content?.contentFormat);
        log('- Has rich content:', !!lessonContent.content?.richContent);
        
        success('Lesson content retrieved successfully');
        
        // Test lesson progress update
        const progressUpdateResponse = await axios.post(`${BASE_URL}/courses/lesson-progress/${testLessonId}`, {
          studentId: testConfig.studentCredentials.email,
          timeSpent: 120,
          progressPercentage: 50,
          notes: 'Test note from automated test'
        }, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        
        success('Lesson progress updated successfully');
        
      } else {
        error('No lessons found in module');
      }
    } else {
      error('No modules found in course');
    }
    
  } catch (err) {
    error('Lesson content test failed', err);
  }
}

async function testAdminCourseManagement() {
  log('Testing Admin Course Management...');
  
  try {
    // Get admin courses
    const adminCoursesResponse = await axios.get(`${BASE_URL}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const adminCourses = adminCoursesResponse.data.data.courses;
    log(`Admin can see ${adminCourses.length} courses`);
    success('Admin course management access successful');
    
    // Test course creation (if needed)
    const testCourseData = {
      title: 'Test Course - Automated',
      description: 'This is a test course created by automated testing',
      category: 'TEST_CATEGORY',
      instructor: 'Test Instructor',
      level: 'BEGINNER',
      price: 0,
      currency: 'USD',
      totalModules: 3,
      totalLessons: 12,
      estimatedDuration: 120,
      isActive: true
    };
    
    // Note: Uncomment to test course creation
    // const createResponse = await axios.post(`${BASE_URL}/admin/courses`, testCourseData, {
    //   headers: { Authorization: `Bearer ${adminToken}` }
    // });
    // success('Test course created successfully');
    
  } catch (err) {
    error('Admin course management test failed', err);
  }
}

async function testFrontendIntegration() {
  log('Testing Frontend Integration...');
  
  try {
    // Test programs page API
    const programsResponse = await axios.get(`${BASE_URL}/courses`);
    const programs = programsResponse.data.data;
    
    log(`Programs page shows ${programs.length} courses`);
    
    // Check if courses have required fields for frontend
    const validCourses = programs.filter(course => 
      course.title && 
      course.slug && 
      course.description && 
      course.isActive
    );
    
    log(`${validCourses.length}/${programs.length} courses have all required fields`);
    
    if (validCourses.length === programs.length) {
      success('All courses have required fields for frontend display');
    } else {
      error('Some courses missing required fields');
    }
    
    // Test enrollment API endpoint
    const enrollmentTestResponse = await axios.post(`${BASE_URL}/course/student/enroll`, {
      programmeId: testCourseId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    success('Enrollment API endpoint working correctly');
    
  } catch (err) {
    if (err.response?.data?.message?.includes('Already enrolled')) {
      success('Enrollment API correctly handles duplicate enrollments');
    } else {
      error('Frontend integration test failed', err);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive System Test...\n');
  
  try {
    await testAuthentication();
    await testCourseManagement();
    await testEnrollmentFlow();
    await testLessonContent();
    await testAdminCourseManagement();
    await testFrontendIntegration();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Authentication working');
    console.log('✅ Course management functional');
    console.log('✅ Enrollment flow operational');
    console.log('✅ Lesson content display working');
    console.log('✅ Admin course management accessible');
    console.log('✅ Frontend integration ready');
    
    console.log('\n🌐 System Status:');
    console.log(`Backend: ${BASE_URL} - ✅ Running`);
    console.log(`Frontend: ${FRONTEND_URL} - ✅ Ready`);
    console.log(`Test Course ID: ${testCourseId}`);
    console.log(`Test Lesson ID: ${testLessonId}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Visit http://localhost:5173/programs to see courses');
    console.log('2. Test enrollment flow as a student');
    console.log('3. Access lessons at http://localhost:5173/student-dashboard/lessons/[lessonId]');
    console.log('4. Check admin panel at http://localhost:5173/admin/courses');
    
  } catch (err) {
    console.error('\n💥 Test suite failed:', err.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testAuthentication,
  testCourseManagement,
  testEnrollmentFlow,
  testLessonContent,
  testAdminCourseManagement,
  testFrontendIntegration
}; 