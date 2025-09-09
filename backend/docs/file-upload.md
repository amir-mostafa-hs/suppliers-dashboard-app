# Backend - File Upload System Documentation

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** Active

## Table of Contents

- [Overview](#overview)
- [Upload Configuration](#upload-configuration)
- [File Validation](#file-validation)
- [Storage System](#storage-system)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Download System](#download-system)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

The file upload system handles secure document uploads for supplier applications. It uses Multer middleware for handling multipart/form-data and implements comprehensive validation and security measures.

### Key Features

- PDF-only file uploads
- File size and quantity limits
- Secure file storage with unique naming
- Virus scanning capabilities (configurable)
- JWT-based download authentication
- Admin direct access for document review

### Technology Stack

- **Multer**: File upload middleware
- **Express**: HTTP server framework
- **JWT**: Download token authentication
- **File System**: Local storage (configurable for cloud)

---

## Upload Configuration

### Multer Configuration

```typescript
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
    files: 3, // Maximum 3 files per upload
  },
});
```

### Storage Configuration

```typescript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/suppliers"); // Upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
```

**Filename Pattern:**

- Format: `{fieldname}-{timestamp}-{random}.{extension}`
- Example: `documents-1757188145112-109909147.pdf`
- Ensures unique filenames and prevents conflicts

---

## File Validation

### File Type Filter

```typescript
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."));
  }
};
```

**Accepted File Types:**

- **PDF Only**: `application/pdf`
- **Rationale**: Standardizes document format for consistency and security

### Upload Limits

| Limit Type | Value       | Reason                                      |
| ---------- | ----------- | ------------------------------------------- |
| File Size  | 5 MB        | Reasonable for business documents           |
| File Count | 3 files     | Sufficient for basic business documentation |
| Field Name | `documents` | Standardized form field name                |

### Validation Rules

1. **File Presence**: At least one file required for supplier applications
2. **MIME Type**: Must be `application/pdf`
3. **File Size**: Individual files cannot exceed 5 MB
4. **File Count**: Maximum 3 files per application
5. **File Extension**: Must have `.pdf` extension

---

## Storage System

### Directory Structure

```
uploads/
└── suppliers/
    ├── documents-1757188145112-109909147.pdf
    ├── documents-1757188145113-402110936.pdf
    └── documents-1757261615189-807145201.pdf
```

### File Metadata Storage

Document metadata is stored in the database:

```typescript
interface SupplierDocument {
  id: string; // Unique document ID
  fileName: string; // Original filename from user
  fileUrl: string; // Server file path
  fileType: string; // MIME type (application/pdf)
  supplierProfileId: string; // Associated supplier profile
}
```

### Storage Benefits

- **Unique Naming**: Prevents filename conflicts
- **Organized Structure**: Separate folder for supplier documents
- **Metadata Tracking**: Database records for each file
- **Scalable**: Easy migration to cloud storage if needed

---

## Security Features

### File System Security

- **Restricted Directory**: Files stored outside web root
- **Unique Filenames**: Prevents direct URL guessing
- **MIME Type Validation**: Blocks non-PDF uploads
- **Size Limits**: Prevents abuse and DoS attacks

### Access Control

- **Authentication Required**: JWT tokens for all file operations
- **Role-Based Access**: Different access levels by user role
- **Document Ownership**: Users can only access their own documents
- **Admin Override**: Admins can access all documents for review

### Download Security

```typescript
// Secure download with JWT token
const downloadToken = jwt.sign(
  {
    documentId: document.id,
    userId: user.id,
    accessType: "download",
  },
  SECRET_VARIABLES.jwt_secret,
  { expiresIn: "1h" }
);
```

---

## API Endpoints

### Upload Endpoint

**POST** `/suppliers/apply`

Handles supplier application with document upload.

```typescript
// Request (multipart/form-data)
{
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  documents: File[]; // PDF files (max 3, 5MB each)
}

// Response
{
  "message": "Supplier application submitted successfully."
}
```

### Document List Endpoint

**GET** `/suppliers/profile`

Returns supplier profile with document list.

```typescript
// Response
{
  "status": "PENDING" | "APPROVED" | "REJECTED",
  "documents": [
    {
      "id": "uuid",
      "fileName": "business-license.pdf",
      "fileType": "application/pdf"
    }
  ],
  "profile": {
    "businessName": "Company Name",
    // ... other profile fields
  }
}
```

---

## Download System

### User Download Flow

1. **Request Download Link**: User requests download token
2. **Token Generation**: Server generates JWT with document access
3. **Secure Download**: User accesses file via download endpoint

```typescript
// Generate download link
GET /suppliers/documents/{documentId}/link

// Response
{
  "downloadUrl": "/suppliers/documents/{documentId}/download?token={jwt}"
}

// Download file
GET /suppliers/documents/{documentId}/download?token={jwt}
// Returns: PDF file with appropriate headers
```

### Admin Direct Access

Admins can download documents directly without token generation:

```typescript
// Admin direct download
GET / admin / suppliers / { supplierId } / documents / { documentId } / download;
// Headers: application/pdf
// Returns: PDF file directly
```

---

## Error Handling

### Upload Errors

```typescript
// File size exceeded
{
  "status": 413,
  "message": "File size limit exceeded. Each file must be less than 5 MB."
}

// Too many files
{
  "status": 400,
  "message": "Too many files. Please upload a maximum of 3 files."
}

// Invalid file type
{
  "status": 400,
  "message": "Only PDF files are allowed."
}

// No files provided
{
  "status": 400,
  "message": "Documents are required to apply."
}
```

### Download Errors

```typescript
// Invalid download token
{
  "status": 403,
  "message": "Invalid or expired download token."
}

// File not found
{
  "status": 404,
  "message": "Document not found."
}

// Access denied
{
  "status": 403,
  "message": "Access denied to this document."
}
```

---

## Best Practices

### File Handling

1. **Always Validate**: Check file type, size, and count
2. **Unique Names**: Use timestamp and random suffix
3. **Store Metadata**: Keep database records for all files
4. **Cleanup**: Remove orphaned files periodically

### Security Guidelines

1. **Validate MIME Types**: Don't trust file extensions alone
2. **Limit File Sizes**: Prevent DoS attacks
3. **Authenticate Downloads**: Use JWT tokens for access control
4. **Audit Access**: Log all file access attempts

### Performance Optimization

1. **Stream Large Files**: Use streams for file operations
2. **Caching**: Cache frequently accessed files
3. **CDN Integration**: Consider CDN for file delivery
4. **Background Processing**: Handle virus scanning asynchronously

### Storage Management

1. **Regular Cleanup**: Remove temporary and orphaned files
2. **Backup Strategy**: Regular backups of uploaded files
3. **Storage Monitoring**: Monitor disk usage and capacity
4. **Archive Old Files**: Archive old documents to reduce storage costs

---

## Configuration Options

### Environment Variables

```env
# File upload settings
MAX_FILE_SIZE=5242880        # 5MB in bytes
MAX_FILES_PER_UPLOAD=3       # Maximum files per request
UPLOAD_DIR=uploads/suppliers # Upload directory path

# Security settings
DOWNLOAD_TOKEN_EXPIRY=1h     # Download token expiration
VIRUS_SCAN_ENABLED=false     # Enable virus scanning
```

### Multer Middleware Usage

```typescript
// Apply to upload route
app.post(
  "/suppliers/apply",
  authenticateToken, // Authentication required
  multerFiles, // File upload middleware
  applySupplier // Controller
);
```

---

## Future Enhancements

### Planned Features

1. **Cloud Storage Integration**: AWS S3/Google Cloud Storage
2. **Virus Scanning**: Integrate with virus scanning service
3. **Image Support**: Allow JPEG/PNG for certain document types
4. **Compression**: Automatic PDF compression for large files
5. **Preview Generation**: Generate thumbnails for documents

### Migration Considerations

- **Cloud Storage**: Easy migration to S3/GCS with minimal code changes
- **CDN Integration**: Improve download performance globally
- **Backup Strategy**: Automated cloud backups
- **Scaling**: Handle increased file upload volume

---

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size and type
   - Verify directory permissions
   - Ensure sufficient disk space

2. **Download Issues**
   - Verify JWT token validity
   - Check file exists on disk
   - Confirm user permissions

3. **Performance Problems**
   - Monitor disk I/O
   - Check upload directory size
   - Review concurrent upload limits

### Monitoring Points

- Upload success/failure rates
- File storage usage
- Download response times
- Error frequency by type

---

**Note**: This file upload system is designed for security and scalability. Regular monitoring and maintenance ensure optimal performance and security.
