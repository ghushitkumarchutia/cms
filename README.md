# CMS Backend API

A RESTful Content Management System backend built with **Node.js**, **Express 5**, and **MongoDB**. Features OTP-based email verification, JWT authentication, and CRUD operations for artifacts.

---

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Runtime        | Node.js                                               |
| Framework      | Express 5                                             |
| Database       | MongoDB (Mongoose 9 ODM)                              |
| Authentication | JWT (jsonwebtoken) + bcryptjs                         |
| Email          | Nodemailer (Gmail SMTP)                               |
| OTP            | otp-generator + bcrypt-hashed                         |
| Logging        | Morgan                                                |
| Dev Tooling    | Nodemon                                               |
| Population     | Mongoose populate (likes, comments)                   |
| Security       | Helmet, express-rate-limit (global API rate limiting) |

---

## Project Structure

```
cms-backend/
├── server.js                        # Entry point — loads env, connects DB, starts server
├── package.json
└── src/
    ├── app.js                       # Express app setup (CORS, JSON parsing, routes)
    ├── config/
    │   └── db.js                    # MongoDB connection via Mongoose
    ├── controllers/
    │   ├── auth.controller.js       # Send OTP, Verify OTP, Signup, Login
    │   └── artifact.controller.js   # Create, List, Like, Comment artifacts
    ├── middlewares/
      │   ├── auth.middleware.js       # JWT Bearer token verification
      │   └── rateLimiter.js           # Global API rate limiting middleware
    ├── models/
    │   ├── user.model.js            # User schema (email, password, isVerified)
    │   ├── otp.model.js             # OTP schema (email, otp, expiresAt) — hashed on save
    │   └── artifact.model.js        # Artifact schema (title, description, createdBy, likes, comments)
    └── routes/
      ├── auth.routes.js           # /api/auth/*
      └── artifact.routes.js       # /api/artifacts/* (create, list, like, comment)
```

---

## API Endpoints

### Root

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| GET    | `/`      | Welcome message |

### Authentication — `/api/auth`

| Method | Endpoint      | Body                  | Description                               |
| ------ | ------------- | --------------------- | ----------------------------------------- |
| POST   | `/send-otp`   | `{ email }`           | Generates a 6-digit OTP and emails it     |
| POST   | `/verify-otp` | `{ email, otp }`      | Verifies OTP against hashed record        |
| POST   | `/signup`     | `{ email, password }` | Creates a new user (password auto-hashed) |
| POST   | `/login`      | `{ email, password }` | Returns a JWT token (valid for 7 days)    |

### Artifacts — `/api/artifacts` _(requires authentication)_

| Method | Endpoint        | Headers                         | Body                     | Description                                         |
| ------ | --------------- | ------------------------------- | ------------------------ | --------------------------------------------------- |
| POST   | `/`             | `Authorization: Bearer <token>` | `{ title, description }` | Create a new artifact                               |
| GET    | `/`             | `Authorization: Bearer <token>` | —                        | List all artifacts (populates creator)              |
| POST   | `/:id/like`     | `Authorization: Bearer <token>` | —                        | Toggle like for artifact (like/unlike)              |
| GET    | `/:id/likes`    | `Authorization: Bearer <token>` | —                        | Get total likes and users who liked                 |
| POST   | `/:id/comment`  | `Authorization: Bearer <token>` | `{ text }`               | Add a comment to an artifact                        |
| GET    | `/:id/comments` | `Authorization: Bearer <token>` | —                        | List comments for an artifact (populates commenter) |

### Postman Tests — Artifacts (Likes & Comments)

- **Base URL:** `http://localhost:PORT/api/artifacts`  
   Replace `PORT` with your server port (e.g., `3000`).

- **Common Headers (all requests):**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

- **1) Toggle Like**
  - Method: `POST`
  - URL: `/api/artifacts/:id/like`
  - Body: none
  - Expected: `200` with `{ "message": "Liked" | "Unliked", "totalLikes": <number> }`

- **2) Get Likes**
  - Method: `GET`
  - URL: `/api/artifacts/:id/likes`
  - Expected: `200` with `{ "totalLikes": <number>, "users": [ { "_id": "...", "name": "...", "email": "..." } ] }`

