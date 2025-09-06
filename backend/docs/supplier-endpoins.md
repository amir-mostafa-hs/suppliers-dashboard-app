### **API Documentation - Supplier Management**

| Document Type | API Documentation |
| :------------ | :---------------- |
| Project/Team  | Backend           |
| Last Updated  | 06/09/2025        |
| Status        | In Development    |

This document outlines the API endpoints for managing supplier applications and profiles, including document uploads and secure downloads.

---

### **1. Apply to be a Supplier**

- **URL**: `/suppliers/apply`
- **Method**: `POST`
- **Description**: Submits a supplier application along with required documents.
- **Status**: Private (Authentication required).
- **Headers**:
  - `Authorization` (string, required): `Bearer <JWT_TOKEN>`.
  - `Content-Type`: `multipart/form-data`.
- **Parameters (Body)**:
  - `documents` (file, required): An array of PDF documents.
- **Validation**:
  - Only **PDF** files are allowed.
  - A maximum of **3** files can be uploaded.
  - Each file must be less than **5 MB**.
- **Responses**:
  - `200 OK`: Application submitted successfully.
    - **Sample Data**: `{ "message": "Supplier application submitted successfully." }`.
  - `400 Bad Request`:
    - Documents are required.
    - Too many files.
    - `Sample Data`: `{ "message": "Too many files. Please upload a maximum of 3 files." }`.
    - Invalid file type.
    - `Sample Data`: `{ "message": "Only PDF files are allowed." }`.
  - `413 Payload Too Large`: File size limit exceeded.
    - `Sample Data`: `{ "message": "File size limit exceeded. Each file must be less than 5 MB." }`.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `500 Internal Server Error`: Something went wrong on the server.

---

### **2. Get Supplier Profile**

- **URL**: `/suppliers/profile`
- **Method**: `GET`
- **Description**: Retrieves the authenticated user's supplier profile, including application status, rejection reason, and documents.
- **Status**: Private (Authentication required).
- **Headers**:
  - `Authorization` (string, required): `Bearer <JWT_TOKEN>`.
- **Responses**:
  - `200 OK`: Profile data returned successfully.
    - **Sample Data (PENDING)**: `{ "status": "PENDING", "rejectionReason": null, "documents": [...] }`.
    - **Sample Data (APPROVED)**: `{ "status": "APPROVED", "rejectionReason": null, "documents": [...], "profile": { "businessName": "...", ... } }`.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `404 Not Found`: Supplier profile not found.

---

### **3. Update Supplier Profile**

- **URL**: `/suppliers/profile`
- **Method**: `PUT`
- **Description**: Updates a supplier's business profile details. Only accessible to **APPROVED** suppliers.
- **Status**: Private (Authentication required).
- **Headers**:
  - `Authorization` (string, required): `Bearer <JWT_TOKEN>`.
- **Parameters (Body)**:
  - `businessName` (string, optional).
  - `address` (string, optional).
  - `city` (string, optional).
  - `state` (string, optional).
  - `zipCode` (string, optional).
- **Responses**:
  - `200 OK`: Profile updated successfully.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User is not an approved supplier.
  - `404 Not Found`: Supplier profile not found.

---

### **4. Delete Supplier Profile**

- **URL**: `/suppliers/delete`
- **Method**: `DELETE`
- **Description**: Deletes the authenticated user's supplier profile and reverts their status.
- **Status**: Private (Authentication required).
- **Headers**:
  - `Authorization` (string, required): `Bearer <JWT_TOKEN>`.
- **Responses**:
  - `200 OK`: Supplier profile deleted successfully.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `404 Not Found`: Supplier profile not found.
  - `500 Internal Server Error`: Something went wrong with the deletion.

---

### **5. Generate Secure Document Link**

- **URL**: `/suppliers/documents/:id/link`
- **Method**: `GET`
- **Description**: Generates a secure, temporary download link for a specific document. The link is valid for 15 minutes.
- **Status**: Private (Authentication required).
- **Headers**:
  - `Authorization` (string, required): `Bearer <JWT_TOKEN>`.
- **Parameters (URL)**:
  - `id` (string, required): The document ID.
- **Responses**:
  - `200 OK`: Link generated successfully.
    - **Sample Data**: `{ "downloadUrl": "https://<your_base_url>/suppliers/documents/download?token=..." }`.
  - `400 Bad Request`: File ID is missing.
  - `403 Forbidden`: User does not have permission to access the file.
  - `404 Not Found`: File not found in the database.

---

### **6. Download Document**

- **URL**: `/suppliers/documents/download`
- **Method**: `GET`
- **Description**: Downloads a document using a secure, temporary token.
- **Status**: Private (Authentication required via token).
- **Parameters (Query)**:
  - `token` (string, required): A valid JWT download token.
- **Responses**:
  - `200 OK`: File is sent to the client for download.
  - `401 Unauthorized`: Token is missing.
  - `403 Forbidden`: Token is invalid or expired.
  - `404 Not Found`: File not found on the server or in the database.
