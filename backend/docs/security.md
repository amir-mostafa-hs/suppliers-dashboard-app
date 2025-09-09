# Backend - Security Guidelines

**Last Updated:** September 9, 2025  
**Author:** Security Team  
**Status:** Active

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication Security](#authentication-security)
- [Authorization & Access Control](#authorization--access-control)
- [Data Protection](#data-protection)
- [File Upload Security](#file-upload-security)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Logging & Monitoring](#logging--monitoring)
- [Production Security](#production-security)
- [Security Checklist](#security-checklist)

---

## Security Overview

The Suppliers Dashboard backend implements multiple layers of security to protect user data, prevent unauthorized access, and ensure system integrity. Security is built into every component from authentication to file handling.

### Security Principles

- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal access rights
- **Zero Trust**: Verify every request
- **Data Protection**: Encrypt sensitive data
- **Audit Trail**: Log security events

### Threat Model

- **Unauthorized Access**: JWT token validation and role-based access
- **Data Breaches**: Encryption and secure storage
- **File Upload Attacks**: Validation and sandboxing
- **API Abuse**: Rate limiting and monitoring
- **SQL Injection**: Parameterized queries with Prisma

---

## Authentication Security

### JWT Implementation

#### Token Configuration

```typescript
const token = jwt.sign(payload, SECRET_VARIABLES.jwt_secret, {
  expiresIn: "24h", // Short-lived tokens
  issuer: "suppliers-api", // Token issuer
  audience: "suppliers-app", // Token audience
});
```

#### Secure Cookie Settings

```typescript
res.cookie("authorization", token, {
  httpOnly: true, // Prevents XSS attacks
  secure: true, // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.COOKIE_DOMAIN, // Restrict domain
});
```

### Password Security

#### Argon2 Configuration

```typescript
import argon2 from "argon2";

// Secure password hashing
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id, // Recommended variant
  memoryCost: 2 ** 16, // 64 MB memory usage
  timeCost: 3, // 3 iterations
  parallelism: 1, // Single thread
});
```

#### Password Policy

- **Minimum Length**: 8 characters
- **Complexity**: Recommend mixed case, numbers, symbols
- **No Common Passwords**: Check against common password lists
- **No Reuse**: Prevent password history reuse (future enhancement)

### Session Management

- **Token Expiry**: 24-hour maximum lifetime
- **Refresh Strategy**: Implement token refresh for longer sessions
- **Logout**: Clear cookies and invalidate tokens
- **Concurrent Sessions**: Track and limit concurrent sessions

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

#### Role Definitions

```typescript
enum Role {
  USER = "USER", // Basic user access
  SUPPLIER = "SUPPLIER", // Supplier-specific access
  ADMIN = "ADMIN", // Full system access
  REVIEWER = "REVIEWER", // Application review access
}
```

#### Permission Matrix

| Resource             | USER   | SUPPLIER | REVIEWER | ADMIN |
| -------------------- | ------ | -------- | -------- | ----- |
| User Profile         | Own    | Own      | -        | All   |
| Supplier Application | Create | Own      | View     | All   |
| Document Upload      | -      | Own      | -        | All   |
| Application Review   | -      | -        | All      | All   |
| User Management      | -      | -        | -        | All   |

### Access Control Implementation

```typescript
// Middleware chain example
app.get(
  "/admin/users",
  authenticateToken, // Verify JWT
  checkAdminOrReviewerRole, // Check permissions
  rateLimiter, // Prevent abuse
  controller // Business logic
);
```

### Resource-Level Security

- **Ownership Verification**: Users can only access their own resources
- **Document Access**: Secure file download with token validation
- **Admin Override**: Admins can access resources for review purposes
- **Audit Logging**: Log all access attempts and changes

---

## Data Protection

### Encryption Standards

#### Data at Rest

- **Database**: PostgreSQL with encryption at rest (production)
- **File Storage**: Encrypted file system (production)
- **Backups**: Encrypted backup storage
- **Logs**: Sensitive data redacted from logs

#### Data in Transit

- **HTTPS**: TLS 1.2+ for all API communications
- **Database Connections**: SSL/TLS for database connections
- **Internal Services**: mTLS for service-to-service communication

### Sensitive Data Handling

```typescript
// Password hashing (never store plain text)
const hashedPassword = await argon2.hash(password);

// Exclude sensitive fields from API responses
const userResponse = {
  id: user.id,
  email: user.email,
  role: user.role,
  // password field excluded
};

// Log data sanitization
logger.info("User login attempt", {
  email: user.email.replace(/(.{2}).*@/, "$1***@"), // Mask email
  timestamp: new Date().toISOString(),
});
```

### Data Validation

- **Input Sanitization**: All user input validated and sanitized
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Prevention**: Input validation and output encoding
- **CSRF Protection**: SameSite cookies and origin validation

---

## File Upload Security

### File Type Validation

```typescript
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Strict MIME type checking
  const allowedMimeTypes = ["application/pdf"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Additional file signature validation
    if (validateFileSignature(file.buffer)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format detected."));
    }
  } else {
    cb(new Error("Only PDF files are allowed."));
  }
};
```

### File Storage Security

- **Unique Filenames**: Prevent filename collisions and guessing
- **Size Limits**: 5MB per file, 3 files maximum
- **Storage Location**: Outside web root directory
- **Virus Scanning**: Optional integration with antivirus (configurable)
- **Access Control**: JWT-based download authentication

### Upload Validation

```typescript
// Comprehensive file validation
const validateUpload = (files: Express.Multer.File[]) => {
  for (const file of files) {
    // File size check
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds limit");
    }

    // File type validation
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error("Invalid file type");
    }

    // File signature validation (magic numbers)
    if (!validateFileSignature(file.buffer)) {
      throw new Error("File signature validation failed");
    }
  }
};
```

---

## API Security

### Rate Limiting Strategy

#### General API Protection

```typescript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,

  // Skip successful requests in count (optional)
  skipSuccessfulRequests: false,

  // Custom key generator for distributed systems
  keyGenerator: (req) => req.ip,

  // Store in Redis for distributed rate limiting
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:",
  }),
});
```

#### Authentication Endpoint Protection

```typescript
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 attempts per IP
  message: "Too many authentication attempts",

  // Progressive delays
  delayMs: (hits) => hits * 1000, // 1s, 2s, 3s delays

  // Skip whitelist IPs
  skip: (req) => WHITELIST_IPS.includes(req.ip),
});
```

### CORS Configuration

```typescript
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Development
      "https://suppliers.company.com", // Production
    ],
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24 hours preflight cache
  })
);
```

### Input Validation

```typescript
// Validation middleware example
const validateSupplierApplication = [
  body("businessName")
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage("Invalid business name format"),

  body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),

  body("zipCode")
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Invalid ZIP code format"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];
```

---

## Database Security

### Connection Security

```typescript
// Secure database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // SSL required in production
    },
  },
  log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
});
```

### Query Security

```typescript
// Safe parameterized queries (Prisma prevents SQL injection)
const user = await prisma.user.findUnique({
  where: {
    email: email, // Automatically parameterized
  },
  select: {
    id: true,
    email: true,
    role: true,
    // password excluded from selection
  },
});
```

### Database Best Practices

- **Least Privilege**: Database user has minimal required permissions
- **Connection Pooling**: Limited connection pool size
- **SSL/TLS**: Encrypted database connections
- **Backup Encryption**: Encrypted database backups
- **Access Monitoring**: Log database access and changes

---

## Logging & Monitoring

### Security Event Logging

```typescript
// Authentication events
logger.warn("Failed login attempt", {
  email: sanitizeEmail(email),
  ip: req.ip,
  userAgent: req.get("User-Agent"),
  timestamp: new Date().toISOString(),
});

// Authorization failures
logger.error("Unauthorized access attempt", {
  userId: req.user?.id,
  resource: req.originalUrl,
  method: req.method,
  ip: req.ip,
});

// File access events
logger.info("File download", {
  userId: req.user?.id,
  documentId: documentId,
  fileName: sanitizeFileName(fileName),
  ip: req.ip,
});
```

### Sensitive Data Redaction

```typescript
const sanitizeEmail = (email: string) => {
  return email.replace(/(.{2}).*@(.*)/, "$1***@$2");
};

const sanitizeError = (error: any) => {
  // Remove sensitive information from error logs
  delete error.password;
  delete error.token;
  return error;
};
```

### Monitoring Alerts

- **Failed Authentication**: Multiple failed login attempts
- **Rate Limit Violations**: Excessive API requests
- **Unusual File Access**: Large number of downloads
- **Database Errors**: Connection or query failures
- **Server Errors**: Application crashes or errors

---

## Production Security

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
JWT_SECRET=<strong-random-secret-256-bits>
DATABASE_URL=<encrypted-connection-string>
REDIS_URL=<redis-connection-string>

# Security headers
HELMET_ENABLED=true
HTTPS_ONLY=true
HSTS_MAX_AGE=31536000

# Rate limiting
RATE_LIMIT_WINDOW=900000    # 15 minutes
RATE_LIMIT_MAX=100          # 100 requests per window
```

### Security Headers

```typescript
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

### SSL/TLS Configuration

- **Minimum Version**: TLS 1.2
- **Cipher Suites**: Strong encryption algorithms only
- **Certificate Management**: Automated renewal with Let's Encrypt
- **HSTS**: HTTP Strict Transport Security enabled

---

## Security Checklist

### Development Security

- [ ] All secrets stored in environment variables
- [ ] Input validation on all endpoints
- [ ] Authentication required for protected routes
- [ ] Role-based authorization implemented
- [ ] Rate limiting configured
- [ ] Error handling doesn't expose sensitive information
- [ ] Logging configured with data sanitization

### File Upload Security

- [ ] File type validation (MIME type + signature)
- [ ] File size limits enforced
- [ ] Unique filename generation
- [ ] Secure file storage location
- [ ] Download authentication required
- [ ] Virus scanning configured (if applicable)

### Database Security

- [ ] SSL/TLS enabled for database connections
- [ ] Database user has minimal privileges
- [ ] All queries use parameterization (Prisma)
- [ ] Sensitive data excluded from logs
- [ ] Connection pooling configured
- [ ] Backup encryption enabled

### API Security

- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Security headers implemented (Helmet)
- [ ] Rate limiting active on all endpoints
- [ ] Request/response logging configured
- [ ] Error responses don't leak information

### Authentication & Authorization

- [ ] JWT tokens use strong secrets
- [ ] HTTP-only cookies for token storage
- [ ] Token expiration configured
- [ ] Password hashing with Argon2
- [ ] Role-based access control implemented
- [ ] Session management secure

### Monitoring & Logging

- [ ] Security events logged
- [ ] Failed authentication attempts tracked
- [ ] Rate limit violations monitored
- [ ] Error logs reviewed regularly
- [ ] Log retention policy configured
- [ ] Alert system configured

---

## Incident Response

### Security Incident Types

1. **Data Breach**: Unauthorized access to user data
2. **Authentication Bypass**: Unauthorized system access
3. **File Upload Attack**: Malicious file upload attempt
4. **API Abuse**: Excessive or malicious API usage
5. **Database Compromise**: Unauthorized database access

### Response Procedures

1. **Immediate Response**: Isolate and contain the incident
2. **Assessment**: Determine scope and impact
3. **Mitigation**: Apply fixes and security patches
4. **Recovery**: Restore normal operations
5. **Post-Incident**: Review and improve security measures

### Contact Information

- **Security Team**: security@company.com
- **DevOps Team**: devops@company.com
- **Management**: management@company.com

---

## Regular Security Tasks

### Daily

- [ ] Review error logs for security events
- [ ] Monitor failed authentication attempts
- [ ] Check rate limiting violations

### Weekly

- [ ] Review access logs
- [ ] Update security patches
- [ ] Test backup recovery

### Monthly

- [ ] Security audit of new code
- [ ] Review user access permissions
- [ ] Update security documentation

### Quarterly

- [ ] Penetration testing
- [ ] Security training for developers
- [ ] Review and update security policies

---

**Note**: Security is an ongoing process. Regular reviews, updates, and monitoring are essential for maintaining a secure system. Report any security concerns immediately to the security team.
