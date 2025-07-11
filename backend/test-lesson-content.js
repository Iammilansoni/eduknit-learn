const fs = require('fs');

console.log('Testing lesson content endpoint configuration...');

// Check if courseContent routes file exists and has the route
if (fs.existsSync('./src/routes/courseContent.ts')) {
  console.log('✓ courseContent.ts file exists');
  const content = fs.readFileSync('./src/routes/courseContent.ts', 'utf8');
  
  if (content.includes('lesson-content/:lessonId')) {
    console.log('✓ Route lesson-content/:lessonId found in file');
  } else {
    console.log('✗ Route lesson-content/:lessonId NOT found in file');
  }
  
  if (content.includes('getLessonContent')) {
    console.log('✓ getLessonContent function imported');
  } else {
    console.log('✗ getLessonContent function NOT imported');
  }
} else {
  console.log('✗ courseContent.ts file does not exist');
}

// Check if index.ts has the courseContent routes registered
if (fs.existsSync('./src/index.ts')) {
  console.log('✓ index.ts file exists');
  const content = fs.readFileSync('./src/index.ts', 'utf8');
  
  if (content.includes('courseContentRoutes')) {
    console.log('✓ courseContentRoutes imported');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('courseContentRoutes') || line.includes('/api/courses')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log('✗ courseContentRoutes NOT found');
  }
} else {
  console.log('✗ index.ts file does not exist');
}

console.log('\nDone testing lesson content endpoint configuration.');
