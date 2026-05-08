# CMS Backend - Production Grade Node.js & MongoDB

A placement-ready, high-performance Content Management System (CMS) backend built with industry-standard patterns and advanced MongoDB features. This project demonstrates deep expertise in Mongoose, security, and scalable system architecture.

## 🚀 Key Features

### 🛠 Core Architecture
- **Phased Implementation**: Developed through clear, commit-based phases for maintainability.
- **Global Error Handling**: Centralized `asyncHandler` and `errorHandler` to ensure 100% uptime and clean controllers.
- **RBAC (Role-Based Access Control)**: Tiered access for `user` and `admin` roles with custom authorization middleware.
- **Security First**: 
    - Helmet.js for security headers.
    - Express Rate Limiting to prevent brute force.
    - Regex-based input validation and Mongoose schema-level hardening.
    - Password hashing using `bcryptjs`.

### 🍃 Advanced MongoDB Integration
- **Hardened Schemas**: Comprehensive validation, custom `toJSON` transforms, and virtuals for derived data (e.g., counters).
- **Atomic Operators**: Leveraged `$addToSet` and `$pull` for high-concurrency like/comment operations to avoid race conditions.
- **Compound & Text Indexes**: Optimized search performance with compound indexes and MongoDB Text Search on titles and descriptions.
- **TTL Indexes**: Auto-expiring OTPs using MongoDB's Time-To-Live indexes.
- **Capped Collections**: High-performance audit logging using capped collections for automatic storage rotation.
- **Transactions (ACID)**: Guaranteed data integrity during complex operations like cascade account deletion using Mongoose Sessions and Transactions.
- **Aggregation Pipelines**: 5+ complex analytics pipelines demonstrating `$lookup`, `$unwind`, `$group`, and `$project` for real-time insights.

### 📁 Functional Modules
- **Authentication**: Robust Signup-then-Verify flow with email OTP support (Nodemailer).
- **Artifact Management**: Full CRUD with Multer-based image uploads, ownership verification, and physical file cleanup on update/delete.
- **Advanced Querying**: Reusable `queryBuilder` supporting multi-field filtering, pagination, field selection, and sorting.
- **Audit Logging**: Comprehensive activity tracking capturing IP, User Agent, and action details.

## 📁 Project Structure

```bash
src/
├── config/             # Database connection & graceful shutdown
├── controllers/        # Logic handlers (Auth, Artifact, Admin, Analytics, etc.)
├── middlewares/        # Security, Auth, RBAC, Rate Limit, Error, Upload
├── models/             # Hardened Mongoose schemas
├── routes/             # Clean API route definitions
├── utils/              # Reusable utilities (asyncHandler, queryBuilder, logger)
└── app.js              # Express app configuration
```

## 🛠 Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose v8)
- **Security**: JWT, Bcryptjs, Helmet, Express-Rate-Limit
- **Files**: Multer
- **Emails**: Nodemailer

## 🚦 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   UPLOAD_PATH=uploads/
   EMAIL_USER=your_gmail
   EMAIL_PASS=your_app_password
   ```

3. **Run Development**:
   ```bash
   npm run dev
   ```

## 📈 MongoDB Performance Showcase
This project avoids basic CRUD patterns in favor of senior-level optimizations:
- **Index Strategy**: Every query is backed by an index (verified via `.explain()`).
- **Memory Efficiency**: Heavy use of `.lean()` for read-only operations to bypass Mongoose document overhead.
- **Atomic Integrity**: Zero "fetch-then-save" patterns for counters; all updates use atomic MongoDB operators.

---
*Built with precision as a Placement Perfect Showcase.*
