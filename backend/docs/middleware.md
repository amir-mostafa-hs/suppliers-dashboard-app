# Backend - Middleware Documentation

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** Active

## Table of Contents

- [Overview](#overview)
- [Authentication Middleware](#authentication-middleware)
- [Rate Limiting Middleware](#rate-limiting-middleware)
- [File Upload Middleware](#file-upload-middleware)
- [Request Logging Middleware](#request-logging-middleware)
- [Download Authorization Middleware](#download-authorization-middleware)
- [Supplier Status Middleware](#supplier-status-middleware)
- [Middleware Chain Examples](#middleware-chain-examples)
- [Best Practices](#best-practices)

---

## Overview

The middleware system provides essential functionality for request processing, security, and logging. Each middleware component serves a specific purpose in the request-response cycle.

### Middleware Types

- **Authentication**: JWT token validation and user context
- **Authorization**: Role-based access control
- **Rate Limiting**: API abuse prevention
- **File Upload**: Multipart form data handling
- **Logging**: Request tracking and monitoring
- **Validation**: Input sanitization and validation

---

## Authentication Middleware

### authenticateToken Middleware

Validates JWT tokens and attaches user context to requests.

```typescript
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies["authorization"];

  if (token == null) {
    return res.status(401).json({
      message: "Authentication token is required.",
    });
  }

  jwt.verify(token, SECRET_VARIABLES.jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token.",
      });
    }
    req.user = decoded as User;
    next();
  });
};
```

**Features:**

- Extracts JWT from HTTP-only cookies
- Validates token signature and expiration
- Attaches user data to request object
- Returns appropriate error responses

**Usage:**

```typescript
app.get("/protected-route", authenticateToken, controller);
```

### checkAdminOrReviewerRole Middleware

Restricts access to administrative functions.

```typescript
export const checkAdminOrReviewerRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== Role.ADMIN && req.user.role !== Role.REVIEWER)) {
    return res.status(403).json({
      message: "Access forbidden: Insufficient permissions.",
    });
  }
  next();
};
```

**Features:**

- Checks for ADMIN or REVIEWER roles
- Must be used after authenticateToken
- Returns 403 for insufficient permissions

**Usage:**

```typescript
app.get("/admin/users", authenticateToken, checkAdminOrReviewerRole, adminController);
```

---

## Rate Limiting Middleware

### General API Rate Limiter

Prevents API abuse with reasonable limits for normal usage.

```typescript
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});
```

**Configuration:**

- **Window**: 15-minute sliding window
- **Limit**: 100 requests per IP
- **Headers**: Standard rate limit headers included
- **Response**: Custom error message

### Authentication Rate Limiter

Stricter limits for authentication endpoints to prevent brute force attacks.

```typescript
export const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 attempts per window
  message: "Too many attempts from this IP, please try again after 30 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Configuration:**

- **Window**: 30-minute sliding window
- **Limit**: 5 attempts per IP
- **Target**: Login and registration endpoints
- **Purpose**: Brute force attack prevention

**Usage:**

```typescript
app.post("/users/login", authLimiter, loginController);
app.post("/users/register", authLimiter, registerController);
```

---

## File Upload Middleware

### multerFiles Middleware

Handles multipart form data for document uploads with comprehensive error handling.

```typescript
export const multerFiles = (req: Request, res: Response, next: NextFunction) => {
  upload.array("documents", 3)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "File size limit exceeded. Each file must be less than 5 MB.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: "Too many files. Please upload a maximum of 3 files.",
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
```

**Error Handling:**

- **LIMIT_FILE_SIZE**: Individual file exceeds 5MB
- **LIMIT_UNEXPECTED_FILE**: More than 3 files uploaded
- **File Type Errors**: Non-PDF files rejected
- **Generic Errors**: Other multer-related issues

**Features:**

- Accepts up to 3 files in "documents" field
- 5MB per file size limit
- PDF-only file type validation
- Comprehensive error messages

**Usage:**

```typescript
app.post("/suppliers/apply", authenticateToken, multerFiles, applySupplierController);
```

---

## Request Logging Middleware

### requestLogger Middleware

Logs all incoming requests for monitoring and debugging purposes.

```typescript
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`Incoming request: ${req.ip} | ${req.method} | ${req.originalUrl}`);
  next();
};
```

**Logged Information:**

- **Client IP**: Request origin IP address
- **HTTP Method**: GET, POST, PUT, DELETE, etc.
- **URL Path**: Full request path with query parameters
- **Timestamp**: Automatic with Winston logger

**Log Format Example:**

```
2025-09-09 10:30:15 [HTTP] Incoming request: 192.168.1.100 | POST | /suppliers/apply
```

**Benefits:**

- Request tracking and auditing
- Performance monitoring
- Security incident investigation
- API usage analytics

---

## Download Authorization Middleware

### downloadAuth Middleware

Validates JWT tokens specifically for file download requests.

```typescript
export const downloadAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(401).json({ message: "Download token is required." });
  }

  jwt.verify(token, SECRET_VARIABLES.jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired download token." });
    }

    req.dbFile = decoded as SupplierDocument & { accessType: "download" | "view" };
    next();
  });
};
```

**Features:**

- Validates download-specific JWT tokens
- Extracts token from query parameter
- Attaches file access information to request
- Short-lived tokens (1 hour expiry)

**Usage:**

```typescript
app.get("/suppliers/documents/:id/download", downloadAuth, downloadController);
```

---

## Supplier Status Middleware

### checkSupplierStatus Middleware

Validates supplier application status for protected operations.

```typescript
export const checkSupplierStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: req.user?.id },
    });

    if (!supplierProfile || supplierProfile.supplierStatus !== "APPROVED") {
      return res.status(403).json({
        message: "Access restricted to approved suppliers only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
```

**Features:**

- Checks supplier profile existence
- Validates APPROVED status
- Database lookup for current status
- Error handling for database issues

**Usage:**

```typescript
app.put("/suppliers/profile", authenticateToken, checkSupplierStatus, updateProfileController);
```

---

## Middleware Chain Examples

### Public Endpoints

```typescript
// No middleware required
app.get("/health", healthCheckController);
app.post("/users/register", authLimiter, registerController);
```

### Protected User Endpoints

```typescript
// Authentication required
app.get("/users/profile", apiLimiter, authenticateToken, getUserProfileController);
```

### Supplier-Specific Endpoints

```typescript
// Supplier authentication and status check
app.put("/suppliers/profile", apiLimiter, authenticateToken, checkSupplierStatus, updateSupplierProfileController);
```

### File Upload Endpoints

```typescript
// Authentication + file upload
app.post("/suppliers/apply", apiLimiter, authenticateToken, multerFiles, applySupplierController);
```

### Admin Endpoints

```typescript
// Admin access with logging
app.get("/admin/users", apiLimiter, authenticateToken, checkAdminOrReviewerRole, getAllUsersController);
```

### File Download Endpoints

```typescript
// Token-based file access
app.get("/suppliers/documents/:id/download", downloadAuth, downloadFileController);

// Admin direct access
app.get(
  "/admin/suppliers/:id/documents/:docId/download",
  apiLimiter,
  authenticateToken,
  checkAdminOrReviewerRole,
  adminDownloadController
);
```

---

## Best Practices

### Middleware Ordering

1. **Rate Limiting**: Apply early to prevent abuse
2. **Authentication**: Validate user before business logic
3. **Authorization**: Check permissions after authentication
4. **Validation**: Validate input after auth/authz
5. **Business Logic**: Execute controller logic last

### Error Handling

- Return appropriate HTTP status codes
- Provide clear error messages
- Log errors for debugging
- Don't expose sensitive information

### Performance Considerations

- Keep middleware lightweight
- Avoid unnecessary database queries
- Use async/await properly
- Cache frequently accessed data

### Security Guidelines

- Validate all input data
- Use HTTPS in production
- Implement proper CORS policies
- Log security-relevant events

### Development Tips

- Test middleware in isolation
- Use TypeScript for type safety
- Document middleware behavior
- Monitor middleware performance

---

## Testing Middleware

### Unit Testing Example

```typescript
describe("authenticateToken Middleware", () => {
  it("should reject requests without token", async () => {
    const req = mockRequest({});
    const res = mockResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should accept valid tokens", async () => {
    const validToken = jwt.sign({ id: "123" }, SECRET_VARIABLES.jwt_secret);
    const req = mockRequest({ cookies: { authorization: validToken } });
    const res = mockResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
```

---

## Monitoring and Debugging

### Logging Levels

- **HTTP**: Request logging (all requests)
- **INFO**: Successful operations
- **WARN**: Non-critical issues
- **ERROR**: Critical errors requiring attention

### Metrics to Monitor

- Request success/failure rates
- Response times per middleware
- Rate limit violations
- Authentication failures
- File upload success rates

### Debug Techniques

- Enable debug logging for specific middleware
- Use request IDs for tracing
- Monitor middleware execution order
- Profile middleware performance

---

**Note**: Middleware components are the backbone of the API security and functionality. Regular review and testing ensure optimal performance and security.
