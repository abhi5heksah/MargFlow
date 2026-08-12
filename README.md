# MargFlow 🚀

> **Scribe-Style Automated Process Documentation & Workflow Recording Platform**

MargFlow is a complete, open-source, self-hosted platform for automatically recording, creating, editing, and publishing step-by-step visual workflow guides (Standard Operating Procedures - SOPs).

By combining a **Chrome Browser Extension (Manifest v3)**, a **NestJS API Backend**, a **React Web Application**, and **MinIO Object Storage**, MargFlow turns your manual web browser actions into beautiful, interactive, step-by-step tutorials within seconds.

---

## 📋 Table of Contents

- [What is MargFlow?](#-what-is-margflow)
- [Why MargFlow? (Key Value & Use Cases)](#-why-margflow-key-value--use-cases)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Data Flow & How It Works](#-data-flow--how-it-works)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started & Installation](#-getting-started--installation)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Start Infrastructure (Docker)](#2-start-infrastructure-docker)
  - [3. Configure & Initialize Backend](#3-configure--initialize-backend)
  - [4. Start Development Servers](#4-start-development-servers)
  - [5. Install the Chrome Extension](#5-install-the-chrome-extension)
- [Usage Workflow Guide](#-usage-workflow-guide)
  - [Step 1: Record a Workflow](#step-1-record-a-workflow)
  - [Step 2: Edit & Refine in Web Editor](#step-2-edit--refine-in-web-editor)
  - [Step 3: Publish & Share](#step-3-publish--share)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 💡 What is MargFlow?

Writing workflow documentation, SOPs, and user onboarding manuals manually is slow and painful. Creators usually have to:
1. Take dozens of manual screenshots.
2. Crop and highlight images with arrows/boxes.
3. Type out descriptions for every single action manually.

**MargFlow automates this entire process.**

When you start recording with the MargFlow Chrome Extension and perform actions in your browser, MargFlow automatically:
- Captures browser events (`click`, `input`, `navigation`).
- Captures exact viewport screenshots for each step.
- Extracts DOM selectors, click coordinates, target text, and form input previews.
- Masks sensitive data like passwords automatically (`******`).
- Generates human-readable titles (e.g. `Click on "Submit Order"`, `Type "john@example.com"`).
- Uploads images securely to object storage (MinIO/S3).
- Presents an interactive visual editor to customize, reorder, and publish guides with shareable URLs.

---

## 🎯 Why MargFlow? (Key Value & Use Cases)

- 🏢 **Team Standard Operating Procedures (SOPs)**: Standardize business processes by recording team workflows once and making them accessible to everyone.
- 🎓 **Employee Onboarding & Training**: Accelerate new hire onboarding with clear step-by-step visual guides for internal tools and dashboards.
- 🎧 **Customer Support & Help Centers**: Build public step-by-step guides for customer troubleshooting, account setup, or product walkthroughs.
- 🐞 **Bug Reporting & QA Testing**: Capture precise step-by-step reproduction steps with screenshots to send directly to developers.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🎥 **Automated Capture** | Chrome extension records clicks, text inputs, and navigation transitions seamlessly in real-time. |
| 📸 **Instant Viewport Screenshots** | Automatically takes screenshot on every action and uploads via presigned S3 URLs to MinIO. |
| 🔒 **Privacy & Data Security** | Automatic password field masking (`******`) and text truncation to protect sensitive credentials. |
| ✏️ **Interactive Visual Editor** | Edit step titles, descriptions, move steps up/down, delete accidental clicks with instant optimistic UI updates. |
| 🎯 **Target Click Markers** | Visual indicators showing exact click coordinates overlayed on recorded screenshots. |
| 🌐 **Public Guide Publishing** | One-click publishing generates clean public URLs (`/public/g/:slug`) accessible without login. |
| 🔑 **JWT Authentication** | Secure user registration, sign-in, and multi-tenant guide privacy protection. |
| 🐳 **Docker-Ready Infrastructure** | Containerized setup for PostgreSQL database and MinIO S3 storage. |

---

## 🏗️ System Architecture

MargFlow is structured as a **Monorepo** managed with `pnpm` workspaces:

```
                         +-----------------------------------+
                         |      MargFlow System Overview     |
                         +-----------------------------------+
                                           |
    +-------------------------+            |            +-------------------------+
    |    Chrome Extension     |            |            |     React Web App       |
    |      (Manifest v3)      |<-----------+----------->|       (Vite App)        |
    |  - Content Recorder     |                         |  - Guide Dashboard      |
    |  - Background Worker    |                         |  - Visual Step Editor   |
    |  - Popup Control UI     |                         |  - Public Guide Viewer  |
    +------------+------------+                         +------------+------------+
                 |                                                   |
                 | HTTP / REST API (JWT Auth)                        | REST API
                 +-------------------------+-------------------------+
                                           |
                                           v
                        +------------------------------------+
                        |       NestJS API Backend Server    |
                        |  - Auth, Users, Guides, Steps      |
                        |  - Uploads Service (Presigned URLs)|
                        |  - Prisma ORM Data Layer           |
                        +------------------+-----------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
        +-----------------------+                     +-----------------------+
        |   PostgreSQL Database |                     |  MinIO Object Storage |
        |  (Users, Guides, Steps|                     | (Screenshots Buckets) |
        +-----------------------+                     +-----------------------+
```

### Component Breakdown

| Package | Technology | Responsibilities |
|---|---|---|
| **`extension/`** | React, TypeScript, Vite, Chrome APIs | Captures DOM click/input/navigation events, captures tab screenshots, uploads images to MinIO via presigned URLs, calls backend steps API. |
| **`web/`** | React 18, TypeScript, Vite, TailwindCSS, React Query | User dashboard for managing guides, visual editor for reviewing/reordering steps, public guide viewer page. |
| **`backend/`** | NestJS, TypeScript, Prisma ORM, MinIO SDK | REST API providing JWT authentication, CRUD endpoints for guides/steps, S3 presigned URL generation, public slug access. |
| **`infra/`** | Docker, Docker Compose | Provisioning PostgreSQL 16 database and MinIO S3 object storage server. |

---

## 🔄 Data Flow & How It Works

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Ext as Chrome Extension
    participant Web as Web App Editor
    participant API as NestJS Backend
    participant MinIO as MinIO Storage
    participant DB as PostgreSQL DB

    User->>Ext: 1. Click "Start Recording"
    User->>Ext: 2. Performs action (Click / Type / Navigate)
    Ext->>Ext: 3. Capture DOM event & capture visible tab screenshot
    Ext->>API: 4. POST /uploads/screenshot-presigned (JWT)
    API-->>Ext: 5. Return Presigned Upload URL + S3 Key
    Ext->>MinIO: 6. PUT Screenshot binary blob to MinIO
    Ext->>API: 7. POST /guides/:guideId/steps (Action details + S3 Key)
    API->>DB: 8. Save step record
    User->>Ext: 9. Click "Stop Recording"
    User->>Web: 10. Open Guide Editor (/guides/:id)
    Web->>API: 11. GET /guides/:id
    API->>DB: 12. Fetch guide & steps
    API->>MinIO: 13. Generate presigned download URLs for screenshots
    API-->>Web: 14. Return guide data with image URLs
    Web-->>User: 15. Render visual guide with target markers & editing tools
```

---

## 🛠️ Tech Stack

- **Monorepo Tools**: `pnpm` Workspaces
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, `@aws-sdk/s3-request-presigner`, `@aws-sdk/client-s3`
- **Frontend Web**: React 18, TypeScript, Vite, TailwindCSS, `@tanstack/react-query`, `lucide-react`, `react-router-dom`
- **Chrome Extension**: Chrome Extension Manifest v3, React, TypeScript, Vite
- **Storage & Infrastructure**: Docker Compose, PostgreSQL 16 Alpine, MinIO Object Storage

---

## 🗄️ Database Schema

MargFlow uses **Prisma ORM** with PostgreSQL. The core data models are:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  guides       Guide[]
}

model Guide {
  id          String      @id @default(cuid())
  ownerId     String
  owner       User        @relation(fields: [ownerId], references: [id])
  title       String
  description String?
  status      GuideStatus @default(DRAFT) // DRAFT | PUBLISHED
  publicSlug  String?     @unique
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  steps       Step[]
}

model Step {
  id            String   @id @default(cuid())
  guideId       String
  guide         Guide    @relation(fields: [guideId], references: [id], onDelete: Cascade)
  index         Int      // Step ordering sequence
  actionType    String   // click | input | navigation
  selector      String?  // Generated CSS selector
  url           String   // Page URL where step occurred
  textContent   String?  // Element text content
  inputPreview  String?  // Sanitized input preview
  screenshotKey String?  // S3 object key in MinIO
  title         String   // Auto-generated or custom title
  description   String?  // Optional step notes
  metadata      Json?    // Click X/Y coordinates & element bounding box
  createdAt     DateTime @default(now())
}
```

---

## 📁 Project Directory Structure

```
MargFlow/
├── backend/                  # NestJS API Application
│   ├── prisma/
│   │   └── schema.prisma     # Prisma DB Schema & Migrations
│   ├── src/
│   │   ├── config/           # Database, Env, & MinIO Config
│   │   ├── modules/
│   │   │   ├── auth/         # Login, Register, JWT Strategy
│   │   │   ├── guides/       # Guide CRUD & Step Reordering
│   │   │   ├── public/       # Public Guide Access via Slugs
│   │   │   ├── steps/        # Step creation & management
│   │   │   ├── uploads/      # MinIO presigned URL generator
│   │   │   └── users/        # User management
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env.example
├── extension/                # Chrome Extension (Manifest v3)
│   ├── public/
│   ├── src/
│   │   ├── background/       # Event listener & tab capture service worker
│   │   ├── content/          # DOM interaction recorder script
│   │   └── popup/            # Extension control popup UI
│   ├── manifest.json
│   └── vite.config.ts
├── web/                      # React Web Dashboard & Editor
│   ├── src/
│   │   ├── components/       # UI Components & Step Cards
│   │   ├── pages/            # Guides List, Editor, Public Viewer, Auth
│   │   ├── services/         # API Service Clients
│   │   └── store/            # Auth state store
│   ├── index.html
│   └── vite.config.ts
├── infra/                    # Infrastructure Setup
│   └── docker-compose.yml    # Postgres (port 5436) & MinIO (9000/9001)
├── package.json              # Root workspace package scripts
├── pnpm-workspace.yaml       # PNPM workspace definition
└── README.md                 # Project Documentation
```

---

## ⚡ Prerequisites

Ensure you have the following installed on your system before running MargFlow:

- **Node.js**: `v20.0.0` or higher
- **pnpm**: `v8.0.0` or higher (`npm install -g pnpm`)
- **Docker & Docker Desktop**: For running PostgreSQL & MinIO
- **Google Chrome**: For running the MargFlow Chrome Extension

---

## 🚀 Getting Started & Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-username/MargFlow.git
cd MargFlow

# Install dependencies across all monorepo workspaces
pnpm install
```

### 2. Start Infrastructure (Docker)

Launch PostgreSQL and MinIO containers using Docker Compose:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

Verify services are running:
- **PostgreSQL**: `localhost:5436` (User: `margflow`, Pass: `margflow`, DB: `margflow`)
- **MinIO API**: `localhost:9000`
- **MinIO Console**: `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`)

### 3. Configure & Initialize Backend

Navigate to the `backend` directory and set up environment variables:

```bash
cd backend
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=4000
DATABASE_URL="postgresql://margflow:margflow@localhost:5436/margflow?schema=public"
JWT_SECRET="super-secret-key-change-in-production"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="margflow-screenshots"
```

Run database migrations to generate database tables:

```bash
npx prisma db push
```

### 4. Start Development Servers

Return to root directory and start all packages simultaneously:

```bash
# From project root directory
pnpm dev
```

Or run individual components separately:

```bash
# Run Backend API only (http://localhost:4000)
pnpm dev:backend

# Run Web Application only (http://localhost:5173)
pnpm dev:web
```

### 5. Install the Chrome Extension

1. Build the extension package:
   ```bash
   cd extension
   pnpm build
   ```
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked**.
5. Select the `MargFlow/extension/dist` folder.
6. The MargFlow icon will appear in your Chrome toolbar!

---

## 📖 Usage Workflow Guide

### Step 1: Record a Workflow

1. Open the MargFlow Web App (`http://localhost:5173`) and sign up for an account.
2. Click the **MargFlow Chrome Extension** icon in your browser toolbar.
3. Log in with your MargFlow credentials in the extension popup.
4. Select **Create New Guide** and give your guide a name (e.g., `How to Reset User Password`).
5. Click **Start Recording**.
6. Perform the steps on any website in your browser. MargFlow automatically captures screenshots and highlights element interactions.
7. Once finished, click **Stop Recording** in the extension popup.

### Step 2: Edit & Refine in Web Editor

1. Open your MargFlow Dashboard (`http://localhost:5173/guides`).
2. Click on your newly recorded guide to open the **Visual Guide Editor**.
3. Review the captured steps:
   - Edit titles (e.g. change auto-generated `Click on "Submit"` to `Click the Submit Order button`).
   - Add extra text descriptions or instructions to steps.
   - Click **Up/Down** arrows to reorder steps.
   - Click **Delete** to remove unnecessary steps or accidental clicks.
   - Inspect screenshot click highlights (red target indicators).

### Step 3: Publish & Share

1. Click **Publish Guide** in the editor header.
2. MargFlow generates a unique public slug.
3. Copy the public link (`http://localhost:5173/public/g/<slug>`).
4. Share the URL with colleagues, clients, or embed it in documentation. Anyone can view the guide without creating an account!

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User authentication & JWT token generation
- `GET /api/auth/me` - Get current authenticated user profile

### Guides (`/api/guides`)
- `GET /api/guides` - Get all guides owned by current user
- `POST /api/guides` - Create a new guide record
- `GET /api/guides/:id` - Fetch single guide with ordered steps
- `PATCH /api/guides/:id` - Update guide title, description, or status (`DRAFT` / `PUBLISHED`)
- `DELETE /api/guides/:id` - Delete guide and associated steps/screenshots
- `PUT /api/guides/:id/steps/reorder` - Reorder step positions in a guide

### Steps (`/api/steps` & `/api/guides/:guideId/steps`)
- `POST /api/guides/:guideId/steps` - Add a recorded step to a guide
- `PATCH /api/steps/:id` - Update step title or description
- `DELETE /api/steps/:id` - Delete a step

### Uploads (`/api/uploads`)
- `POST /api/uploads/screenshot-presigned` - Obtain S3 presigned PUT URL for uploading screenshots to MinIO
- `DELETE /api/uploads/screenshot/:key` - Delete screenshot object from MinIO

### Public Access (`/api/public`)
- `GET /api/public/g/:slug` - Fetch published guide & steps via public slug (No Auth Required)

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. Extension is failing to upload screenshots ("Failed to get presigned URL")</b></summary>

- Ensure MinIO is running (`docker ps` should show `margflow-minio`).
- Check that the backend is running on `http://localhost:4000`.
- Open the extension popup, go to settings, and confirm the API Base URL is set to `http://localhost:4000/api`.
</details>

<details>
<summary><b>2. PostgreSQL database connection error on startup</b></summary>

- Port `5436` is used by default in `docker-compose.yml` to avoid conflicting with existing local PostgreSQL instances on port `5432`.
- Verify `.env` has: `DATABASE_URL="postgresql://margflow:margflow@localhost:5436/margflow?schema=public"`
</details>

<details>
<summary><b>3. Screenshots are not displaying in the Web App</b></summary>

- Check MinIO console (`http://localhost:9001`) to verify the bucket `margflow-screenshots` exists.
- Ensure backend MinIO credentials match `.env`.
</details>

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
