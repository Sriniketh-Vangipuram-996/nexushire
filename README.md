# NexusHire 🚀

An AI-powered Job Application Tracker built with the MERN stack, BullMQ, Redis, Socket.IO, and OpenAI.

## Features

- 🔐 JWT Authentication with Refresh Tokens
- 📧 Email Verification & Password Reset
- 👤 User Profiles with Avatar Upload
- 📄 Resume Management
- 💼 Job Application Tracking
- 🤖 AI Resume vs Job Description Matching
- 📊 Analytics Dashboard
- 🔔 Real-time Notifications (Socket.IO)
- ⏰ Email Reminder Scheduling (BullMQ + Redis)
- 📝 Audit Logging
- ⚡ Redis Caching & Rate Limiting
- 🌙 Dark / Light Theme

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Zustand
- React Router
- Recharts
- Socket.IO Client

### Backend
- Node.js
- Express
- MongoDB
- Redis
- BullMQ
- Socket.IO
- JWT
- Nodemailer
- Winston

## Project Structure

```
NexusHire/
│
├── frontend/
│   └── React + TypeScript
│
├── backend/
│   └── Express + MongoDB + Redis
│
└── README.md
```

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

Frontend runs on:

```
http://localhost:5173
```

## Environment Variables

Each folder contains its own `.env` file.

See `frontend/README.md` and `backend/README.md` for details.

## Author

**Sriniketh Vangipuram**