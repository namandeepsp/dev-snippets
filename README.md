# DevSnippets

A Next.js application for storing, organizing, and sharing reusable code snippets across technologies.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

This project follows a **layered architecture** with clear separation of concerns:

```
UI Layer → API Layer → Service Layer → Repository Layer → Database
```

### Layer Responsibilities

- **UI Layer**: React components, forms, pages
- **API Layer**: Abstracts communication (Server Actions or REST API)
- **Service Layer**: Business logic, authorization, validation
- **Repository Layer**: Data access, database operations
- **Database**: Firebase Firestore (can be swapped)

### Feature Architecture Compliance

File link: https://docs.google.com/spreadsheets/d/1OoTF-jKSdVK54SZa4OY0C3Ja_zyhiPPBni67p4whHfI/edit?usp=drive_link


## Migration Path: Serverless → Traditional Server

The application is designed for easy migration from serverless to traditional server architecture.

### Current: Serverless Architecture

**Stack**: Next.js + Server Actions + Firebase

```
UI → snippetApiClient → ServerActionSnippetClient → Server Action → Service → Repository → Firestore
```

### Future: Traditional Server Architecture

**Stack**: Next.js (Frontend) + Express/Fastify (Backend) + PostgreSQL/MongoDB

```
UI → snippetApiClient → RestSnippetClient → HTTP API → Controller → Service → Repository → Database
```

---

## Migration Steps by Layer

### 1. API Layer Migration

**Current**: Server Actions  
**Target**: REST API

**Steps**:

```bash
# 1. Set environment variable
echo "NEXT_PUBLIC_API_MODE=rest" >> .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" >> .env.local
```

**Files to modify**: None (already abstracted via `snippet-api.factory.ts`)

**Effort**: ⭐ 5 minutes

---

### 2. Controller Layer Creation

**Current**: N/A (Server Actions handle this)  
**Target**: Express/Fastify Controllers

**Steps**:

```typescript
// server/src/features/snippets/snippet.controller.ts
import { Request, Response } from 'express';
import { snippetService } from './snippet.container';

export class SnippetController {
  async create(req: Request, res: Response) {
    try {
      const snippet = await snippetService.create(
        req.body,
        req.user.id,
        req.user.name
      );
      res.json(snippet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    const snippet = await snippetService.getById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Not found' });
    res.json(snippet);
  }

  async listPublic(req: Request, res: Response) {
    const snippets = await snippetService.listPublic();
    res.json(snippets);
  }

  async update(req: Request, res: Response) {
    await snippetService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true });
  }

  async delete(req: Request, res: Response) {
    await snippetService.delete(req.params.id, req.user.id);
    res.json({ success: true });
  }
}

export const snippetController = new SnippetController();
```

**Effort**: ⭐⭐ 2-3 hours

---

### 3. Service Layer Migration

**Current**: Works with Server Actions  
**Target**: Works with Controllers

**Steps**: None required! Service layer is already abstracted.

**Files**: `src/features/snippets/snippet.service.ts` (no changes needed)

**Effort**: ⭐ 0 minutes (already done)

---

### 4. Repository Layer Migration

**Current**: `FirebaseSnippetRepository`  
**Target**: `PostgresSnippetRepository` / `MongoSnippetRepository`

**Steps**:

#### Option A: PostgreSQL with Prisma

```bash
# Install dependencies
pnpm add prisma @prisma/client
pnpm add -D prisma

# Initialize Prisma
pnpx prisma init
```

```prisma
// prisma/schema.prisma
model Snippet {
  id          String   @id @default(uuid())
  title       String
  description String?
  code        String
  language    String
  technologies String[]
  categories  String[]
  visibility  String
  ownerId     String
  ownerName   String
  likesCount  Int      @default(0)
  viewsCount  Int      @default(0)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```typescript
// src/features/snippets/postgres-snippet.repository.ts
import { PrismaClient } from '@prisma/client';
import type { SnippetRepository, CreateSnippetInput, UpdateSnippetInput } from './snippet.repository';
import type { Snippet } from './snippet.types';

