# Backend - Database Schema Documentation

**Last Updated:** September 9, 2025  
**Author:** Development Team  
**Status:** Active

## Table of Contents

- [Overview](#overview)
- [Database Design](#database-design)
- [Data Models](#data-models)
- [Relationships](#relationships)
- [Enums](#enums)
- [Migration History](#migration-history)
- [Best Practices](#best-practices)

---

## Overview

The Suppliers Dashboard backend uses PostgreSQL as the primary database with Prisma as the ORM. The database is designed to support a multi-role user system with supplier application workflow.

### Database Technology

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Generated Client**: Prisma Client

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────────┐
│      User       │         │  SupplierProfile    │
├─────────────────┤    1:1  ├─────────────────────┤
│ id (UUID) PK    │◄────────┤ id (UUID) PK        │
│ email (String)  │         │ userId (UUID) FK    │
│ password        │         │ supplierStatus      │
│ role (Enum)     │         │ rejectionReason     │
│ isSupplier      │         │ businessName        │
│ createdAt       │         │ address             │
│ updatedAt       │         │ city                │
└─────────────────┘         │ state               │
                            │ zipCode             │
                            └─────────────────────┘
                                        │
                                        │ 1:N
                                        ▼
                            ┌─────────────────────┐
                            │ SupplierDocument    │
                            ├─────────────────────┤
                            │ id (UUID) PK        │
                            │ fileName (String)   │
                            │ fileUrl (String?)   │
                            │ fileType (String)   │
                            │ supplierProfileId   │
                            └─────────────────────┘
```

---

## Data Models

### User Model

The core user entity that handles authentication and role management.

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  role       Role     @default(USER)
  isSupplier Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  supplierProfile SupplierProfile?
}
```

**Field Descriptions:**

- `id`: Unique identifier (UUID)
- `email`: User's email address (unique constraint)
- `password`: Hashed password using Argon2
- `role`: User role (USER, SUPPLIER, ADMIN, REVIEWER)
- `isSupplier`: Flag indicating if user has supplier profile
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp

### SupplierProfile Model

Extended profile for suppliers with business information and application status.

```prisma
model SupplierProfile {
  id              String          @id @default(uuid())
  supplierStatus  SupplierStatus? @default(PENDING)
  rejectionReason String?
  businessName    String?
  address         String?
  city            String?
  state           String?
  zipCode         String?

  user      User               @relation(fields: [userId], references: [id])
  userId    String             @unique
  documents SupplierDocument[]
}
```

**Field Descriptions:**

- `id`: Unique identifier (UUID)
- `supplierStatus`: Application status (PENDING, APPROVED, REJECTED)
- `rejectionReason`: Admin-provided reason for rejection
- `businessName`: Company or business name
- `address`: Business street address
- `city`: Business city
- `state`: Business state/province
- `zipCode`: Business postal code
- `userId`: Foreign key to User (one-to-one)

### SupplierDocument Model

Stores metadata for uploaded documents related to supplier applications.

```prisma
model SupplierDocument {
  id       String  @id @default(uuid())
  fileName String
  fileUrl  String?
  fileType String

  supplierProfile   SupplierProfile @relation(fields: [supplierProfileId], references: [id], onDelete: Cascade)
  supplierProfileId String
}
```

**Field Descriptions:**

- `id`: Unique identifier (UUID)
- `fileName`: Original uploaded file name
- `fileUrl`: Optional URL/path to file (if stored externally)
- `fileType`: MIME type of the uploaded file
- `supplierProfileId`: Foreign key to SupplierProfile (cascade delete)

---

## Relationships

### User ↔ SupplierProfile (One-to-One)

- Each user can have at most one supplier profile
- Supplier profile is created when user applies to become a supplier
- Relationship is optional (not all users are suppliers)

### SupplierProfile ↔ SupplierDocument (One-to-Many)

- Each supplier profile can have multiple documents
- Documents are automatically deleted when supplier profile is deleted (cascade)
- Common document types: business license, tax certificates, insurance

---

## Enums

### Role Enum

Defines user access levels in the system.

```prisma
enum Role {
  USER      // Regular users who can apply to become suppliers
  SUPPLIER  // Approved suppliers with business profiles
  ADMIN     // System administrators with full access
  REVIEWER  // Users who can review supplier applications
}
```

### SupplierStatus Enum

Tracks the state of supplier applications.

```prisma
enum SupplierStatus {
  PENDING   // Application submitted, awaiting review
  APPROVED  // Application approved by admin
  REJECTED  // Application rejected with reason
}
```

---

## Migration History

The database has evolved through several migrations:

1. **20250905150420_first_setup**: Initial database schema with User, SupplierProfile, and SupplierDocument models
2. **20250906161053_change_supplier**: Modifications to supplier profile structure
3. **20250906164246_update_supplier**: Additional supplier profile updates
4. **20250906171701_change_document_type_to_file_type**: Renamed document type field
5. **20250906174512_update_supplier_profile_with_documents**: Enhanced document relationships
6. **20250906175314_edit_documents**: Final document model adjustments

### Running Migrations

```bash
# Apply all pending migrations
pnpm prisma migrate dev

# Reset database and apply all migrations
pnpm prisma migrate reset

# Generate Prisma client after schema changes
pnpm prisma generate
```

---

## Best Practices

### Data Integrity

- All primary keys use UUID format for security and scalability
- Foreign key constraints ensure referential integrity
- Cascade deletes prevent orphaned records

### Security Considerations

- Passwords are never stored in plain text (hashed with Argon2)
- Email addresses have unique constraints to prevent duplicates
- Sensitive data is properly indexed for performance

### Performance Optimization

- Indexes on frequently queried fields (email, userId)
- Proper relationship definitions for efficient joins
- Optional fields use nullable types to reduce storage

### Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Run `prisma migrate dev --name descriptive-name` to create migration
3. Run `prisma generate` to update client types
4. Update application code to use new schema

---

## Database Configuration

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/suppliers_db"
```

### Connection Settings

- **Pool Size**: Configured via Prisma
- **SSL Mode**: Required for production
- **Timezone**: UTC for consistent timestamps

---

## Troubleshooting

### Common Issues

1. **Migration Conflicts**: Use `prisma migrate resolve` for failed migrations
2. **Schema Drift**: Run `prisma db push` to sync development changes
3. **Client Generation**: Always run `prisma generate` after schema changes

### Database Maintenance

- Regular backups recommended for production
- Monitor connection pool usage
- Review slow query logs periodically

---

**Note**: This schema documentation should be updated whenever database changes are made. All migration files are version controlled and should not be modified manually.
