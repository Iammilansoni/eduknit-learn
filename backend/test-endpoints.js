// Quick test script to verify our new API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample test data
const testStudentId = '507f1f77bcf86cd799439011'; // Mock ObjectId
const testProgrammeId = '507f1f77bcf86cd799439012'; // Mock ObjectId
const testModuleId = '507f1f77bcf86cd799439013'; // Mock ObjectId
const testLessonId = '507f1f77bcf86cd799439014'; // Mock ObjectId

// Test endpoints (without authentication for quick verification)
async function testEndpoints() {
    console.log('🧪 Testing EduKnit Learn API Endpoints\n');

    const tests = [
        // Course Content Endpoints
        {
            name: 'GET /courses',
            url: `${BASE_URL}/courses`,
            method: 'GET'
        },
        {
            name: 'GET /courses/:id/modules',
            url: `${BASE_URL}/courses/${testProgrammeId}/modules?studentId=${testStudentId}`,
            method: 'GET'
        },
        {
            name: 'GET /modules/:id/lessons',
            url: `${BASE_URL}/modules/${testModuleId}/lessons?studentId=${testStudentId}`,
            method: 'GET'
        },
        {
            name: 'GET /lessons/:id',
            url: `${BASE_URL}/lessons/${testLessonId}?studentId=${testStudentId}`,
            method: 'GET'
        },
        {
            name: 'GET /courses/:id',
            url: `${BASE_URL}/courses/${testProgrammeId}`,
            method: 'GET'
        },
        
        // Progress Endpoints (these require authentication)
        {
            name: 'GET /progress/next-module',
            url: `${BASE_URL}/progress/next-module?studentId=${testStudentId}&programmeId=${testProgrammeId}`,
            method: 'GET',
            requiresAuth: true
        },
        {
            name: 'GET /progress/statistics',
            url: `${BASE_URL}/progress/statistics?studentId=${testStudentId}`,
            method: 'GET',
            requiresAuth: true
        },
        
        // Integration Endpoints (these require authentication)
        {
            name: 'GET /integrations/discord/updates',
            url: `${BASE_URL}/integrations/discord/updates?limit=5`,
            method: 'GET',
            requiresAuth: true
        },
        {
            name: 'GET /integrations/discord/server-info',
            url: `${BASE_URL}/integrations/discord/server-info`,
            method: 'GET',
            requiresAuth: true
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}`);
            
            if (test.requiresAuth) {
                console.log(`  ⚠️  Skipped (requires authentication): ${test.url}`);
                continue;
            }

            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000,
                validateStatus: () => true // Don't throw on 4xx/5xx status codes
            });

            if (response.status >= 200 && response.status < 300) {
                console.log(`  ✅ Success (${response.status}): ${test.url}`);
            } else if (response.status === 404) {
                console.log(`  📭 Not Found (${response.status}): ${test.url} - This is expected for test data`);
            } else if (response.status === 401) {
                console.log(`  🔒 Unauthorized (${response.status}): ${test.url} - Authentication required`);
            } else {
                console.log(`  ❌ Error (${response.status}): ${test.url}`);
                console.log(`     Response: ${JSON.stringify(response.data, null, 2)}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`  🔌 Connection Refused: Server is not running on ${BASE_URL}`);
                break;
            } else {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }
        console.log();
    }

    console.log('🏁 Endpoint testing complete!');
    console.log('\n📝 Notes:');
    console.log('- Start the backend server with: npm run dev');
    console.log('- 404 errors for test data are expected');
    console.log('- Authentication required endpoints need valid JWT tokens');
    console.log('- To test authenticated endpoints, use the frontend or create a valid JWT token');
}

// Run the tests
testEndpoints().catch(console.error);