const prisma = new PrismaClient();

export class PostgresSnippetRepository implements SnippetRepository {
  async create(input: CreateSnippetInput): Promise<Snippet> {
    return prisma.snippet.create({ data: input });
  }

  async getById(id: string): Promise<Snippet | null> {
    return prisma.snippet.findUnique({ where: { id } });
  }

  async listPublic(): Promise<Snippet[]> {
    return prisma.snippet.findMany({
      where: { visibility: 'public', isDeleted: false },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async update(id: string, input: UpdateSnippetInput): Promise<void> {
    await prisma.snippet.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<void> {
    await prisma.snippet.update({ where: { id }, data: { isDeleted: true } });
  }

  async listByUser(userId: string): Promise<Snippet[]> {
    return prisma.snippet.findMany({
      where: { ownerId: userId, isDeleted: false },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async listByVisibility(visibility: string, userId?: string): Promise<Snippet[]> {
    return prisma.snippet.findMany({
      where: { visibility, isDeleted: false },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
```

```typescript
// src/features/snippets/snippet.container.ts
import { PostgresSnippetRepository } from './postgres-snippet.repository';
import SnippetService from './snippet.service';

const repo = new PostgresSnippetRepository(); // Changed from Firebase
const service = new SnippetService(repo);

export const snippetService = service;
```

**Effort**: ⭐⭐⭐ 1 day

---

### 5. Authentication Layer Migration

**Current**: Firebase Auth + Session Cookies  
**Target**: JWT + Passport.js

**Steps**:

```bash
# Install dependencies
pnpm add jsonwebtoken passport passport-jwt bcrypt
pnpm add -D @types/jsonwebtoken @types/passport @types/passport-jwt @types/bcrypt
```

```typescript
// server/src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

```typescript
// server/src/routes/snippet.routes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { snippetController } from '../features/snippets/snippet.controller';

const router = express.Router();

router.post('/snippets', authMiddleware, snippetController.create);
router.get('/snippets/:id', snippetController.getById);
router.get('/snippets', snippetController.listPublic);
router.patch('/snippets/:id', authMiddleware, snippetController.update);
router.delete('/snippets/:id', authMiddleware, snippetController.delete);

export default router;
```

**Effort**: ⭐⭐⭐⭐ 3-5 days

---

### 6. Server Setup

**Create Express Server**:

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import snippetRoutes from './routes/snippet.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', snippetRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

```json
// server/package.json
{
  "name": "dev-snippets-server",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}
```

**Effort**: ⭐⭐ 4-6 hours

---

### 7. Deployment Migration

**Current**: Vercel (Serverless)  
**Target**: Docker + VPS/AWS/GCP

**Steps**:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/devsnippets
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=devsnippets
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Effort**: ⭐⭐⭐ 2-3 days

---

## Migration Timeline

| Layer | Effort | Time |
|-------|--------|------|
| API Layer | ⭐ | 5 min |
| Controller Layer | ⭐⭐ | 2-3 hours |
| Service Layer | ⭐ | 0 min |
| Repository Layer | ⭐⭐⭐ | 1 day |
| Authentication | ⭐⭐⭐⭐ | 3-5 days |
| Server Setup | ⭐⭐ | 4-6 hours |
| Deployment | ⭐⭐⭐ | 2-3 days |
| **Total** | | **1-2 weeks** |

---

## Tech Stack

### Current (Serverless)
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js Server Actions
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Deployment**: Vercel

### Future (Traditional Server)
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Express/Fastify + Node.js
- **Database**: PostgreSQL/MongoDB
- **Auth**: JWT + Passport.js
- **Deployment**: Docker + AWS/GCP/VPS

---

## Documentation

- [API Migration Guide](./docs/API_MIGRATION.md)
- [Architecture Principles](./docs/ARCHITECTURE.md) (TODO)

---

*****************Note: This project uses pnpm as the package manager.*****************
