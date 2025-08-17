# Docker Setup (ecom-backend)

This document explains how to run the full local stack via Docker.

## Services

- API (dev): http://localhost:3012
- PostgreSQL: localhost:5443 (db: ecom_backend, user/pass: postgres/postgres)
- Redis: localhost:6390
- RabbitMQ: amqp://localhost:5683 (Mgmt UI: http://localhost:15683)
- PgAdmin: http://localhost:8081 (admin@ecom.com / admin123)
- Elasticsearch: http://localhost:9201
- Kibana: http://localhost:5602

## Start/Stop

```bash
docker-compose up -d
# ...
docker-compose down
```

Recreate API after changes:

```bash
docker-compose build --no-cache api && docker-compose up -d --force-recreate api
```

## Environment

- `.env.docker` is used inside containers (API PORT=3012)
- `.env` is for local host dev

## Database

- Initial extensions are enabled via `docker/postgres/init.sql`
- To reset database:

```bash
docker-compose down -v && docker-compose up -d
```

Connect:

```bash
docker exec -it ecom-postgres psql -U postgres -d ecom_backend
```

## Logs & Health

```bash
# API logs
docker logs -f ecom-api-dev

# Check services
docker-compose ps
```

More handy commands: `docker/docker-scripts.md`.
