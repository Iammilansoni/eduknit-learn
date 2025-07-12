const fs = require('fs');
const path = require('path');

// Check if uploads directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

console.log('Testing profile photo directories...');
console.log('Current working directory:', process.cwd());
console.log('Uploads directory:', uploadsDir);
console.log('Profiles directory:', profilesDir);

console.log('\nDirectory status:');
console.log('Uploads exists:', fs.existsSync(uploadsDir));
console.log('Profiles exists:', fs.existsSync(profilesDir));

if (fs.existsSync(profilesDir)) {
  try {
    const files = fs.readdirSync(profilesDir);
    console.log('\nFiles in profiles directory:', files);
    
    if (files.length > 0) {
      const firstFile = files[0];
      const filePath = path.join(profilesDir, firstFile);
      const stats = fs.statSync(filePath);
      
      console.log(`\nFirst file details:
        Name: ${firstFile}
        Size: ${stats.size} bytes
        Created: ${stats.birthtime}
        Modified: ${stats.mtime}
        Full path: ${filePath}
      `);
      
      // Test URL generation
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BACKEND_URL || 'https://api.eduknit.com'
        : `http://localhost:${process.env.PORT || 5000}`;
      
      const photoUrl = `${baseUrl}/uploads/profiles/${firstFile}`;
      console.log(`Generated URL: ${photoUrl}`);
    }
  } catch (error) {
    console.error('Error reading profiles directory:', error);
  }
}

// Test initials avatar generation
function generateInitialsAvatar(firstName, lastName, username, email) {
  let initials = '';
  
  if (firstName && lastName) {
    initials = (firstName[0] + lastName[0]).toUpperCase();
  } else if (firstName) {
    initials = firstName[0].toUpperCase();
  } else if (username) {
    initials = username[0].toUpperCase();
  } else if (email) {
    initials = email[0].toUpperCase();
  } else {
    initials = 'U';
  }
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  const canvas = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${backgroundColor}"/>
    <text x="100" y="115" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

console.log('\nTesting initials avatar generation:');
const testAvatar = generateInitialsAvatar('John', 'Doe', 'johndoe', 'john@example.com');
console.log('Test avatar URL length:', testAvatar.length);
console.log('Test avatar starts with:', testAvatar.substring(0, 50) + '...');
