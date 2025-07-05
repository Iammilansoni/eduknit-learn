# JWT Configuration Guide

This document provides comprehensive information about the JWT (JSON Web Token) configuration and usage in the EduKnit Learn application.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Security Features](#security-features)
4. [Token Types](#token-types)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The application uses JWT for secure authentication and authorization. We implement a dual-token system with access tokens (short-lived) and refresh tokens (long-lived) for enhanced security.

## Configuration

### Environment Variables

```bash
# JWT Secrets (Generated securely)
JWT_SECRET=19f93c2522885fa75ec8193d1834684d147e8120c4fa8ea70c1cba704d883c958459e4aade772d5467fea8847f905f3e7ffeedc3fffe972097dc2780ee1d27d0
JWT_REFRESH_SECRET=fa260bc51e732dc2c8fbb002698ad5c28d9b4aaf772ecccb385fc531c2808fdd18221cdda0c2f165bc5e9e0163c6a5d1c8ca481f420677c762c30c2e51a70142

# Token Expiration
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# JWT Algorithm
JWT_ALGORITHM=HS256

# JWT Issuer and Audience
JWT_ISSUER=eduknit-learn
JWT_AUDIENCE=eduknit-learn-users
```

### Configuration Object

```typescript
export const JWT_CONFIG = {
  ACCESS_TOKEN: {
    SECRET: process.env.JWT_SECRET!,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    ALGORITHM: 'HS256',
    ISSUER: 'eduknit-learn',
    AUDIENCE: 'eduknit-learn-users',
  },
  REFRESH_TOKEN: {
    SECRET: process.env.JWT_REFRESH_SECRET!,
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ALGORITHM: 'HS256',
    ISSUER: 'eduknit-learn',
    AUDIENCE: 'eduknit-learn-users',
  },
  COOKIE: {
    ACCESS_TOKEN_NAME: 'accessToken',
    REFRESH_TOKEN_NAME: 'refreshToken',
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  }
};
```

## Security Features

### 1. Dual Token System
- **Access Token**: Short-lived (1 hour) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

### 2. HTTP-Only Cookies
- Tokens stored in HTTP-only cookies to prevent XSS attacks
- Secure flag enabled in production
- SameSite attribute configured for CSRF protection

### 3. Token Validation
- Algorithm verification (HS256)
- Issuer and audience validation
- Expiration time validation
- Signature verification

### 4. Secure Secrets
- 64-byte (512-bit) random secrets
- Separate secrets for access and refresh tokens
- Environment variable storage

## Token Types

### Access Token Payload
```typescript
interface AccessTokenPayload {
  user: {
    id: string;
    role: string;
  };
}
```

### Refresh Token Payload
```typescript
interface RefreshTokenPayload {
  user: {
    id: string;
    role: string;
  };
}
```

## Usage Examples

### 1. Generate Tokens

```typescript
import { JWTUtils } from '../config/jwt';

const payload = {
  user: {
    id: 'user123',
    role: 'user'
  }
};

// Generate individual tokens
const accessToken = JWTUtils.generateAccessToken(payload);
const refreshToken = JWTUtils.generateRefreshToken(payload);

// Generate token pair
const { accessToken, refreshToken } = JWTUtils.generateTokenPair(payload);
```

### 2. Verify Tokens

```typescript
import { JWTUtils } from '../config/jwt';

try {
  const payload = JWTUtils.verifyAccessToken(token);
  console.log('User ID:', payload.user.id);
  console.log('User Role:', payload.user.role);
} catch (error) {
  console.error('Token verification failed:', error.message);
}
```

### 3. Set Tokens in Cookies

```typescript
import { JWTUtils } from '../config/jwt';

JWTUtils.setTokensInCookies(res, accessToken, refreshToken);
```

### 4. Clear Tokens from Cookies

```typescript
import { JWTUtils } from '../config/jwt';

JWTUtils.clearTokensFromCookies(res);
```

### 5. Extract Tokens

```typescript
import { JWTUtils } from '../config/jwt';

// From Authorization header
const token = JWTUtils.extractTokenFromHeader(req);

// From cookies
const accessToken = JWTUtils.extractTokenFromCookies(req, 'accessToken');
const refreshToken = JWTUtils.extractTokenFromCookies(req, 'refreshToken');
```

### 6. Check Token Expiration

```typescript
import { JWTUtils } from '../config/jwt';

const isExpired = JWTUtils.isTokenExpired(token);
const expiration = JWTUtils.getTokenExpiration(token);
```

### 7. Authentication Middleware

```typescript
import { createJWTMiddleware } from '../config/jwt';

// Access token middleware
const authenticateAccess = createJWTMiddleware('access');

// Refresh token middleware
const authenticateRefresh = createJWTMiddleware('refresh');

// Use in routes
app.get('/protected', authenticateAccess, (req, res) => {
  // req.user contains the decoded payload
  res.json({ user: req.user });
});
```

## Best Practices

### 1. Secret Management
- Never commit secrets to version control
- Use environment variables for secrets
- Rotate secrets periodically in production
- Use different secrets for different environments

### 2. Token Security
- Keep access tokens short-lived (1 hour or less)
- Use refresh tokens for longer sessions
- Implement token blacklisting for logout
- Validate tokens on every request

### 3. Cookie Security
- Use HTTP-only cookies
- Enable secure flag in production
- Set appropriate SameSite attribute
- Use proper cookie expiration times

### 4. Error Handling
- Handle token expiration gracefully
- Implement automatic token refresh
- Log security events
- Return appropriate HTTP status codes

### 5. Token Payload
- Keep payload minimal
- Don't store sensitive information
- Use user ID and role for authorization
- Avoid storing passwords or personal data

## Troubleshooting

### Common Issues

#### 1. "Token not provided" Error
- Check if token is being sent in Authorization header
- Verify cookie settings
- Ensure frontend is sending tokens correctly

#### 2. "Token expired" Error
- Implement token refresh logic
- Check token expiration settings
- Verify system clock synchronization

#### 3. "Invalid token" Error
- Verify token signature
- Check if token was tampered with
- Ensure correct secret is being used

#### 4. Cookie Issues
- Check SameSite attribute settings
- Verify secure flag configuration
- Test in different browsers

### Validation Script

Run the JWT validation script to check your configuration:

```bash
npm run validate-jwt
```

This script will:
- Check environment variables
- Validate JWT configuration
- Test token generation and verification
- Display configuration details

### Debug Mode

Enable debug logging for JWT operations:

```typescript
// Add to your environment variables
DEBUG_JWT=true
```

## Security Considerations

### 1. Token Storage
- Store tokens in HTTP-only cookies
- Never store tokens in localStorage
- Implement proper token cleanup on logout

### 2. Token Transmission
- Use HTTPS in production
- Implement CSRF protection
- Validate token origin

### 3. Token Rotation
- Implement refresh token rotation
- Blacklist old refresh tokens
- Monitor for suspicious activity

### 4. Rate Limiting
- Implement rate limiting on auth endpoints
- Prevent brute force attacks
- Monitor failed authentication attempts

## Production Checklist

- [ ] Generate new secure secrets for production
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Test token refresh flow
- [ ] Validate all security headers
- [ ] Implement proper error handling
- [ ] Set up token blacklisting

## Additional Resources

- [JWT.io](https://jwt.io/) - JWT Debugger and Documentation
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JSON Web Token Standard
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.html) 