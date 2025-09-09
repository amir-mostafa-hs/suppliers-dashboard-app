# Suppliers Dashboard Backend - Project Overview

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** In Development

## Table of Contents

- [Project Introduction](#project-introduction)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Quick Links](#quick-links)

---

## Project Introduction

The Suppliers Dashboard Backend is a Node.js/Express-based REST API that serves as the backend for a comprehensive supplier management system. The system allows users to apply as suppliers, admins to review applications, and provides role-based access control for different user types.

### Purpose

- Manage supplier applications and approvals
- Provide secure authentication and authorization
- Handle document uploads and management
- Offer role-based dashboards and functionality

### Scope

- User management with role-based access (USER, SUPPLIER, ADMIN, REVIEWER)
- Supplier application workflow (PENDING → APPROVED/REJECTED)
- Document upload and secure download system
- Admin dashboard for application review

---

## Architecture Overview

The backend follows a layered architecture pattern:

```
┌─────────────────┐
│   Client Apps   │ (Frontend React App)
├─────────────────┤
│   API Layer     │ (Express Routes)
├─────────────────┤
│ Business Logic  │ (Controllers)
├─────────────────┤
│  Data Access    │ (Prisma ORM)
├─────────────────┤
│   Database      │ (PostgreSQL)
└─────────────────┘
```

### Key Architectural Decisions

- **RESTful API Design**: Standard HTTP methods and status codes
- **JWT Authentication**: Stateless authentication using HTTP-only cookies
- **Role-Based Access Control**: Multiple user roles with different permissions
- **File Upload System**: Secure document upload with validation
- **Request Logging**: Comprehensive logging for monitoring and debugging

---

## Technology Stack

### Core Framework

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript

### Database & ORM

- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migration tool

### Authentication & Security

- **JSON Web Tokens (JWT)** - Authentication tokens
- **Argon2** - Password hashing
- **Express Rate Limit** - API rate limiting
- **CORS** - Cross-origin resource sharing

### File Handling

- **Multer** - File upload middleware

### Logging & Monitoring

- **Winston** - Application logging
- **Winston Daily Rotate File** - Log rotation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart

---

## Key Features

### User Management

- User registration and authentication
- Role-based access control (USER, SUPPLIER, ADMIN, REVIEWER)
- Profile management

### Supplier Application System

- Supplier application submission
- Document upload with validation
- Application status tracking (PENDING, APPROVED, REJECTED)
- Admin review and approval workflow

### Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with Argon2
- Rate limiting on API endpoints
- Secure file upload with validation

### Admin Features

- View all users and supplier applications
- Approve/reject supplier applications with reasons
- Secure document download access
- Dashboard statistics

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Business logic controllers
│   ├── middlewares/     # Custom middleware functions
│   ├── routes/          # API route definitions
│   ├── services/        # External service integrations
│   └── server.ts        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema definition
│   └── migrations/      # Database migration files
├── docs/                # Project documentation
├── uploads/             # File upload storage
└── logs/                # Application logs
```

---

## Quick Links

### Technical Documentation

- [Database Schema](./database-schema.md) - Complete database design and relationships
- [Authentication System](./authentication.md) - JWT implementation and security
- [File Upload System](./file-upload.md) - Document handling and storage

### API Documentation

- [User Endpoints](./user-endpoint.md) - User authentication and profile management
- [Supplier Endpoints](./supplier-endpoins.md) - Supplier application and document APIs
- [Admin Endpoints](./admin-endpoints.md) - Admin dashboard and approval APIs

### Development & Deployment

- [Development Setup](./development-setup.md) - Local development environment
- [Deployment Guide](./deployment.md) - Production deployment instructions
- [Environment Configuration](./environment-config.md) - Environment variables and settings

### Architecture & Design

- [Middleware Documentation](./middleware.md) - Custom middleware implementations
- [Security Guidelines](./security.md) - Security best practices and implementations
- [Error Handling](./error-handling.md) - Error handling patterns and responses

---

## Getting Started

1. **Prerequisites**: Node.js 18+, PostgreSQL, pnpm
2. **Installation**: Clone repository and run `pnpm install`
3. **Database Setup**: Configure PostgreSQL and run `pnpm prisma migrate dev`
4. **Environment**: Copy `.env.example` to `.env` and configure variables
5. **Development**: Run `pnpm dev` to start development server

For detailed setup instructions, see [Development Setup](./development-setup.md).

---

## Support & Contact

For technical questions or issues:

- Check existing documentation in `/docs` folder
- Review API endpoint documentation
- Contact the development team

---

**Note**: This documentation follows the established documentation standards and is maintained by the development team. All technical decisions and implementations are documented in their respective sections.
