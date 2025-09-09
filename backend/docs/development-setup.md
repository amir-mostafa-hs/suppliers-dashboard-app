# Backend - Development Setup Guide

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** Active

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Project Installation](#project-installation)
- [Environment Variables](#environment-variables)
- [Development Server](#development-server)
- [Database Operations](#database-operations)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software       | Version | Purpose            |
| -------------- | ------- | ------------------ |
| **Node.js**    | 18.0+   | JavaScript runtime |
| **pnpm**       | 8.0+    | Package manager    |
| **PostgreSQL** | 14.0+   | Database server    |
| **Git**        | 2.0+    | Version control    |

### Optional Tools

| Tool        | Purpose                     |
| ----------- | --------------------------- |
| **Docker**  | Containerized development   |
| **pgAdmin** | Database administration     |
| **Postman** | API testing                 |
| **VS Code** | Code editor with extensions |

### System Requirements

- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: 10GB free space for development
- **OS**: macOS, Windows 10+, or Linux

---

## Environment Setup

### 1. Install Node.js

```bash
# Download from nodejs.org or use version manager
# Verify installation
node --version  # Should be 18.0+
npm --version
```

### 2. Install pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version  # Should be 8.0+
```

### 3. Install PostgreSQL

#### macOS (using Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows

- Download PostgreSQL installer from postgresql.org
- Follow installation wizard
- Start PostgreSQL service

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Configure PostgreSQL

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE suppliers_db;
CREATE USER suppliers_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE suppliers_db TO suppliers_user;
\q
```

---

## Project Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd suppliers-dashboard-app/backend
```

### 2. Install Dependencies

```bash
# Install all project dependencies
pnpm install

# Verify installation
pnpm list
```

### 3. Project Structure Verification

```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
├── uploads/
├── logs/
└── package.json
```

---

## Environment Variables

### 1. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env  # or your preferred editor
```

### 2. Required Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://suppliers_user:your_password@localhost:5432/suppliers_db"

# Server Configuration
PORT=5040
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# File Upload Configuration
MAX_FILE_SIZE=5242880        # 5MB in bytes
MAX_FILES_PER_UPLOAD=3
UPLOAD_DIR="uploads/suppliers"

# Logging Configuration
LOG_LEVEL=debug
LOG_DIR="logs"
```

### 3. Environment Variable Descriptions

| Variable       | Description                  | Example                             |
| -------------- | ---------------------------- | ----------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://user:pass@host:port/db |
| `PORT`         | Server port number           | 5040                                |
| `NODE_ENV`     | Environment mode             | development/production              |
| `JWT_SECRET`   | Secret key for JWT signing   | random-secure-string                |
| `FRONTEND_URL` | Frontend application URL     | http://localhost:3000               |

---

## Database Configuration

### 1. Database Setup with Prisma

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# Verify database connection
pnpm prisma db push
```

### 2. Database Seeding (Optional)

```bash
# Create seed file (if needed)
# Run seeding
pnpm prisma db seed
```

### 3. Database Management Commands

```bash
# View database in browser
pnpm prisma studio

# Reset database (development only)
pnpm prisma migrate reset

# Check migration status
pnpm prisma migrate status
```

---

## Development Server

### 1. Start Development Server

```bash
# Start with auto-reload
pnpm dev

# Expected output:
# Server is running on http://localhost:5040
# Connected to the database.
```

### 2. Verify Server Status

```bash
# Test health endpoint
curl http://localhost:5040

# Expected response: "Backend API is running 🚀"
```

### 3. Development Server Features

- **Auto-reload**: Server restarts on file changes
- **TypeScript compilation**: Real-time TypeScript compilation
- **Error reporting**: Detailed error messages in development
- **Request logging**: All requests logged to console

---

## Database Operations

### Prisma Commands Reference

```bash
# Client Generation
pnpm prisma generate          # Generate Prisma client
pnpm prisma db push          # Push schema changes to database

# Migrations
pnpm prisma migrate dev      # Create and apply new migration
pnpm prisma migrate deploy   # Apply migrations (production)
pnpm prisma migrate reset    # Reset database and apply all migrations

# Database Inspection
pnpm prisma studio          # Open database browser
pnpm prisma db seed         # Run database seeding
pnpm prisma format          # Format schema file
```

### Common Database Tasks

#### Creating New Migration

```bash
# After modifying schema.prisma
pnpm prisma migrate dev --name "descriptive-migration-name"
```

#### Viewing Database Content

```bash
# Start Prisma Studio
pnpm prisma studio
# Opens browser at http://localhost:5555
```

#### Resetting Development Database

```bash
# WARNING: This deletes all data
pnpm prisma migrate reset
```

---

## Development Workflow

### 1. Daily Development Routine

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
pnpm install

# 3. Apply database migrations
pnpm prisma migrate dev

# 4. Start development server
pnpm dev
```

### 2. Code Quality Tools

```bash
# Linting
pnpm lint              # Check code style
pnpm lint:fix          # Fix auto-fixable issues

# Formatting
pnpm format            # Format code with Prettier

# Type checking
pnpm type-check        # Check TypeScript types
```

### 3. Testing Commands

```bash
# Run tests
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# API testing
pnpm test:api          # Run API integration tests
```

### 4. Build and Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Check build output
ls -la dist/
```

---

## File Upload Development

### 1. Upload Directory Setup

```bash
# Create upload directories
mkdir -p uploads/suppliers

# Set permissions (Linux/macOS)
chmod 755 uploads/suppliers
```

### 2. Test File Upload

```bash
# Using curl to test upload
curl -X POST http://localhost:5040/suppliers/apply \
  -H "Content-Type: multipart/form-data" \
  -H "Cookie: authorization=<jwt-token>" \
  -F "businessName=Test Company" \
  -F "address=123 Test St" \
  -F "city=Test City" \
  -F "state=TS" \
  -F "zipCode=12345" \
  -F "documents=@test-document.pdf"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

```bash
# Error: "Can't reach database server"
# Solutions:
1. Check PostgreSQL service status
   sudo systemctl status postgresql  # Linux
   brew services list postgresql    # macOS

2. Verify DATABASE_URL in .env
3. Test connection manually:
   psql "postgresql://user:pass@localhost:5432/db"
```

#### 2. Port Already in Use

```bash
# Error: "Port 5040 is already in use"
# Solutions:
1. Kill process using port:
   lsof -ti:5040 | xargs kill -9

2. Change port in .env:
   PORT=5041
```

#### 3. Prisma Client Issues

```bash
# Error: "Prisma client not generated"
# Solutions:
1. Generate client:
   pnpm prisma generate

2. Clear node_modules and reinstall:
   rm -rf node_modules
   pnpm install
```

#### 4. File Upload Issues

```bash
# Error: "Multer upload failed"
# Solutions:
1. Check upload directory exists:
   mkdir -p uploads/suppliers

2. Verify file permissions:
   chmod 755 uploads/suppliers

3. Check file size and type restrictions
```

#### 5. JWT Authentication Issues

```bash
# Error: "Invalid token"
# Solutions:
1. Check JWT_SECRET in .env
2. Verify token format in cookies
3. Check token expiration time
```

### Development Debugging

#### Enable Debug Logging

```bash
# Set environment variable
export DEBUG=*

# Or in .env file
NODE_ENV=development
LOG_LEVEL=debug
```

#### Database Query Logging

```bash
# Enable Prisma query logging
# Add to .env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&logging=true"
```

#### API Request Logging

All requests are automatically logged in development mode:

```
2025-09-09 10:30:15 [HTTP] Incoming request: 127.0.0.1 | POST | /suppliers/apply
```

---

## IDE Setup (VS Code)

### Recommended Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Performance Optimization

### Development Performance Tips

1. **Use pnpm**: Faster package installation
2. **Enable caching**: Use development cache for faster builds
3. **Limit logging**: Reduce log verbosity in development
4. **Database indexing**: Add indexes for frequently queried fields

### Memory Management

```bash
# Monitor memory usage
node --max-old-space-size=4096 src/server.ts

# Check memory leaks
pnpm add -D clinic
npx clinic doctor -- node src/server.ts
```

---

## Next Steps

After successful setup:

1. **Explore API Endpoints**: Check [API Documentation](./admin-endpoints.md)
2. **Understand Authentication**: Review [Authentication Guide](./authentication.md)
3. **File Upload Testing**: Test document upload functionality
4. **Database Schema**: Familiarize with [Database Schema](./database-schema.md)
5. **Middleware System**: Learn about [Middleware Components](./middleware.md)

---

**Note**: This development setup guide should be updated as the project evolves. Keep environment configurations secure and never commit sensitive data to version control.
