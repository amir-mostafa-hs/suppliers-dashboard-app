### **1. User Routes and Endpoints Documentation (Updated)**

This document outlines the API endpoints for user management, including registration, login, and profile management, with a focus on updated security protocols and data handling.

---

### **API Documentation - User Management**

| Document Type | API Documentation |
| :------------ | :---------------- |
| Project/Team  | Backend           |
| Last Updated  | 06/09/2025        |
| Status        | In Development    |

---

#### **1. Register User**

- **URL**: `/users/register`
- **Method**: `POST`
- **Description**: Creates a new user account and returns a `cookie` with a JWT token for immediate login.
- **Status**: Public (No authentication required).
- **Parameters (Body)**:
  - `email` (string, required): The user's email address.
  - `password` (string, required): The user's password.
- **Responses**:
  - `200 OK`: User created successfully, returns a cookie with a JWT token.
    - **Sample Data**: `{ "message": "User created successfully." }`.
  - `400 Bad Request`: Email or password is not provided.
    - **Sample Data**: `{ "message": "Email and password are required." }`.
  - `409 Conflict`: Email already exists.
    - **Sample Data**: `{ "message": "Email already exists." }`.
  - `500 Internal Server Error`: Something went wrong on the server.

---

#### **2. User Login**

- **URL**: `/users/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a `cookie` with a JWT token valid for 24 hours.
- **Status**: Public (No authentication required).
- **Parameters (Body)**:
  - `email` (string, required): The user's email.
  - `password` (string, required): The user's password.
- **Responses**:
  - `200 OK`: Login successful, returns a cookie with a JWT token.
    - **Sample Data**: `{ "message": "Login successful." }`.
  - `400 Bad Request`: Email or password is not provided.
  - `401 Unauthorized`: Invalid credentials (Incorrect email or password).
    - **Sample Data**: `{ "message": "Invalid credentials." }`.
  - `500 Internal Server Error`: Something went wrong on the server.

---

#### **3. Authentication Middleware**

- **URL**: Applies to all protected routes.
- **Description**: Verifies the presence and validity of a JWT token in the `authorization` cookie. If valid, it attaches the user's data to the request object.
- **Headers**: This middleware expects the JWT token in a cookie named `authorization`.
- **Responses**:
  - `401 Unauthorized`: Token is not provided in the cookie.
  - `403 Forbidden`: Token is invalid or has expired.

---

#### **4. Get User Profile**

- **URL**: `/users/profile`
- **Method**: `GET`
- **Description**: Retrieves the authenticated user's profile information based on the JWT token.
- **Status**: Private (Authentication required).
- **Headers**:
  - Requires a valid `authorization` cookie containing a JWT token.
- **Responses**:
  - `200 OK`: Profile data returned successfully.
    - **Sample Data**: `{ "id": "uuid", "email": "user@example.com", "role": "USER", "isSupplier": false }`.
  - `401 Unauthorized`: Token is not provided.
  - `403 Forbidden`: Invalid or expired token.
  - `404 Not Found`: User not found in the database.

---

#### **5. Update User Profile**

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Description**: Updates the authenticated user's profile.
- **Status**: Private (Authentication required).
- **Headers**:
  - Requires a valid `authorization` cookie containing a JWT token.
- **Parameters (Body)**:
  - `email` (string, optional): New email address.
  - `password` (string, optional): New password. **Requires `oldPassword`**.
  - `oldPassword` (string, optional): Current password. **Required if `password` is provided**.
- **Responses**:
  - `200 OK`: Profile updated successfully.
    - **Sample Data**: `{ "message": "User profile updated successfully.", "user": { "id": "uuid", "email": "new_email@example.com", "role": "USER" } }`.
  - `400 Bad Request`: `oldPassword` is required for password change.
  - `401 Unauthorized`: Incorrect old password.
  - `403 Forbidden`: Invalid or expired token.
  - `404 Not Found`: User not found.

---

#### **6. Delete User Profile**

- **URL**: `/users/delete`
- **Method**: `DELETE`
- **Description**: Deletes the authenticated user's account.
- **Status**: Private (Authentication required).
- **Headers**:
  - Requires a valid `authorization` cookie containing a JWT token.
- **Responses**:
  - `200 OK`: User deleted successfully.
    - **Sample Data**: `{ "message": "User deleted successfully." }`.
  - `401 Unauthorized`: No authentication token provided.
  - `403 Forbidden`: Invalid or expired token.
  - `500 Internal Server Error`: Something went wrong with the deletion process.
