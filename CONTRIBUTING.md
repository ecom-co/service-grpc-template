# Contributing Guide

Thanks for contributing to ecom-backend! This guide outlines the workflow and standards.

## Prerequisites

- Node.js >= 18 (Node 24 recommended for Docker images)
- npm >= 9 (or pnpm >= 8 if you prefer locally)
- Docker Desktop

## Getting Started

```bash
npm install
npm run start:dev
```

Docker stack:

```bash
docker-compose up -d
# API: http://localhost:3012, Swagger: /docs
```

## Branching

- feature/short-description
- fix/short-description
- chore/short-description

## Conventional Commits

Examples:

- feat(example): add list endpoint
- fix(docker): bump host ports to avoid conflicts
- chore(ci): update workflow

## Linting & Tests

```bash
npm run lint
npm run check-types
npm test
```

## Pull Requests

- Keep PRs small and focused
- Link related issues (e.g., Closes #123)
- Update docs (`README.md`, `docs/`, `docker/docker-scripts.md`) as needed
- Ensure Docker stack remains healthy (`docker-compose ps`)

## Docker

- Compose file: `docker-compose.yml`
- Env (containers): `.env.docker` (API PORT=3012)
- Docs: `docs/docker.md`, scripts: `docker/docker-scripts.md`

## Code Style

- Follow TypeScript best practices, explicit types on public APIs
- Prefer readable names, early returns, handle errors first
- Avoid unrelated refactors in the same PR
