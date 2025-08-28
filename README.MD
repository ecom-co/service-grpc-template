## Authorization Service

NestJS-based authorization service for the e-commerce platform. Exposes gRPC APIs and integrates with PostgreSQL, Redis, and RabbitMQ.

### Prerequisites

- Node.js 18+
- Docker (optional, for containerized dev)
- Access to PostgreSQL, Redis, RabbitMQ

### Environment Variables

Required unless a default is shown.

```bash
# Application
NODE_ENV=development
PORT=3012

# gRPC
GRPC_PACKAGE=app
GRPC_PORT=50052          # 50053 is default in code; 50052 used in docker-compose
GRPC_PROTO_PATH=proto/app.proto

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecom

# Messaging / Cache
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REDIS_URL=redis://localhost:6379

# Tracing (optional)
JAEGER_ENDPOINT=

# JWT
JWT_ACCESS_TOKEN_SECRET=replace-with-strong-secret
JWT_ACCESS_TOKEN_EXPIRATION_TIME=3600    # seconds
JWT_REFRESH_TOKEN_SECRET=replace-with-strong-secret
JWT_REFRESH_TOKEN_EXPIRATION_TIME=86400  # seconds
```

Create a local `.env` file or use `.env.docker` when running with Docker Compose.

### Generate EC keys (optional)

If using asymmetric keys instead of shared secrets, you can generate an EC key pair (P-256) for ES256 JWTs:

```bash
chmod +x key_gen.sh
./key_gen.sh
```
This will create `.env.keys` with the generated keys.

### Install and Run (local)

```bash
npm install
npm run start:dev
```

### Run with Docker Compose (dev)

```bash
# Ensure required infra services and external network exist (see your platform stack)
docker compose up --build
```

The service listens on gRPC port `50052` in the compose file and debug port `9229` is mapped to `9230`.

### Useful Scripts

- `npm run start:dev`: start with watch
- `npm run build`: compile TypeScript
- `npm run test`: run unit tests
- `npm run lint`: lint sources

### Notes

- Keep `DATABASE_URL`, `RABBITMQ_URL`, and `REDIS_URL` reachable from where you run the service.
- Defaults in code may differ from compose mappings; prefer your `.env` values.
