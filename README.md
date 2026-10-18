# NexusHire

**NexusHire** is a full-stack job-search and career-management platform
for organizing job applications, tracking progress, receiving follow-up
reminders, and working with AI-powered resume insights.

The project combines a React/TypeScript frontend with an
Express/TypeScript API, MongoDB persistence, Redis/BullMQ background
jobs, email delivery, and real-time notifications.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Architecture](#architecture)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Running Locally](#running-locally)
-   [API Overview](#api-overview)
-   [Automatic Follow-Up Reminders](#automatic-follow-up-reminders)
-   [Deployment](#deployment)
-   [Project Structure](#project-structure)
-   [Security Notes](#security-notes)
-   [Troubleshooting](#troubleshooting)

## Overview

Managing a job search across multiple companies can be difficult.
NexusHire brings job application records, status tracking, reminders,
analytics, and resume-related assistance into one application.

**Production deployment** - **Frontend:**
https://nexushire-eta.vercel.app - **Backend API host:**
https://nexushire-n1br.onrender.com - **API base path:** `/api/v1`

> These are the deployment URLs configured during development. If
> deployment URLs change, update this section and the related
> environment variables.

## Features

### Job application management

-   Create and manage job application records.
-   Track the current status of an application, including statuses such
    as `Applied`, `Interviewed`, `Offer`, and `Rejected`.
-   Keep relevant role and company details together.
-   Update application status as the hiring process progresses.

### Dashboard and analytics

-   View job-search activity and application progress from dashboard
    analytics.
-   Use aggregated application information to understand the current
    job-search pipeline.

### Follow-up reminders and email

-   Automatically schedule a follow-up reminder for a newly created
    application when its status is `Applied`.
-   The current reminder logic schedules the follow-up for **three days
    after the application date**.
-   Store reminder state and delivery details in MongoDB.
-   Use BullMQ and Redis to schedule and process email jobs.
-   Track successful or failed reminder delivery.

### Notifications

-   Persist notification records for users.
-   Deliver real-time notification events through Socket.IO and Redis
    Pub/Sub.
-   Support notification updates such as reminder delivery events.

### Authentication and access control

-   JWT-based authentication with access/refresh-token support.
-   Email verification and password-reset flows.
-   Role-based access control (RBAC) for protected functionality.
-   Authenticated API requests and user-scoped application data.

### AI and resume functionality

-   AI-assisted resume analysis and job/resume matching or scoring.
-   Resume-related functionality is configured through the backend and
    its AI provider credentials.

### Reliability and backend infrastructure

-   MongoDB for application data.
-   Redis for queueing, caching, and Pub/Sub.
-   BullMQ for delayed and recurring jobs.
-   API rate limiting.
-   Audit logging for relevant actions.
-   Multi-tenancy support in the backend.
-   Queue monitoring and recurring job registration.

## Tech Stack

  -----------------------------------------------------------------------
  Layer                               Technologies
  ----------------------------------- -----------------------------------
  Frontend                            React, TypeScript, Vite, Tailwind
                                      CSS, Zustand, React Router

  Backend                             Node.js, Express, TypeScript

  Database                            MongoDB, Mongoose

  Authentication                      JWT access/refresh tokens

  Background jobs                     BullMQ, Redis, ioredis

  Real-time events                    Socket.IO, Redis Pub/Sub

  Email                               Backend email service and email
                                      templates

  AI                                  OpenAI API integration

  Deployment                          Vercel (frontend), Render
                                      (backend), Render Key Value/Redis
  -----------------------------------------------------------------------

## Architecture

``` text
Browser
  |
  v
React + TypeScript + Vite frontend (Vercel)
  |
  | HTTPS /api/v1
  v
Express + TypeScript API (Render)
  |             |              |
  v             v              v
MongoDB       Redis/BullMQ    Socket.IO
                 |
                 v
           Email job worker
                 |
                 v
             Email provider

Redis Pub/Sub relays notification events to the API process,
which persists notifications and emits real-time events.
```

The deployed backend starts the email worker as part of the server
startup. A separate Render background worker is not required for the
current setup, provided the deployed server continues to call
`startWorker()`.

## Getting Started

### Prerequisites

Install or arrange access to:

-   Node.js and npm (use a version supported by your dependencies).
-   MongoDB, either locally or through a hosted MongoDB service.
-   Redis, either locally or through a hosted Redis service.
-   Email provider credentials for sending emails.
-   An OpenAI API key if you want to use the AI features.

### Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

The project has separate frontend and backend applications. Run the
commands from the relevant directory.

## Environment Variables

Create a `.env` file in the backend directory. Use the variable names
expected by the actual configuration files in your checkout; not every
optional integration is required for every workflow.

Example template:

``` dotenv
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/nexushire

# Redis / BullMQ
REDIS_URL=redis://127.0.0.1:6379

# Authentication — use long, unique, random secrets
JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret

# Frontend origin used by CORS and email links
FRONTEND_URL=http://localhost:5173

# Email provider — exact names depend on src/config/email.ts
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# AI features
OPENAI_API_KEY=
```

Some deployments may use provider-specific email variables or additional
settings. Check `src/config/email.ts`, the authentication configuration,
Redis configuration, and other `process.env` references to confirm the
exact names required by the current code.

For the frontend, create its environment file (commonly `.env` or
`.env.local`) and set the API base URL using the variable name read by
the frontend configuration. For Vite, public environment variables
normally use the `VITE_` prefix. Example value:

``` dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**Important:** `VITE_API_BASE_URL` is an example name. If the project
uses a different variable name in its API client, use that exact name.

Never commit real credentials, production connection strings, JWT
secrets, API keys, or email passwords.

## Running Locally

### Backend

``` bash
cd backend
npm install
npm run dev
```

The development script starts the backend through `src/server.ts`. The
default local port is `5000`, unless overridden by `PORT`.

Useful backend scripts:

``` bash
npm run build
npm start
npm test
npm run test:coverage
```

-   `npm run build` compiles TypeScript into the build output.
-   `npm start` starts the compiled production server.
-   `npm test` runs the test suite.
-   `npm run test:coverage` runs tests with coverage reporting.

The repository also defines `worker` and `email-worker` scripts. In the
current deployment design, the API server starts the email worker
itself. If running a worker separately for local debugging, first
confirm that the selected script actually invokes the worker startup
function and does not create a duplicate consumer.

### Frontend

In a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite commonly serves the frontend at `http://localhost:5173`. Check the
frontend package scripts if the directory name or port differs in your
checkout.

### Local development checklist

1.  Configure the backend `.env`.
2.  Start MongoDB and Redis.
3.  Confirm the frontend API base URL points to the local backend.
4.  Ensure backend CORS allows the frontend origin.
5.  Start the backend and frontend.
6.  Register or sign in, then test the job-management flow.

## API Overview

The API is versioned under `/api/v1`.

The following is a high-level route guide; use the route files in the
current repository as the source of truth for exact HTTP methods,
request bodies, and response shapes.

  -------------------------------------------------------------------------------
  Area                    Route prefix                    Purpose
  ----------------------- ------------------------------- -----------------------
  Authentication          `/api/v1/auth`                  Sign-in, session/user
                                                          details, verification,
                                                          and password-reset
                                                          flows

  Job applications        `/api/v1/jobs`                  Create, view, update,
                                                          and manage job
                                                          applications

  Reminders               `/api/v1/reminders`             Access and manage
                                                          reminder records

  Analytics               `/api/v1/analytics/dashboard`   Dashboard analytics
  -------------------------------------------------------------------------------

Authenticated endpoints require a valid session/token according to the
frontend and backend authentication configuration. Keep user-specific
resources scoped to the authenticated user.

## Automatic Follow-Up Reminders

The current automatic follow-up flow works as follows:

1.  A user creates a job application with status `Applied`.
2.  The API creates the job application in MongoDB.
3.  If a scheduled reminder does not already exist for that user and
    job, the API creates one.
4.  The API adds an `autoFollowUp` job to the BullMQ `emailQueue`.
5.  The job is delayed until the reminder date, currently three days
    after creation.
6.  The worker sends the follow-up email and updates the reminder
    status.
7.  Notification events can be published through Redis Pub/Sub and
    delivered to the user in real time.

Applications created with statuses such as `Interviewed`, `Offer`, or
`Rejected` do not trigger this automatic follow-up through the
create-application path. Review the status-update controller separately
if you change the intended reminder policy.

For production scheduling, calculate the delay from the reminder
timestamp rather than using a fixed short delay:

``` ts
const delay = Math.max(0, followUpDate.getTime() - Date.now());

await emailQueue.add(
  "autoFollowUp",
  {
    to: user.email,
    jobTitle: job.role,
    company: job.companyName,
    reminderId: reminder._id.toString(),
    userId: req.user.userId.toString(),
    requestId: req.requestId,
  },
  { delay }
);
```

Use a separate short-delay test job to verify email delivery. Do not
shorten the production reminder delay just to test the email pipeline.

## Deployment

### Frontend --- Vercel

1.  Import the frontend repository/project into Vercel.
2.  Set the frontend API base URL to the deployed backend API host plus
    `/api/v1`, using the exact environment variable expected by the
    code.
3.  Configure any other required frontend environment variables.
4.  Deploy and verify sign-in, protected routes, and API requests.

### Backend --- Render

1.  Create a Render web service connected to the backend repository.
2.  Configure the build and start commands according to the backend
    package scripts. The current scripts use `npm run build` and
    `npm start`.
3.  Add all required production environment variables in Render.
4.  Set `NODE_ENV=production`.
5.  Configure MongoDB and Redis connection strings.
6.  Configure CORS to allow the deployed Vercel origin, for example
    `https://nexushire-eta.vercel.app`.
7.  Deploy and inspect startup logs for database, Redis, Pub/Sub,
    worker, recurring-job, and server-startup messages.

### Redis and queues

BullMQ requires a Redis configuration suitable for persistent queue
operation. Review the Redis provider's memory and eviction settings;
BullMQ recommends the `noeviction` policy rather than an eviction policy
such as `allkeys-lru`.

The current backend starts its email worker inside the API service.
Ensure the service stays running for delayed jobs to be processed. After
deployment, verify a real job is queued and later processed; a log
saying that the worker started alone does not prove that email delivery
works.

### Production verification

-   Sign in and load the current-user endpoint.
-   Create an application with status `Applied`.
-   Confirm the reminder is stored as scheduled.
-   Confirm the BullMQ job is queued with the expected delay.
-   Confirm the worker processes the job and updates its status.
-   Confirm the email arrives.
-   Confirm notification behavior in the UI.
-   Check logs for failures without exposing credentials or tokens.

## Project Structure

The following is a conceptual overview; names may vary slightly
depending on the current checkout.

``` text
NexusHire/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/       # API client / integrations
│   │   ├── store/           # Zustand state
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── src/
    │   ├── config/          # Database, Redis, email configuration
    │   ├── controllers/     # Request handlers
    │   ├── models/          # Mongoose models
    │   ├── queues/          # Queue registration and monitoring
    │   ├── services/        # Business logic
    │   ├── utils/           # Helpers, templates, Pub/Sub, logging
    │   ├── workers/         # Background job processors
    │   ├── app.ts
    │   └── server.ts
    └── package.json
```

## Security Notes

-   Keep `.env` files out of version control.
-   Use different, strong secrets for access-token and refresh-token
    signing.
-   If a JWT secret or token is exposed in logs, rotate the relevant
    secret(s), redeploy, and sign in again.
-   Never share raw `Cookie`, `Set-Cookie`, `Authorization`, database
    URL, Redis URL, or API-key values in issue reports or screenshots.
-   Restrict CORS to trusted frontend origins.
-   Validate and authorize every request that accesses user-owned data.
-   Use HTTPS for production traffic.
-   Ensure uploaded files are stored in a suitable persistent storage
    service for production. Local `/uploads` storage may not persist
    across redeploys or work reliably across multiple instances.
-   Avoid logging passwords, tokens, or other sensitive values.

## Troubleshooting

### Login works locally but not in production

-   Confirm the deployed frontend URL is included in backend CORS
    configuration.
-   Verify credentialed requests and cookie settings are compatible with
    the production HTTPS domains.
-   Check that frontend API requests target the production backend.
-   Inspect browser network errors and backend logs, with secrets
    redacted.

### Follow-up email does not arrive

-   Confirm the job status is `Applied`.
-   Confirm the reminder was created and the BullMQ job was added to
    `emailQueue`.
-   Check that the worker started and that a `Processing job` log
    appears.
-   Check the reminder state and worker error logs.
-   Verify email provider credentials and delivery limits.
-   Remember that the production reminder is scheduled three days after
    creation.

### Worker starts but no email is sent

A worker startup message only proves that the consumer started. Trace
the entire flow: application creation → reminder creation → queue
insertion → worker processing → email-provider response → reminder
status update.

### Redis connection or queue issues

-   Verify `REDIS_URL` is correct and reachable from the Render service.
-   Confirm the producer and worker use the same Redis service and queue
    name.
-   Check Redis memory/eviction settings.
-   Inspect logs for connection timeouts and BullMQ errors.

## Contributing

1.  Create a branch for your change.
2.  Make the change and run the relevant tests.
3.  Run `npm run build` in the backend before deploying backend changes.
4.  Test affected flows locally.
5.  Submit a pull request or merge through your normal repository
    workflow.

## License

Add the license that applies to this repository. If no license has been
selected, the project should not be assumed to be open source or
available for reuse.

------------------------------------------------------------------------

Built as **NexusHire** --- one place to organize applications, stay on
top of follow-ups, and manage the job-search journey.
