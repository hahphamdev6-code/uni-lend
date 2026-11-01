# Backend observability and production profile

## Production configuration

The `prod` Spring profile disables Hibernate SQL output and SQL formatting,
turns off Open EntityManager in View, avoids returning exception details, and
requires database connection values from the environment. Keep database
credentials and `JWT_SECRET` in the deployment secret store or environment;
do not put real values in this document or commit them.

Set these variables before starting the backend:

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://<database-host>:3306/uni_lend
DB_USERNAME=<database-user>
DB_PASSWORD=<database-password>
JWT_SECRET=<base64-encoded-key-of-at-least-32-random-bytes>
```

For example, in PowerShell, supply values through your secure environment
manager and then run:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The base configuration retains the existing Flyway migration settings and
Hibernate `ddl-auto: validate`; this observability change adds no migration.
Production startup expects the database to be reachable and schema migrations
to validate successfully.

## Health and readiness

Only these health routes are exposed and public:

* `GET /actuator/health` — generic `UP` or `DOWN` status.
* `GET /actuator/health/liveness` — process liveness; it does not depend on DB.
* `GET /actuator/health/readiness` — readiness, including the database health
  contributor.

Health details and component names are hidden. A readiness failure returns a
non-2xx health status without exposing database host, schema, or exception
details. Liveness can remain `UP` while the database is unavailable.

## Metrics access

Actuator web exposure is limited to `health` and `metrics`. The metrics index
and metric values under `/actuator/metrics/**` require an authenticated user
with the `ADMIN` role. Other Actuator routes are denied. Spring Boot publishes
the standard JVM, process, system, datasource pool, and HTTP server metrics
where applicable; common metrics carry the `application=unilend-backend` tag.

Use an administrator bearer token from a secure source when querying metrics:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/metrics `
  -Headers @{ Authorization = "Bearer <admin-token>" }
```

Do not put a real token in shell history, screenshots, logs, or shared files.

## Request tracing

Every HTTP response includes `X-Request-Id`. A supplied value is reused only
when it contains 1–64 ASCII letters, digits, dots, underscores, or hyphens;
missing or invalid values are replaced with a generated UUID. The value is
placed in MDC as `requestId` for log correlation and removed after request
processing, including exceptional exits. Completion logs contain only the
HTTP method, status, and duration; they do not include the URL, query string,
headers, or request body. CORS allows this request header and exposes it on the
response.

Example checks (health endpoints do not need credentials):

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:8080/actuator/health/liveness
Invoke-RestMethod http://localhost:8080/actuator/health/readiness
Invoke-WebRequest http://localhost:8080/actuator/health `
  -Headers @{ "X-Request-Id" = "manual-trace-42" }
```

The last response should contain `X-Request-Id: manual-trace-42`. An invalid
value should return a UUID instead.

## Tests

Run the observability tests and the existing backend suite from `backend`:

```powershell
.\mvnw.cmd -Dtest=RequestIdFilterTest,ObservabilityIntegrationTest test
.\mvnw.cmd test
```

These tests use the repository's H2 test database and do not connect to a real
database.
