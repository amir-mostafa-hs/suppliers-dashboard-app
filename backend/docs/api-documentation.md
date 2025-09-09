# Backend - API Documentation

**Last Updated:** September 9, 2025  
**Version:** 1.0.0  
**Author:** Development Team

## Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Response Format](#response-format)
- [Rate Limiting](#rate-limiting)
- [Error Codes](#error-codes)
- [User Authentication Endpoints](#user-authentication-endpoints)
- [Supplier Endpoints](#supplier-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [File Upload Endpoints](#file-upload-endpoints)
- [Health Check](#health-check)

---

## API Overview

The Suppliers Dashboard API provides a comprehensive backend service for managing supplier applications, user authentication, and administrative functions. Built with Node.js, Express, and Prisma ORM.

### Key Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: USER, SUPPLIER, ADMIN roles
- **File Upload**: Secure PDF document handling
- **Real-time Status**: Live application status updates
- **Rate Limiting**: Request throttling and abuse prevention
- **Comprehensive Logging**: Full request/response logging

### Technical Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Local filesystem with secure access
- **Logging**: Winston logger with structured logging

---

## Authentication

### Authentication Flow

1. User registers or logs in with credentials
2. Server validates credentials and issues JWT token
3. Token stored in HTTP-only cookie for security
4. Token included automatically in subsequent requests
5. Server validates token on protected routes

### Token Information

- **Storage**: HTTP-only cookie named `authorization`
- **Lifetime**: 24 hours
- **Security**: Secure, SameSite=strict, HttpOnly
- **Payload**: User ID, role, expiration

### Authentication States

- **Unauthenticated**: No token present
- **Authenticated**: Valid token with user info
- **Expired**: Token expired, re-authentication required
- **Invalid**: Malformed or tampered token

---

## Base URL & Headers

### Base URL

```
Development: http://localhost:8000/api
Production: https://api.suppliers.company.com/api
```

### Required Headers

```http
Content-Type: application/json
```

### Optional Headers

```http
X-Request-ID: unique-request-identifier
User-Agent: client-application/version
```

### Cookie Authentication

Authentication token is automatically included via HTTP-only cookie:

```http
Cookie: authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details (development only)
  },
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/endpoint",
  "requestId": "req-123456"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Rate Limiting

### General API Limits

- **Window**: 15 minutes
- **Requests**: 100 per IP address
- **Response Header**: `X-RateLimit-Remaining`

### Authentication Endpoints

- **Window**: 30 minutes
- **Requests**: 5 per IP address
- **Lockout**: Progressive delays on failures

### File Upload Limits

- **File Size**: 5MB per file maximum
- **File Count**: 3 files per request
- **File Types**: PDF only
- **Total Size**: 15MB per request

---

## Error Codes

### Authentication Errors

| Code            | Status | Description                |
| --------------- | ------ | -------------------------- |
| `UNAUTHORIZED`  | 401    | Authentication required    |
| `TOKEN_EXPIRED` | 401    | JWT token has expired      |
| `INVALID_TOKEN` | 401    | Malformed or invalid token |
| `FORBIDDEN`     | 403    | Insufficient permissions   |

### Validation Errors

| Code                | Status | Description                   |
| ------------------- | ------ | ----------------------------- |
| `VALIDATION_FAILED` | 422    | Input validation failed       |
| `INVALID_EMAIL`     | 400    | Email format invalid          |
| `INVALID_PASSWORD`  | 400    | Password requirements not met |
| `DUPLICATE_EMAIL`   | 409    | Email already registered      |

### Resource Errors

| Code                 | Status | Description         |
| -------------------- | ------ | ------------------- |
| `NOT_FOUND`          | 404    | Resource not found  |
| `USER_NOT_FOUND`     | 404    | User does not exist |
| `SUPPLIER_NOT_FOUND` | 404    | Supplier not found  |

### File Upload Errors

| Code                  | Status | Description            |
| --------------------- | ------ | ---------------------- |
| `FILE_SIZE_EXCEEDED`  | 413    | File too large         |
| `INVALID_FILE_TYPE`   | 415    | Only PDF files allowed |
| `FILE_COUNT_EXCEEDED` | 413    | Too many files         |

---

## User Authentication Endpoints

### Register User

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "USER"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2025-01-09T10:30:00.000Z"
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**

- Email: Valid email format, unique
- Password: Minimum 8 characters
- Role: Must be USER, SUPPLIER, or ADMIN

---

### Login User

Authenticate user and receive JWT token.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "USER"
    }
  },
  "message": "Login successful"
}
```

**Authentication Cookie Set:**

```http
Set-Cookie: authorization=jwt-token; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

---

### Logout User

Clear authentication token and logout.

```http
POST /api/auth/logout
```

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookie Cleared:**

```http
Set-Cookie: authorization=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

### Get Current User

Retrieve authenticated user information.

```http
GET /api/auth/me
```

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2025-01-09T10:30:00.000Z"
  }
}
```

---

## Supplier Endpoints

### Create Supplier Profile

Create a new supplier application.

```http
POST /api/supplier/profile
```

**Authentication:** Required (USER or SUPPLIER role)

**Request Body:**

```json
{
  "businessName": "Acme Corporation",
  "contactPerson": "John Smith",
  "email": "contact@acme.com",
  "phone": "+1-555-0123",
  "address": "123 Business St",
  "city": "Business City",
  "state": "BC",
  "zipCode": "12345",
  "businessDescription": "We provide high-quality business solutions..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessName": "Acme Corporation",
    "contactPerson": "John Smith",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business St",
    "city": "Business City",
    "state": "BC",
    "zipCode": "12345",
    "businessDescription": "We provide high-quality business solutions...",
    "status": "PENDING",
    "createdAt": "2025-01-09T10:30:00.000Z",
    "userId": 1
  },
  "message": "Supplier profile created successfully"
}
```

**Validation Rules:**

- businessName: 2-100 characters, alphanumeric with spaces
- email: Valid email format
- phone: Valid phone number format
- zipCode: 5-digit or 5+4 format
- All fields required

---

### Get Supplier Profile

Retrieve supplier profile information.

```http
GET /api/supplier/profile
```

**Authentication:** Required (SUPPLIER role)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessName": "Acme Corporation",
    "contactPerson": "John Smith",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business St",
    "city": "Business City",
    "state": "BC",
    "zipCode": "12345",
    "businessDescription": "We provide high-quality business solutions...",
    "status": "PENDING",
    "rejectionReason": null,
    "createdAt": "2025-01-09T10:30:00.000Z",
    "updatedAt": "2025-01-09T10:30:00.000Z",
    "documents": [
      {
        "id": 1,
        "fileName": "business-license.pdf",
        "fileSize": 1024000,
        "uploadedAt": "2025-01-09T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Update Supplier Profile

Update existing supplier profile.

```http
PUT /api/supplier/profile
```

**Authentication:** Required (SUPPLIER role)

**Request Body:** Same as Create Supplier Profile

**Response:** Updated supplier profile data

**Business Rules:**

- Can only update if status is PENDING or REJECTED
- Approved profiles cannot be modified
- Status resets to PENDING after update

---

### Upload Documents

Upload business documents (PDF only).

```http
POST /api/supplier/upload-documents
```

**Authentication:** Required (SUPPLIER role)

**Content-Type:** `multipart/form-data`

**Request Body:**

```form-data
documents: file1.pdf
documents: file2.pdf
documents: file3.pdf
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "fileName": "file1.pdf",
        "originalName": "business-license.pdf",
        "size": 1024000,
        "path": "/uploads/suppliers/documents-123456.pdf"
      }
    ]
  },
  "message": "Documents uploaded successfully"
}
```

**File Constraints:**

- File Type: PDF only
- File Size: 5MB maximum per file
- File Count: 3 files maximum per request
- Total Size: 15MB maximum per request

---

### Download Document

Download uploaded document securely.

```http
GET /api/supplier/documents/:filename
```

**Authentication:** Required (SUPPLIER role - own documents only)

**Parameters:**

- `filename`: Document filename to download

**Response:** File download stream

**Security:**

- Users can only download their own documents
- Filename validation prevents directory traversal
- JWT authentication required

---

## Admin Endpoints

### Get All Users

Retrieve all users with pagination.

```http
GET /api/admin/users?page=1&limit=10&search=john
```

**Authentication:** Required (ADMIN role)

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for email/name filtering
- `role`: Filter by role (USER, SUPPLIER, ADMIN)
- `status`: Filter by supplier status (PENDING, APPROVED, REJECTED)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "role": "SUPPLIER",
        "createdAt": "2025-01-09T10:30:00.000Z",
        "supplier": {
          "id": 1,
          "businessName": "Acme Corporation",
          "status": "PENDING",
          "createdAt": "2025-01-09T10:30:00.000Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get User by ID

Retrieve specific user information.

```http
GET /api/admin/users/:id
```

**Authentication:** Required (ADMIN role)

**Parameters:**

- `id`: User ID to retrieve

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "SUPPLIER",
    "createdAt": "2025-01-09T10:30:00.000Z",
    "supplier": {
      "id": 1,
      "businessName": "Acme Corporation",
      "contactPerson": "John Smith",
      "email": "contact@acme.com",
      "phone": "+1-555-0123",
      "address": "123 Business St",
      "city": "Business City",
      "state": "BC",
      "zipCode": "12345",
      "businessDescription": "We provide high-quality business solutions...",
      "status": "PENDING",
      "rejectionReason": null,
      "createdAt": "2025-01-09T10:30:00.000Z",
      "documents": [
        {
          "id": 1,
          "fileName": "business-license.pdf",
          "fileSize": 1024000,
          "uploadedAt": "2025-01-09T10:30:00.000Z"
        }
      ]
    }
  }
}
```

