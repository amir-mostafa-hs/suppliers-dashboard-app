### **API Documentation - Admin Panel**

| Document Type | API Documentation |
| :------------ | :---------------- |
| Project/Team  | Backend           |
| Last Updated  | 06/09/2025        |
| Status        | In Development    |

This document outlines the API endpoints for the admin panel, which are accessible to users with **`ADMIN`** or **`REVIEWER`** roles.

---

### **1. Get All Users**

- **URL**: `/admin/users`
- **Method**: `GET`
- **Description**: Retrieves a list of all users. Can be filtered by role, email, and supplier status.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (Query)**:
  - `role` (string, optional): Filters users by their role (`USER`, `SUPPLIER`, `ADMIN`, `REVIEWER`).
  - `email` (string, optional): Searches for users by email (case-insensitive).
  - `status` (string, optional): Filters suppliers by application status (`PENDING`, `APPROVED`, `REJECTED`).
- **Responses**:
  - `200 OK`: Returns a list of user objects.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `500 Internal Server Error`: Something went wrong.

---

### **2. Get User by ID**

- **URL**: `/admin/users/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific user's details, including their supplier profile and documents.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (URL)**:
  - `id` (string, required): The user's unique ID.
- **Responses**:
  - `200 OK`: Returns the user object with associated data.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `404 Not Found`: User not found.

---

### **3. Update User Role**

- **URL**: `/admin/users/:id/role`
- **Method**: `PUT`
- **Description**: Updates a user's role.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (URL)**:
  - `id` (string, required): The user's unique ID.
- **Parameters (Body)**:
  - `role` (string, required): The new role (`USER`, `SUPPLIER`, `ADMIN`, `REVIEWER`).
- **Responses**:
  - `200 OK`: Role updated successfully.
  - `400 Bad Request`: Invalid role specified.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `404 Not Found`: User not found.

---

### **4. Approve Supplier Application**

- **URL**: `/admin/suppliers/:id/approve`
- **Method**: `POST`
- **Description**: Approves a supplier's application. Updates the supplier status to `APPROVED` and changes the user's role to **`SUPPLIER`**.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (URL)**:
  - `id` (string, required): The supplier's profile ID.
- **Responses**:
  - `200 OK`: Application approved successfully.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `404 Not Found`: Supplier application not found.

---

### **5. Reject Supplier Application**

- **URL**: `/admin/suppliers/:id/reject`
- **Method**: `POST`
- **Description**: Rejects a supplier's application and records a rejection reason. It also reverts the user's supplier status to **`false`**.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (URL)**:
  - `id` (string, required): The supplier's profile ID.
- **Parameters (Body)**:
  - `rejectionReason` (string, required): The reason for rejecting the application.
- **Responses**:
  - `200 OK`: Application rejected successfully.
  - `400 Bad Request`: Rejection reason is missing.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `404 Not Found`: Supplier application not found.

---

### **6. Generate Secure Document Link**

- **URL**: `/admin/suppliers/documents/:id/link`
- **Method**: `GET`
- **Description**: Generates a secure link for viewing a supplier's document. The link is temporary and allows in-browser viewing.
- **Status**: Private (Admin/Reviewer access only).
- **Parameters (URL)**:
  - `id` (string, required): The document ID.
- **Responses**:
  - `200 OK`: Link generated successfully.
  - `400 Bad Request`: File ID is missing.
  - `401 Unauthorized`: Authentication token is missing or invalid.
  - `403 Forbidden`: User does not have sufficient permissions.
  - `404 Not Found`: File not found in the database.
