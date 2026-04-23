# MargFlow - Scribe-Style Process Documentation Platform

A complete system for recording, creating, and publishing step-by-step workflow guides.

## Architecture

- **Backend**: NestJS + PostgreSQL + MinIO
- **Web**: React + TypeScript + Vite
- **Extension**: Chrome Extension (Manifest v3)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL
- MinIO

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start infrastructure:
```bash
docker-compose -f infra/docker-compose.yml up -d
```

3. Configure backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

4. Start development:
```bash
pnpm dev
```

## Packages

- `backend/` - NestJS API server
- `web/` - React web application
- `extension/` - Chrome browser extension
- `infra/` - Docker configuration