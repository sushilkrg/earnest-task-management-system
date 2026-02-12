# Task Management System – Full Stack (Backend + Frontend)

A full-stack **Task Management System** built as part of the Earnest Fintech Software Engineering Assessment (Track A – Full Stack). It includes:

- **Backend**: Node.js, TypeScript, Express, Prisma ORM, PostgreSQL (Neon or local)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS

Users can **register, log in, and manage personal tasks** (create, view, edit, delete, toggle status) with secure authentication (JWT access + refresh tokens), pagination, filtering, and search.

---

## 1. Tech Stack

### Backend

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL (local or Neon)
- JWT (access + refresh tokens)
- Zod (validation)
- Helmet, CORS, Rate limiting, Morgan (logging)

### Frontend

- Next.js (App Router) + TypeScript
- React 18
- Tailwind CSS
- Axios
- react-hot-toast
- date-fns

---

## 2. Repository Structure

```bash
.
├── backend/        # Node.js + TS + Prisma API
└── frontend/       # Next.js + TS client

```
### Clone the repository:

```bash
git clone https://github.com/sushilkrg/earnest-task-management-system.git
cd earnest-task-management-system
```

## 3. Backend – Setup & Configuration
### 3.1. Backend – Installation
```bash
cd backend
npm install
```

### 3.2. Backend – Environment Variables
Create .env in backend/ (next to package.json) based on .env.example:

```bash
cp .env.example .env
Then edit .env:

# Server
NODE_ENV=development
PORT=5000

# Database
# If using local Postgres:
# DATABASE_URL="postgresql://postgres:your_password@localhost:5432/taskmanagement?schema=public"

# If using Neon:
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<db-name>?sslmode=require"

# JWT Secrets (use strong, long random strings in real envs)
JWT_ACCESS_SECRET=your_access_secret_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_chars

# Token expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000
Make sure DATABASE_URL, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET are not empty.
```


### 3.3. Backend – Prisma Setup
From backend/:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create DB schema
npx prisma migrate dev --name init

# (Optional) View DB in browser
npx prisma studio
```

### 3.4. Backend – Run in Dev
```bash
cd backend
npm run dev
```

API is available at:
http://localhost:5000/api

### 3.5. Backend – Build & Run in Prod
```bash
cd backend
npm run build
npm start
```

## 4. Backend – API Endpoints
All backend routes are prefixed with /api.

### 4.1. Authentication Routes
Base path: /api/auth
```
Method	Route	Description	Auth
POST	/auth/register	Register a new user	❌
POST	/auth/login	Login, returns access & refresh tokens	❌
POST	/auth/refresh	Get new access & refresh tokens using refresh	❌
POST	/auth/logout	Logout, invalidate refresh token	❌
```

Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
Response:

user: { id, name, email }

accessToken

refreshToken
```
Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```
Refresh
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<existing_refresh_token>"
}
```
Logout
```
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "<existing_refresh_token>"
}
```

### 4.2. Task Routes
All task routes are protected and require an 
```
Authorization: Bearer <accessToken> header.
```
Base path: /api/tasks

| Method | Route             | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| GET    | /tasks            | Get tasks (pagination, filtering, search) |
| POST   | /tasks            | Create new task                           |
| GET    | /tasks/:id        | Get a single task by id                   |
| PATCH  | /tasks/:id        | Update a task                             |
| DELETE | /tasks/:id        | Delete a task                             |
| POST   | /tasks/:id/toggle | Toggle task status (COMPLETED ↔ PENDING)  |

Get Tasks (with pagination, filtering, search)
```
GET /api/tasks?page=1&limit=10&status=PENDING&search=Project&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <accessToken>
```

Query params:

- page (number, default 1)

- limit (number, default 10)

- status (optional) – PENDING, IN_PROGRESS, COMPLETED

- priority (optional) – LOW, MEDIUM, HIGH

- search (optional) – matches task title/description

- sortBy (optional) – createdAt, dueDate, priority

- sortOrder (optional) – asc or desc

Example response:

```
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Task 1",
        "description": "Description",
        "status": "PENDING",
        "priority": "MEDIUM",
        "dueDate": "2026-02-12T00:00:00.000Z",
        "createdAt": "2026-02-12T12:00:00.000Z",
        "updatedAt": "2026-02-12T12:00:00.000Z",
        "userId": "user-uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## 7. How to Run the Full Stack Locally
1. Clone repo

```
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_REPO_FOLDER>
```

2. Backend

```
cd backend
cp .env.example .env
# Edit .env with your DB + JWT secrets
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Backend at: http://localhost:5000/api

3. Frontend
In a new terminal:
```
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```
Frontend at: http://localhost:3000

4. Use the app
- Open http://localhost:3000
- Register a new account
- Login
- Create, view, edit, delete, and toggle tasks from the dashboard

## 8. Scripts Reference
 Backend
 ```
 cd backend

npm run dev        # Start backend in dev (watch mode)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled server (dist/server.js)

npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Run migrations (dev)
npx prisma migrate deploy    # Run migrations (prod)
npx prisma studio            # Open Prisma Studio
```
Frontend

```
cd frontend

npm run dev        # Start Next.js dev server
npm run build      # Build frontend for production
npm start          # Start Next.js production server
```
