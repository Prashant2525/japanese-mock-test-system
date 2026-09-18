# Dream Mock Test System

A MERN application for Japanese-language learners and exam candidates.

## Project Structure

````text
Mock Test System/
├── client/                  # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── seed.js
│       └── server.js
│
├── images/                  # Project images
├── .env                    # Root environment variables
├── .env.example            # Root environment template
├── .gitignore
├── package.json             # Root project scripts
└── README.md

## Requirements

* Node.js 20+
* MongoDB running locally or a MongoDB connection string
* Google OAuth credentials for Google sign-in

## Local Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and configure the required environment variables.

At minimum, set:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
````

If Google sign-in is required, add your Google OAuth credentials to the appropriate environment file.

> **Important:** Never commit real credentials or secrets to Git. Keep them in `.env` files, which are ignored by Git. The `.env.example` files should contain placeholders only.

### 2. Install Dependencies

From the project root:

```powershell
cd "D:\Mock Test System"
npm run install:all
```

This installs the dependencies for the root project, client, and server.

### 3. Seed Demo Data

To load the clearly labeled demo courses, questions, and tests:

```powershell
cd "D:\Mock Test System"
npm run seed
```

You generally only need to run the seed command when you need to populate or reset the database with the project's demo data.

## Running the Application

The project contains two separate applications:

- **Client** — React + Vite frontend
- **Server** — Node.js + Express backend

You can run them separately in two terminals or run both together from the project root.

### Option 1: Run Client and Server Separately

#### Terminal 1 — Server

```powershell
cd "D:\Mock Test System\server"
npm run dev
```

The API server runs at:

```text
http://localhost:5000
```

#### Terminal 2 — Client

Open a second terminal:

```powershell
cd "D:\Mock Test System\client"
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

### Option 2: Run Client and Server Together

From the project root:

```powershell
cd "D:\Mock Test System"
npm run dev
```

This starts both the client and server together.

### Quick Reference

| Application | Directory    | Command        | URL                             |
| ----------- | ------------ | -------------- | ------------------------------- |
| Server      | `server/`    | `npm run dev`  | `http://localhost:5000`         |
| Client      | `client/`    | `npm run dev`  | `http://localhost:5173`         |
| Both        | Project root | `npm run dev`  | Client: `5173` / Server: `5000` |
| Seed Data   | Project root | `npm run seed` | —                               |

## Assessment Configuration

The assessment threshold and scoring defaults are defined in:

```text
server/src/config/assessmentConfig.js
```

These values can be changed without rewriting the controllers or UI.

## Password Reset Emails

Password reset emails use Gmail SMTP when the following variables are configured in `server/.env`:

```env
MAIL_HOST=
MAIL_USER=
MAIL_APP_PASSWORD=
MAIL_FROM=
```

Gmail App Passwords require **2-Step Verification** to be enabled on the Google account.

If mail settings are not configured during development, the password reset URL falls back to the local console flow.

## Environment Files

The project uses environment-specific configuration files.

### Root

```text
.env
.env.example
```

### Client

```text
client/.env
client/.env.example
```

### Server

```text
server/.env
server/.env.example
```

Real `.env` files contain local credentials and must **not** be committed to Git.

The `.env.example` files are safe templates and should contain placeholders rather than real credentials.
