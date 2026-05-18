# AI-Based Employee Performance Analytics & Recommendation System

A full-stack MERN application that analyzes employee performance data and provides AI-powered recommendations using OpenRouter API.

## Features

- **Employee Management** — Add, view, edit, and delete employee records
- **Performance Tracking** — Track skills, performance scores, and experience
- **AI Recommendations** — Promotion suggestions, training plans, rankings, and feedback powered by AI
- **Analytics Dashboard** — Visual charts, department stats, and employee rankings
- **Authentication** — JWT-based auth with bcrypt password hashing
- **Search & Filter** — Find employees by name, department, or skills

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark Theme) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| AI | OpenRouter API |

## Project Structure

```
├── server/           # Backend API
│   ├── config/       # Database configuration
│   ├── controllers/  # Route handlers
│   ├── middleware/    # Auth & error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   └── server.js     # Entry point
├── client/           # React Frontend
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # Auth context
│       └── pages/       # Page components
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register user
- `POST /api/auth/login` — Login & get JWT

### Employees
- `POST /api/employees` — Add employee
- `GET /api/employees` — Get all employees
- `GET /api/employees/search?department=X` — Search employees
- `PUT /api/employees/:id` — Update employee
- `DELETE /api/employees/:id` — Delete employee

### AI
- `POST /api/ai/recommend` — Get AI recommendation

## Setup

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=your_mongodb_uri
OPENROUTER_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

## Author
Built for ESE Examination — AI Driven Full Stack Development (AI308B)
