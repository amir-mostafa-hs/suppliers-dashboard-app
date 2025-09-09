# Backend - Error Handling Guide

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** Active

## Table of Contents

- [Error Handling Overview](#error-handling-overview)
- [Error Types & Classification](#error-types--classification)
- [HTTP Status Codes](#http-status-codes)
- [Error Response Format](#error-response-format)
- [Global Error Handling](#global-error-handling)
- [Controller Error Patterns](#controller-error-patterns)
- [Validation Errors](#validation-errors)
- [Database Error Handling](#database-error-handling)
- [Authentication Errors](#authentication-errors)
- [File Upload Errors](#file-upload-errors)
- [Logging Error Events](#logging-error-events)
- [Production Error Management](#production-error-management)

---

## Error Handling Overview

The Suppliers Dashboard backend implements comprehensive error handling to provide meaningful feedback to clients while protecting sensitive system information. All errors are properly logged, categorized, and returned with appropriate HTTP status codes.

### Error Handling Principles

- **Consistent Format**: Standardized error response structure
- **Security**: No sensitive information in error messages
- **Traceability**: All errors logged with context
- **User-Friendly**: Clear, actionable error messages
- **Fail-Safe**: Graceful degradation on errors

### Error Flow Architecture

```
Request → Validation → Business Logic → Database → Response
   ↓          ↓             ↓           ↓         ↓
Error     Error         Error       Error    Error
   ↓          ↓             ↓           ↓         ↓
     Global Error Handler → Logger → Client Response
```

---

## Error Types & Classification

### 1. Client Errors (4xx)

**Cause**: Invalid client requests  
**Responsibility**: Client-side fixes required

#### Authentication Errors

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **419 Authentication Timeout**: Token expired

#### Validation Errors

- **400 Bad Request**: Invalid input data
- **422 Unprocessable Entity**: Validation failed
- **413 Payload Too Large**: File size exceeded

#### Resource Errors

- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict (duplicate email)
- **410 Gone**: Resource permanently removed

### 2. Server Errors (5xx)

**Cause**: Internal system issues  
**Responsibility**: Server-side fixes required

#### Application Errors

- **500 Internal Server Error**: Unexpected application error
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: System overloaded

#### Database Errors

- **500 Internal Server Error**: Database connection lost
- **503 Service Unavailable**: Database maintenance

---

## HTTP Status Codes

### Success Codes (2xx)

```typescript
// Success responses
export const HTTP_STATUS = {
  OK: 200, // Standard success
  CREATED: 201, // Resource created
  ACCEPTED: 202, // Request accepted (async)
  NO_CONTENT: 204, // Success with no response body
} as const;
```

### Client Error Codes (4xx)

```typescript
export const CLIENT_ERRORS = {
  BAD_REQUEST: 400, // Invalid request format
  UNAUTHORIZED: 401, // Authentication required
  FORBIDDEN: 403, // Access denied
  NOT_FOUND: 404, // Resource not found
  METHOD_NOT_ALLOWED: 405, // HTTP method not supported
  CONFLICT: 409, // Resource conflict
  GONE: 410, // Resource permanently removed
  PAYLOAD_TOO_LARGE: 413, // Request too large
  UNSUPPORTED_MEDIA: 415, // Invalid file type
  TOO_MANY_REQUESTS: 429, // Rate limit exceeded
} as const;
```

### Server Error Codes (5xx)

```typescript
export const SERVER_ERRORS = {
  INTERNAL_SERVER_ERROR: 500, // Unexpected server error
  NOT_IMPLEMENTED: 501, // Feature not implemented
  BAD_GATEWAY: 502, // Upstream error
  SERVICE_UNAVAILABLE: 503, // Service down
  GATEWAY_TIMEOUT: 504, // Upstream timeout
} as const;
```

---

## Error Response Format

### Standard Error Response Structure

```typescript
interface ApiErrorResponse {
  success: false;
  message: string; // User-friendly error message
  code?: string; // Error code for client handling
  details?: any; // Additional error details (development only)
  timestamp: string; // ISO timestamp
  path: string; // Request path
  requestId?: string; // Request tracking ID
}
```

### Success Response Structure

```typescript
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T; // Response data
  message?: string; // Optional success message
  timestamp: string; // ISO timestamp
}
```

### Implementation Example

```typescript
// Error response helper
export const createErrorResponse = (message: string, code?: string, details?: any): ApiErrorResponse => ({
  success: false,
  message,
  code,
  details: process.env.NODE_ENV === "development" ? details : undefined,
  timestamp: new Date().toISOString(),
  path: "", // Will be set by middleware
});

// Success response helper
export const createSuccessResponse = <T>(data: T, message?: string): ApiSuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});
```

---

## Global Error Handling

### Express Error Middleware

```typescript
import { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger";

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const globalErrorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Extract error information
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code;
  const details = error.details;

  // Log error with context
  logger.error("Request failed", {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: sanitizeRequestBody(req.body),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
    user: req.user ? { id: req.user.id, role: req.user.role } : null,
    timestamp: new Date().toISOString(),
  });

  // Create error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    message: getClientSafeMessage(message, statusCode),
    code,
    details: process.env.NODE_ENV === "development" ? details : undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.headers["x-request-id"] as string,
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Sanitize sensitive data from logs
const sanitizeRequestBody = (body: any) => {
  if (!body) return body;

  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.authorization;

  return sanitized;
};

// Get client-safe error messages
const getClientSafeMessage = (message: string, statusCode: number): string => {
  // In production, don't expose internal error details
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    return "An internal server error occurred. Please try again later.";
  }

  return message;
};
```

### 404 Not Found Handler

```typescript
export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ApiErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json(errorResponse);
};
```

---

## Controller Error Patterns

### Try-Catch Pattern

```typescript
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id || isNaN(Number(id))) {
      return res.status(400).json(createErrorResponse("Invalid user ID format", "INVALID_USER_ID"));
    }

    // Business logic
    const user = await userService.findById(Number(id));

    if (!user) {
      return res.status(404).json(createErrorResponse("User not found", "USER_NOT_FOUND"));
    }

    // Success response
    res.status(200).json(createSuccessResponse(user, "User retrieved successfully"));
  } catch (error) {
    // Let global error handler manage the error
    next(error);
  }
};
```

### Custom Error Classes

```typescript
// Base custom error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

// Usage in controllers
export const approveSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
    });

    if (!supplier) {
      throw new NotFoundError("Supplier");
    }

    if (supplier.status === "APPROVED") {
      throw new ValidationError("Supplier already approved");
    }

    // Business logic continues...
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

---

## Validation Errors

### Express Validator Integration

```typescript
import { body, validationResult } from "express-validator";

// Validation rules
export const validateSupplierRegistration = [
  body("businessName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage("Business name contains invalid characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  body("phone").isMobilePhone("any").withMessage("Please provide a valid phone number"),

  body("zipCode")
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Please provide a valid ZIP code"),
];

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg,
      value: error.type === "field" ? error.value : undefined,
    }));

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: "Validation failed",
      code: "VALIDATION_FAILED",
      details: errorDetails,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    logger.warn("Validation failed", {
      url: req.originalUrl,
      method: req.method,
      errors: errorDetails,
      ip: req.ip,
    });

    return res.status(422).json(errorResponse);
  }

  next();
};
```

### File Validation Errors

```typescript
export const handleMulterErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    let message: string;
    let code: string;

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large. Maximum size is 5MB per file.";
        code = "FILE_SIZE_EXCEEDED";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Maximum 3 files allowed.";
        code = "FILE_COUNT_EXCEEDED";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field.";
        code = "UNEXPECTED_FILE_FIELD";
        break;
      default:
        message = "File upload error occurred.";
        code = "FILE_UPLOAD_ERROR";
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    logger.warn("File upload error", {
      error: error.code,
      message: error.message,
      url: req.originalUrl,
      ip: req.ip,
    });

    return res.status(413).json(errorResponse);
  }

  // Handle custom file validation errors
  if (error.message.includes("Invalid file type")) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: "Invalid file type. Only PDF files are allowed.",
      code: "INVALID_FILE_TYPE",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    return res.status(415).json(errorResponse);
  }

  next(error);
};
```

---

## Database Error Handling

### Prisma Error Handling

```typescript
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const handleDatabaseError = (error: any): AppError => {
  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const field = error.meta?.target as string[];
        const fieldName = field?.[0] || "field";
        return new ValidationError(`${fieldName} already exists`, { field: fieldName, code: "DUPLICATE_VALUE" });

      case "P2025":
        // Record not found
        return new NotFoundError("Record");

      case "P2003":
        // Foreign key constraint violation
        return new ValidationError("Related record not found", { code: "FOREIGN_KEY_VIOLATION" });

      case "P2014":
        // Invalid ID
        return new ValidationError("Invalid ID provided", { code: "INVALID_ID" });

      default:
        logger.error("Unknown Prisma error", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        });
        return new AppError("Database operation failed", 500, "DATABASE_ERROR");
    }
  }

  // Handle general database errors
  if (error.message.includes("connect ECONNREFUSED")) {
    return new AppError("Database connection failed", 503, "DATABASE_CONNECTION_ERROR");
  }

  // Default database error
  return new AppError("Database error occurred", 500, "DATABASE_ERROR");
};

// Usage in service layer
export const createUser = async (userData: CreateUserData) => {
  try {
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    throw handleDatabaseError(error);
  }
};
```

---

## Authentication Errors

### JWT Error Handling

```typescript
import jwt from "jsonwebtoken";

export const handleJWTError = (error: any): AppError => {
  if (error instanceof jwt.JsonWebTokenError) {
    switch (error.name) {
      case "TokenExpiredError":
        return new UnauthorizedError("Token has expired");

      case "JsonWebTokenError":
        if (error.message === "invalid token") {
          return new UnauthorizedError("Invalid token format");
        }
        if (error.message === "jwt malformed") {
          return new UnauthorizedError("Malformed token");
        }
        return new UnauthorizedError("Token validation failed");

      case "NotBeforeError":
        return new UnauthorizedError("Token not active yet");

      default:
        return new UnauthorizedError("Token authentication failed");
    }
  }

  return new UnauthorizedError("Authentication failed");
};

// Authentication middleware with error handling
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.authorization;

    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    const decoded = jwt.verify(token, SECRET_VARIABLES.jwt_secret) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    next(handleJWTError(error));
  }
};
```

### Role-Based Access Errors

```typescript
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Usage
app.get("/admin/users", authenticateToken, requireRole(["ADMIN", "REVIEWER"]), adminController.getAllUsers);
```

---

## File Upload Errors

### File Type Validation

```typescript
export const validateFileType = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["application/pdf"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("INVALID_FILE_TYPE"));
  }

  // Check file signature (magic numbers)
  if (!isValidPDF(file.buffer)) {
    return cb(new Error("INVALID_FILE_SIGNATURE"));
  }

  cb(null, true);
};

