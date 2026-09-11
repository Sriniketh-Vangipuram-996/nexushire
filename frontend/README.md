# NexusHire Frontend

React + TypeScript frontend for the NexusHire platform.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router
- Axios
- Recharts
- Socket.IO Client

## Features

- User authentication
- Profile management
- Resume upload
- AI comparison UI
- Analytics dashboard
- Real-time notifications
- Reminder center
- Dark / Light mode

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000/api
```

## Start Development Server

```bash
npm run dev
```

Runs at:

```
http://localhost:5173
```

## Build

```bash
npm run build
```

## Folder Structure

```
src/
│
├── components/
├── pages/
├── store/
├── services/
├── hooks/
├── lib/
├── types/
└── utils/
```

## State Management

Global authentication uses **Zustand**.

Features include:

- Persistent user session
- Refresh token login
- Avatar updates
- Profile updates

## Charts

Analytics uses **Recharts** for:

- Status distribution
- Monthly trends
- KPI cards
- Skill gap visualization