---

### Approve Supplier

Approve a supplier application.

```http
POST /api/admin/users/:id/approve
```

**Authentication:** Required (ADMIN role)

**Parameters:**

- `id`: User ID to approve

**Request Body:**

```json
{
  "notes": "Application meets all requirements"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "APPROVED",
    "updatedAt": "2025-01-09T10:30:00.000Z"
  },
  "message": "Supplier approved successfully"
}
```

**Business Rules:**

- Can only approve PENDING suppliers
- Sets status to APPROVED
- Clears any previous rejection reason
- Logs approval action

---

### Reject Supplier

Reject a supplier application with reason.

```http
POST /api/admin/users/:id/reject
```

**Authentication:** Required (ADMIN role)

**Parameters:**

- `id`: User ID to reject

**Request Body:**

```json
{
  "rejectionReason": "Missing required business license documentation"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "REJECTED",
    "rejectionReason": "Missing required business license documentation",
    "updatedAt": "2025-01-09T10:30:00.000Z"
  },
  "message": "Supplier rejected successfully"
}
```

**Validation Rules:**

- rejectionReason: Required, 10-500 characters
- Can only reject PENDING or APPROVED suppliers
- Sets status to REJECTED
- Logs rejection action with reason

---

### Download Supplier Document

Admin download of supplier documents.

