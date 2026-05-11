# Volunteer Management System

A MERN stack application for managing volunteers, events, tasks, attendance, and reports.

## Tech Stack

- MongoDB with Mongoose
- Express.js and Node.js
- React with Vite
- JWT authentication
- bcrypt password hashing
- Axios API calls

## Project Structure

```text
Volunteer/
  client/   React frontend
  server/   Express API
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create the server environment file:

```bash
copy server\.env.example server\.env
```

3. Start MongoDB locally, then run the API:

```bash
npm run dev:server
```

4. In another terminal, run the React app:

```bash
npm run dev:client
```

The frontend defaults to `http://localhost:5173`, and the API defaults to `http://localhost:5000`.

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events`
- `POST /api/events`
- `POST /api/events/:id/register`
- `GET /api/volunteers`
- `PUT /api/volunteers/:id/status`
- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/attendance`
- `GET /api/reports/summary`

## Roles

- Admins can approve volunteers, create events, assign tasks, mark attendance, and view reports.
- Volunteers can register, log in, view events, register for events, and update assigned task status.