- **3) Add Comment**
  - Method: `POST`
  - URL: `/api/artifacts/:id/comment`
  - Body (raw JSON): `{ "text": "Your comment here" }`
  - Expected: `200` with `{ "message": "Comment added", "comments": [ ... ] }`
  - Validation: `text` is required — empty text returns `400` with `{ message: "Comment text is required" }`

- **4) Get Comments**
  - Method: `GET`
  - URL: `/api/artifacts/:id/comments`
  - Expected: `200` with `{ "totalComments": <number>, "comments": [ { "_id":"...", "userId": { "_id":"...","name":"...","email":"..." }, "text":"..." } ] }`

- **Quick flow:**
  1. Create an artifact: `POST /api/artifacts` (save the `_id`).
  2. Use a valid JWT for the user to `POST /:id/like` and `POST /:id/comment`.
  3. Verify with `GET /:id/likes` and `GET /:id/comments`.

---

## Authentication Flow

```
1. POST /api/auth/send-otp      → OTP generated, hashed, stored in DB, emailed to user
2. POST /api/auth/verify-otp    → OTP compared against hashed record (10-min expiry)
3. POST /api/auth/signup        → User created with hashed password
4. POST /api/auth/login         → Credentials verified → JWT issued (7-day expiry)
5. Authenticated requests       → Include `Authorization: Bearer <token>` header
```

---

## Data Models

### User

| Field      | Type    | Details                  |
| ---------- | ------- | ------------------------ |
| email      | String  | Required, unique         |
| password   | String  | Required, bcrypt-hashed  |
| isVerified | Boolean | Default: `false`         |
| timestamps | —       | `createdAt`, `updatedAt` |

### OTP

| Field      | Type   | Details                   |
| ---------- | ------ | ------------------------- |
| email      | String | Recipient email           |
| otp        | String | bcrypt-hashed before save |
| expiresAt  | Date   | 10 minutes from creation  |
| timestamps | —      | `createdAt`, `updatedAt`  |

### Artifact

| Field       | Type       | Details                                                             |
| ----------- | ---------- | ------------------------------------------------------------------- |
| title       | String     | Artifact title                                                      |
| description | String     | Artifact description                                                |
| createdBy   | ObjectId   | Ref → `User`                                                        |
| likes       | [ObjectId] | Array of User IDs who liked (populated)                             |
| comments    | [Object]   | Array of comment objects: `{ userId, text, createdAt }` (populated) |
| timestamps  | —          | `createdAt`, `updatedAt`                                            |

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) for Nodemailer

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd CMS/cms-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `cms-backend/` directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cms                  # Local MongoDB
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority   # MongoDB Atlas
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Run

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`.

---

## Key Implementation Details

- **Password Security** — User passwords are automatically hashed using `bcryptjs` (salt rounds: 10) via a Mongoose `pre('save')` hook.
- **OTP Security** — OTPs are hashed with bcrypt before storage; plain-text OTPs are never persisted.
- **JWT Strategy** — Tokens are signed with `HS256` using the `JWT_SECRET` env variable and expire after 7 days. The middleware extracts tokens from the `Authorization: Bearer <token>` header.
- **Rate Limiting** — All `/api` routes are protected by a global rate limiter middleware (`rateLimiter.js`, using `express-rate-limit`). Limits each IP to 100 requests per 15 minutes. Customizable and centralized for maintainability.
- **Artifact Likes** — Each artifact stores an array of user IDs (`likes`). Like/unlike is toggled via `/api/artifacts/:id/like`. Populated with user info for `/likes` endpoint.
- **Artifact Comments** — Each artifact stores an array of comment objects (`comments`). Comments are added via `/api/artifacts/:id/comment`. Populated with user info for `/comments` endpoint. Comment text is validated and trimmed.
- **CORS** — Enabled globally with default settings.
- **Body Parsing** — JSON payloads accepted up to 10 MB.
- **Request Logging** — All requests are logged in `dev` format via Morgan.

---

## License

ISC
