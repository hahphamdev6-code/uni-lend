# Production Docker Compose

This deployment sample depends on observability commit `070e81e` on
`feature/be-observability`. It uses the `prod` Spring profile, public generic
health probes, and the readiness probe that checks the database. Start this
branch from that commit or a descendant containing it.

## Configure environment

From the `backend` directory, copy the placeholder file:

```powershell
Copy-Item .env.production.example .env.production
```

Set `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `JWT_SECRET` to unique deployment
secrets using your secret manager. Generate the JWT key with
`openssl rand -base64 32` or an equivalent cryptographically secure generator.
Do not commit `.env.production`, paste secrets into tickets, or include it in
the Docker build context. Set the actual public frontend origin in
`CORS_ALLOWED_ORIGINS` and `FRONTEND_URL`; leave SMTP disabled unless it is
configured.

The Compose file requires the four database/JWT values and frontend URLs. The
example contains only placeholders. MySQL is reachable only on the private
Compose network; no host port is published. The API is bound to `127.0.0.1`
only, so put a TLS reverse proxy in front of it if remote users need access.
Actuator metrics remain restricted to an authenticated `ADMIN` and are not
published on a separate management port. Health responses expose only status.

## Build and start

Use a distinct Compose project name for this deployment:

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml up --build -d
```

The backend build uses Maven 3.9.16 and Java 25, matching the Maven Wrapper and
Java version declared by the project. The runtime uses Java 25 and runs as
UID/GID `10001:10001`, with a read-only root filesystem. `/app/uploads` is a
dedicated persistent writable volume; `/tmp` is an ephemeral tmpfs. MySQL
data uses a separate persistent volume. The database has no `ports` mapping.

## Check services

Compose waits for MySQL's healthcheck before starting the API. The API
healthcheck polls `/actuator/health/readiness`; it reports healthy only when
the application and database are ready.

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml ps
curl.exe http://127.0.0.1:8080/actuator/health
curl.exe http://127.0.0.1:8080/actuator/health/readiness
curl.exe http://127.0.0.1:8080/actuator/health/liveness
```

Health and readiness return only a generic status, not component or database
details. Readiness includes the database; liveness does not. During an isolated
readiness exercise, stop only the database service in this Compose project:

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml stop db
curl.exe http://127.0.0.1:8080/actuator/health/readiness
curl.exe http://127.0.0.1:8080/actuator/health/liveness
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml start db
```

Readiness should become non-ready while liveness remains `UP`; after MySQL is
healthy again, readiness should recover. Perform this only in a disposable
test deployment, never against a production database.

Check the runtime user and upload mount:

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml exec api id
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml exec api sh -c 'test "$(id -u)" -ne 0 && test -w /app/uploads'
```

The first command should show UID `10001`; the second exits successfully when
the non-root process can write to the uploads volume.

## Logs and stop

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml logs --tail 100 api
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml logs --tail 100 db
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml stop
```

The persistent MySQL and uploads volumes remain when services are stopped.
This guide intentionally does not document backup or restore procedures.

## Validate configuration without printing interpolated values

Once Docker Compose is installed and `.env.production` has been filled from a
secure source, validate the model quietly:

```powershell
docker compose -p unilend-production --env-file .env.production `
  -f docker-compose.production.yml config --quiet
```

`config --quiet` validates without printing the resolved configuration, which
can contain secrets. Do not run plain `docker compose config` in a shared
terminal or capture its output in logs.
