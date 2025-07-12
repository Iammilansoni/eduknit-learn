# 🔍 Quiz Issue Debugging Guide

## Problem
User created a quiz via admin panel but it doesn't show on the student lesson page.

## Frontend URL Issue
- User mentioned: `http://localhost:5173`
- Our frontend is running on: `http://localhost:5174`
- **Action needed**: Use the correct frontend URL

## Debugging Steps

### 1. Check Browser Console
Open `http://localhost:5174/student-dashboard/lessons/6871418b22d319e99ce98ff1` and look for:
```
🔍 Checking for quiz for lesson: 6871418b22d319e99ce98ff1
📊 Quiz API response: {...}
✅ Quiz found for lesson: ... Questions: X
```

### 2. Check Network Tab
Look for request to `/api/quiz/lesson/6871418b22d319e99ce98ff1`:
- Status: Should be 200
- Response: Should contain quiz data

### 3. Common Issues & Solutions

#### Issue A: 401 Unauthorized
**Cause**: Student not logged in
**Solution**: Ensure user is logged in with student/user role

#### Issue B: 404 Not Found  
**Cause**: Lesson doesn't exist or has no quiz
**Solution**: Verify lesson exists and has quiz data

#### Issue C: 403 Forbidden
**Cause**: Student not enrolled in course
**Solution**: Ensure student is enrolled in the course

#### Issue D: Quiz data structure issue
**Cause**: Quiz data stored in wrong format
**Solution**: Check database lesson.content.quiz structure

## Quick Fixes to Try

### Fix 1: Update URL
Use correct frontend URL: `http://localhost:5174`

### Fix 2: Clear Browser Cache
Clear cookies and localStorage, then login again

### Fix 3: Check Admin Quiz Creation
1. Go to Admin → Lesson Management
2. Find lesson `6871418b22d319e99ce98ff1`
3. Click quiz button (🅠)
4. Verify quiz has questions saved

### Fix 4: Check Student Enrollment
Ensure the student account is enrolled in the course containing this lesson
