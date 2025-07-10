const { execSync } = require('child_process');

try {
  console.log('🔄 Running update-programme-slugs.js...');
  execSync('node update-programme-slugs.js', { stdio: 'inherit' });

  console.log('\n🔍 Running check-course-mapping.js...');
  execSync('node check-course-mapping.js', { stdio: 'inherit' });

  console.log('\n✅ Slug update and mapping check complete!');
} catch (error) {
  console.error('❌ Error during slug update/check:', error.message);
  process.exit(1);
} 