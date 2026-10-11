# Practical 7: Authentication and Middleware Pipeline

**Student Name:** Maitri Sheta  
**Student ID:** D25CS120  
**Course:** Advanced Web Development Frameworks (AWDF) — Semester 5  
**Department:** Computer Science & Engineering (CSE)  
**Institution:** Charotar University of Science and Technology (CHARUSAT)  

---

## 🎯 Practical Objective
To implement **JWT-based authentication**, **bcrypt password hashing**, and **server-side input validation** as part of the Express middleware pipeline for the Task Management full-stack application.

---

## 🏗️ Architecture & Pipeline Flow

```text
1. User Registration:
   POST /api/auth/register ──► Salt & Hash password (bcryptjs 10 rounds) ──► Save User to MongoDB ──► Return 201 Created + Signed JWT

2. User Authentication:
   POST /api/auth/login ──► Verify password (bcrypt.compare) ──► Sign JWT (1-hour expiry) ──► Return 200 OK + Bearer Token

3. Protected Routes Pipeline (GET, POST, PUT, DELETE /api/tasks):
   Client HTTP Request (Header: Authorization: Bearer <token>)
            │
            ▼
   [Auth Middleware] (jwt.verify) ──► Invalid / Expired / Missing? ──► 401 Unauthorized (Protected!)
            │ (Token Valid -> req.user attached)
            ▼
   [Input Validation Middleware] ──► Missing / Invalid fields? ──► 400 Bad Request
            │
            ▼
   [Task Controllers & MongoDB Query] ──► Execute CRUD ──► 200 OK / 201 Created
```

---

## 📂 Project Structure

```text
pract7/
├── backend/                             # Express REST API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, Login & /me controllers
│   │   │   └── taskController.js        # Protected CRUD task controllers
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT Bearer verification middleware
│   │   │   ├── validateTaskInput.js     # Server-side input validation middleware
│   │   │   ├── validateId.js            # MongoDB 24-hex ObjectId validator
│   │   │   └── errorHandler.js          # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js                  # Mongoose User schema with bcrypt pre-save hook
│   │   │   └── Task.js                  # Mongoose Task schema with user reference
│   │   └── routes/
│   │       ├── authRoutes.js            # /api/auth/register, login, me
│   │       └── taskRoutes.js            # Protected /api/tasks routes
│   ├── .env                             # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example
│   ├── package.json
│   └── server.js                        # Express server entry point
│
├── frontend/                            # React 19 + Vite Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx & .css        # Student ID badge, JWT status, Login/Logout
│   │   │   ├── AuthModal.jsx & .css     # Interactive Login & Register modal dialog
│   │   │   ├── TaskForm.jsx & .css      # Validated task creation form
│   │   │   ├── TaskList.jsx & .css      # Filterable task cards with priority badges
│   │   │   └── Toast.jsx & .css         # Floating toast feedback alerts
│   │   ├── services/
│   │   │   └── api.js                   # Central REST client attaching Bearer token
│   │   ├── App.jsx & App.css            # Root student shell and state manager
│   │   ├── index.css                    # Modern design tokens
│   │   └── main.jsx
│   ├── index.html                       # Personalized HTML head
│   ├── vite.config.js                   # API Proxy to http://localhost:5000
│   └── package.json
│
├── package.json                         # Root package scripts (concurrently)
└── README.md
```

---

## ⚡ Quick Start & Run Guide

### 1. Install Dependencies
Open a terminal in the `pract7` folder and run:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
* The Express server will start on **`http://localhost:5000`**
* Connected to MongoDB: `mongodb://127.0.0.1:27017/taskmanager_maitri`

### 3. Start Frontend Client
In a second terminal:
```bash
cd frontend
npm run dev
```
* The React application will open on **`http://localhost:5173`**

---

## 🛠️ API Reference Table

| Method | Endpoint | Authorization | Description | Status Code |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new account (hashes password with bcrypt) | `201 Created`, `400 Bad Request` |
| `POST` | `/api/auth/login` | None | Authenticate credentials & issue JWT token | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/auth/me` | **Bearer &lt;token&gt;** | Get currently logged-in user details from decoded JWT | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/tasks` | **Bearer &lt;token&gt;** | List tasks belonging to authenticated user | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/tasks` | **Bearer &lt;token&gt;** | Create new task document (with input validation) | `201 Created`, `400 Bad Request`, `401 Unauthorized` |
| `PUT` | `/api/tasks/:id` | **Bearer &lt;token&gt;** | Update task by ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE`| `/api/tasks/:id` | **Bearer &lt;token&gt;** | Delete task document | `200 OK`, `404 Not Found` |

---

## 🧪 Postman / Thunder Client Testing Guide

### 1. Register User
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/auth/register`
* **Body (JSON):**
  ```json
  {
    "name": "Maitri Sheta",
    "studentId": "D25CS120",
    "email": "maitri@charusat.ac.in",
    "password": "password123"
  }
  ```
* **Expected Result:** `201 Created` with signed JWT `token`.

### 2. Login User
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "maitri@charusat.ac.in",
    "password": "password123"
  }
  ```
* **Expected Result:** `200 OK` with JWT `token`. Copy this token.

### 3. Test Route Protection (401 Unauthorized)
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/tasks`
* **Headers:** *(Do NOT send any Authorization header)*
* **Expected Result:** `401 Unauthorized` with error: *"Access denied. Authorization token missing."*

### 4. Access Protected Tasks with Bearer Token
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/tasks`
* **Header:** `Authorization`: `Bearer <your_copied_jwt_token>`
* **Expected Result:** `200 OK` with array of tasks.

### 5. Input Validation Rejection
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/tasks`
* **Header:** `Authorization`: `Bearer <your_token>`
* **Body (JSON):**
  ```json
  {
    "title": ""
  }
  ```
* **Expected Result:** `400 Bad Request` (*Validation Error: "title" is required and cannot be empty.*)

### 6. Verify Current User (`/me`)
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/auth/me`
* **Header:** `Authorization`: `Bearer <your_token>`
* **Expected Result:** `200 OK` returning user profile (`Maitri Sheta`, `D25CS120`).

---

## 💡 Viva Questions & Answers

### Q1: Why must passwords be hashed before storage instead of saved as plain text?
> **Answer:** Storing passwords in plain text creates an immediate critical vulnerability in the event of a database breach or accidental log leak. Using **bcrypt** with random salt rounds (10) ensures that identical passwords yield completely different hashes (protecting against rainbow table attacks) and makes brute-forcing computationally expensive.

### Q2: What does the authentication middleware actually verify, and what happens if the token is missing or expired?
> **Answer:** The middleware inspects the `Authorization` header for `Bearer <token>` and verifies the digital signature using `jwt.verify(token, JWT_SECRET)`.
> - If the token is **missing**, it immediately returns **`401 Unauthorized`**.
> - If the token is **expired or tampered with**, `jwt.verify` throws an error which is caught by a `try/catch` block to return **`401 Unauthorized`** without crashing the Node.js server.

### Q3: Why should input validation happen on the server even if the frontend already validates the same fields?
> **Answer:** Client-side frontend validation is solely for responsive user experience. Attackers or automated clients can easily bypass browser validation by sending HTTP requests directly via Postman, curl, or custom scripts. Server-side validation is the single authoritative defense for database integrity and security.