```http
GET /api/admin/users/:userId/documents/:filename
```

**Authentication:** Required (ADMIN role)

**Parameters:**

- `userId`: User ID who owns the document
- `filename`: Document filename to download

**Response:** File download stream

**Security:**

- Admin can download any supplier document
- Filename validation prevents directory traversal
- Full audit logging of admin file access

---

## File Upload Endpoints

### Multer Configuration

The API uses Multer for handling file uploads with the following configuration:

```javascript
// File upload limits
const uploadLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB per file
  files: 3, // Maximum 3 files
  fieldSize: 1024, // 1KB field size
  fields: 10, // Maximum 10 fields
};

// Allowed MIME types
const allowedMimeTypes = ["application/pdf"];

// File naming strategy
const filename = `documents-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
```

### File Storage Structure

```
uploads/
├── suppliers/
│   ├── documents-1757188145112-109909147.pdf
│   ├── documents-1757188145113-402110936.pdf
│   └── documents-1757261615189-807145201.pdf
```

### File Security

- **Validation**: MIME type and file signature checking
- **Storage**: Outside web root directory
- **Access**: JWT authentication required
- **Naming**: Random filenames prevent guessing
- **Size Limits**: Prevent abuse and storage issues

---

## Health Check

### System Health

Check API and dependencies health.

```http
GET /api/health
```

**Authentication:** None required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "filesystem": "accessible"
  },
  "version": "1.0.0",
  "uptime": 86400
}
```

### Unhealthy Response

```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-09T10:30:00.000Z",
  "services": {
    "database": "disconnected",
    "redis": "connected",
    "filesystem": "accessible"
  },
  "error": "Database connection failed"
}
```

---

## Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"USER"}'

# Login and save cookies
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Use authenticated endpoint
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt
```

### Using Postman

1. Import the API collection (if available)
2. Set up environment variables for base URL
3. Use cookie authentication or Authorization header
4. Test endpoints with various payloads
5. Validate response formats and error handling

### Environment Variables

```bash
# Development
API_BASE_URL=http://localhost:8000/api

# Production
API_BASE_URL=https://api.suppliers.company.com/api
```

---

## Changelog

### Version 1.0.0 (2025-01-09)

- Initial API documentation
- All core endpoints documented
- Authentication and authorization flows
- File upload specifications
- Error handling and response formats
- Rate limiting and security measures

---

**Note**: This API documentation is actively maintained and updated with each release. For questions or issues, please contact the development team.
