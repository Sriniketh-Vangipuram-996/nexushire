# NexusHire Backend

Express + MongoDB backend powering the NexusHire application.

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- Redis
- BullMQ
- Socket.IO
- JWT
- Nodemailer
- Winston

## Features

- JWT Authentication
- Refresh Token Flow
- Email Verification
- Password Reset
- Resume & Avatar Upload
- AI Resume Analysis API
- Job Applications CRUD
- Reminder Queue
- Redis Cache
- Audit Logs
- Multi-tenant support

## Installation

```bash
npm install
```

## Environment Variables

Create `.env`

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/nexushire

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EMAIL_SECRET=your_email_secret
JWT_RESET_SECRET=your_reset_secret

EMAIL_USER=example@gmail.com
EMAIL_PASS=app_password

FRONTEND_URL=http://localhost:5173

OPENAI_API_KEY=your_openai_key
```

## Development

```bash
npm run dev
```

## Worker

BullMQ email worker runs separately.

```bash
npm run worker
```

## API Routes

### Authentication

```
POST /auth/signup
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

### Jobs

```
GET    /jobs
POST   /jobs
PUT    /jobs/:id
DELETE /jobs/:id
```

### Reminders

```
GET    /reminders
POST   /reminders
PATCH  /reminders/:id/snooze
DELETE /reminders/:id
```

### Analytics

```
GET /analytics/dashboard
```

## Queue System

BullMQ powers:

- Interview reminders
- Auto follow-ups
- Weekly summaries

Redis stores delayed jobs while MongoDB stores reminder metadata.

## Logging

Winston provides:

- Request logs
- Error logs
- Audit events
- Queue events