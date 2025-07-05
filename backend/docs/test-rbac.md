# RBAC Implementation Test Guide

## Backend RBAC Tests

### 1. Test Student Dashboard Access

#### Test 1: Unauthenticated Access
```bash
curl -X GET http://localhost:5000/api/student/dashboard
# Expected: 401 Unauthorized
```

#### Test 2: Admin Access (Should be denied)
```bash
# First login as admin and get cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduknit.com","password":"Admin123!"}' \
  -c cookies.txt

# Try to access student dashboard
curl -X GET http://localhost:5000/api/student/dashboard \
  -b cookies.txt
# Expected: 403 Forbidden - Insufficient permissions
```

#### Test 3: Student Access (Should succeed)
```bash
# First login as student and get cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@eduknit.com","password":"User123!"}' \
  -c student_cookies.txt

# Access student dashboard
curl -X GET http://localhost:5000/api/student/dashboard \
  -b student_cookies.txt
# Expected: 200 OK with dashboard data
```

### 2. Test Student Profile Access

#### Test 1: Student Profile GET
```bash
curl -X GET http://localhost:5000/api/student/profile \
  -b student_cookies.txt
# Expected: 200 OK with student profile data
```

#### Test 2: Student Profile UPDATE
```bash
curl -X PUT http://localhost:5000/api/student/profile \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated","lastName":"Student"}' \
  -b student_cookies.txt
# Expected: 200 OK with updated profile data
```

## Frontend RBAC Tests

### 1. Protected Route Tests

1. **Navigate to `/student-dashboard` without login**
   - Expected: Redirect to `/login`

2. **Login as admin and navigate to `/student-dashboard`**
   - Expected: Redirect to `/admin/dashboard`

3. **Login as student and navigate to `/student-dashboard`**
   - Expected: Successfully access student dashboard

4. **Login as visitor and navigate to `/student-dashboard`**
   - Expected: Redirect to `/visitor`

### 2. Role-Based UI Tests

1. **Check navigation menu for different roles**
   - Admin: Should see admin-specific menu items
   - Student: Should see student-specific menu items
   - Visitor: Should see visitor-specific menu items

## Test User Creation Scripts

### Create Test Users

Run these commands in your backend to create test users:

```bash
# Create admin user
npm run create-admin

# Create student user (you'll need to create this script)
```

Or manually create users via registration with different roles.

## Expected Responses

### Successful Student Dashboard Response
```json
{
  "success": true,
  "message": "Student dashboard data retrieved successfully",
  "data": {
    "student": {
      "id": "...",
      "username": "...",
      "email": "...",
      "role": "student",
      "enrollmentStatus": "active"
    },
    "stats": {
      "totalCourses": 0,
      "completedCourses": 0,
      "inProgressCourses": 0,
      "averageGrade": 0
    },
    "recentActivity": [],
    "upcomingDeadlines": [],
    "notifications": []
  }
}
```

### Failed Access Response
```json
{
  "success": false,
  "message": "Access denied: Insufficient permissions"
}
```

## Verification Checklist

- [ ] Student dashboard requires authentication
- [ ] Student dashboard requires 'student' role
- [ ] Admin cannot access student dashboard
- [ ] Visitor cannot access student dashboard
- [ ] User with 'user' role can access student dashboard (backward compatibility)
- [ ] Frontend protects routes properly
- [ ] Unauthorized access redirects correctly
- [ ] Role-based navigation works
- [ ] API returns proper error codes (401, 403)
- [ ] Registration creates users with 'student' role by default
