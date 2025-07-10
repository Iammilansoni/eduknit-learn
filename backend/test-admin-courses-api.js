const { default: fetch } = require('node-fetch');

async function testAdminCoursesAPI() {
  try {
    console.log('Testing /api/admin/courses endpoint...');
    
    const response = await fetch('http://localhost:5000/api/admin/courses?limit=100', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: In production, this would need authentication
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.courses) {
      console.log(`\nTotal courses returned: ${data.data.courses.length}`);
      data.data.courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course.category})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAdminCoursesAPI();