const isValidPDF = (buffer: Buffer): boolean => {
  // Check PDF signature (starts with %PDF)
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
  return buffer.subarray(0, 4).equals(pdfSignature);
};
```

### File Storage Errors

```typescript
export const handleFileStorageError = (error: any): AppError => {
  if (error.code === "ENOENT") {
    return new AppError("File storage directory not found", 500, "STORAGE_DIRECTORY_ERROR");
  }

  if (error.code === "ENOSPC") {
    return new AppError("Insufficient storage space", 507, "INSUFFICIENT_STORAGE");
  }

  if (error.code === "EACCES") {
    return new AppError("File system permission denied", 500, "STORAGE_PERMISSION_ERROR");
  }

  return new AppError("File storage error occurred", 500, "FILE_STORAGE_ERROR");
};
```

---

## Logging Error Events

### Error Logging Configuration

```typescript
import winston from "winston";

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Log different error types
export const logError = (
  error: Error,
  context: {
    userId?: number;
    requestId?: string;
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
  }
) => {
  errorLogger.error("Application error", {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};
```

### Error Metrics

```typescript
// Error rate tracking
let errorCount = 0;
let requestCount = 0;

export const trackErrorMetrics = (error: CustomError) => {
  errorCount++;

  // Alert if error rate exceeds threshold
  if (requestCount > 100 && errorCount / requestCount > 0.05) {
    logger.error("High error rate detected", {
      errorRate: (errorCount / requestCount) * 100,
      errorCount,
      requestCount,
      timestamp: new Date().toISOString(),
    });
  }
};

// Reset metrics periodically
setInterval(() => {
  errorCount = 0;
  requestCount = 0;
}, 60 * 1000); // Reset every minute
```

---

## Production Error Management

### Error Alerting

```typescript
// Email alert for critical errors
export const sendErrorAlert = async (error: CustomError, context: any) => {
  if (error.statusCode >= 500) {
    // Send alert to development team
    await emailService.sendAlert({
      to: process.env.ALERT_EMAIL,
      subject: `Critical Error - ${process.env.NODE_ENV}`,
      body: `
        Error: ${error.message}
        Status: ${error.statusCode}
        Time: ${new Date().toISOString()}
        Context: ${JSON.stringify(context, null, 2)}
      `,
    });
  }
};
```

### Health Check Endpoint

```typescript
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection (if used)
    if (redisClient) {
      await redisClient.ping();
    }

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      redis: redisClient ? "connected" : "not configured",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
```

### Error Recovery Strategies

```typescript
// Retry logic for transient errors
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors
      if (error instanceof AppError && error.statusCode < 500) {
        throw error;
      }

      if (attempt === maxRetries) {
        logger.error("Operation failed after retries", {
          attempts: maxRetries,
          error: error.message,
        });
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};
```

---

## Error Testing

### Unit Test Examples

```typescript
describe("Error Handling", () => {
  test("should handle validation errors", async () => {
    const response = await request(app).post("/api/auth/register").send({ email: "invalid-email" });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("VALIDATION_FAILED");
  });

  test("should handle not found errors", async () => {
    const response = await request(app).get("/api/users/999999").set("Cookie", validAuthCookie);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  test("should handle unauthorized access", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
```

---

**Note**: Proper error handling is crucial for application reliability and user experience. Always log errors with sufficient context for debugging while protecting sensitive information from unauthorized access.
