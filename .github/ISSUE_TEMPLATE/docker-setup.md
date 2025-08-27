---
name: 'Docker setup'
about: 'Document and track Docker environment setup for ecom-backend'
title: 'chore(docker): document and standardize Docker setup'
labels: ['chore', 'docs', 'docker']
assignees: []
---

## Summary

Describe the Docker environment for ecom-backend and outline tasks to standardize it across dev machines.

## Services

- API (dev): container `ecom-api-dev` on host `http://localhost:3012`
- PostgreSQL: `localhost:5443` (db `ecom_backend`, user/pass `postgres/postgres`)
- Redis: `localhost:6390`
- RabbitMQ: `amqp://localhost:5683` (Mgmt UI `http://localhost:15683`)
- PgAdmin: `http://localhost:8081` (`admin@ecom.com` / `admin123`)
- Elasticsearch: `http://localhost:9201`
- Kibana: `http://localhost:5602`

## Environment

- `.env` for local host
- `.env.docker` for containers (API PORT=3012)
- `docker-compose.yml` roots the stack

## Action Items

- [ ] Verify `docker-compose up -d` boots all services
- [ ] Confirm API and Swagger available on port 3012
- [ ] Validate DB init script enables extensions
- [ ] Confirm message queue, cache, and search services healthy
- [ ] Add docs links to README

## Acceptance Criteria

- Clear instructions exist to start/stop the stack
- Standard dev credentials documented
- Ports do not conflict with default local services

## Links

- Docs: `docs/docker.md`
- Helper scripts: `docker/docker-scripts.md`
