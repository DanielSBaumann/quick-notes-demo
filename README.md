# Quick Notes

Simple note-taking app — Lambda + DynamoDB + React + Cloudflare Pages.

**Phase 2 POC:** Scaffolding complete. Ready for local development.

## Quick Start

### Prerequisites

- Node.js 24+
- Docker + Docker Compose
- Make

### Local Development

1. **Start LocalStack (DynamoDB)**
   ```bash
   make docker-up
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Build**
   ```bash
   make build
   ```

4. **Run tests**
   ```bash
   make test
   ```

5. **Run linters**
   ```bash
   make lint
   ```

### Start Development Servers

**Terminal 1: Backend (Express + DynamoDB)**
```bash
cd backend
export DYNAMODB_ENDPOINT=http://localhost:4566
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
npm run dev
```

**Terminal 2: Frontend (React + Vite)**
```bash
cd frontend
npm run dev
```

Access frontend at `http://localhost:5173`

## Project Structure

```
quick-notes/
├── backend/          # Express API (Lambda handler)
│   ├── src/
│   │   ├── types.ts
│   │   ├── dynamodb.ts
│   │   ├── handler.ts
│   │   └── handler.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Makefile
├── frontend/         # React app (Vite)
│   ├── src/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── Makefile
├── infrastructure/   # AWS SAM template
│   └── template.yaml
├── localstack/       # LocalStack initialization
│   └── init-aws.sh
└── Makefile         # Project root orchestrator
```

## Features

✅ Create notes (title, content)  
✅ List all notes (by session ID)  
✅ Delete notes (with confirmation)  
✅ Form validation (required fields, max length)  
✅ Timestamps (auto-generated)  
✅ Browser session ID (localStorage)

## Testing

- **Backend:** Node.js built-in test runner (no external deps)
- **Frontend:** Vitest (when needed, Phase 3)
- **Integration:** LocalStack for local DynamoDB testing

## Tech Stack

- **Backend:** Node.js 24 + Express + AWS SDK v3
- **Database:** DynamoDB (local: LocalStack)
- **Frontend:** React 18 + TypeScript + Vite
- **Testing:** Node.js test runner (backend), Vitest (frontend)
- **Linting:** ESLint + TypeScript

## Next Steps

- Phase 3: Add tests, refactor to Clean Code standards
- Phase 4: Deploy to AWS Lambda + CloudFormation
- Phase 5: Sandbox testing + e2e tests
- Phase 6: Production approval gate
- Phase 7: Delivery report
