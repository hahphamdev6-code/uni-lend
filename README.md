# Uni-Lend

Uni-Lend is a web application for managing lending and borrowing activities.

## Project Structure

```text
uni-lend/
├── frontend/    # Next.js application
├── backend/     # Spring Boot application
├── .gitignore
└── README.md
```

## Technologies

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Java
* Spring Boot
* Spring Data JPA
* MySQL

## Running the Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

The backend requires a MySQL connection and a Base64-encoded `JWT_SECRET` of at
least 32 random bytes. On Windows, generate a key in PowerShell with:

```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Create `backend/.env` with your database settings and generated key:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/uni_lend
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=paste_the_generated_base64_key_here
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

The application uses a built-in JWT issuer (`http://unilend.local`); no
external `JWT_ISSUER_URI` or `JWT_AUDIENCE` is needed. `JWT_EXPIRATION_MS` is
optional and defaults to 86400000 milliseconds (24 hours).
`CORS_ALLOWED_ORIGINS` accepts a comma-separated list of frontend origins and
defaults to `http://localhost:3000`. Keep credentials and signing keys in
`backend/.env`, which is ignored by Git; never commit them.

`POST /api/auth/login` accepts an email and password and returns a bearer token.
The account must already exist, be enabled, and have a BCrypt-encoded password
in the database. For registration, email verification, password reset, and the
frontend API inventory, see [`docs/API-FRONTEND.md`](docs/API-FRONTEND.md). Send the returned
token in the `Authorization` header as `Bearer <token>` for authenticated
endpoints.
Unauthenticated access is limited to `POST /api/auth/login`, public item and
category GET endpoints, and `GET /uploads/**` for displaying item images. Other
endpoints require a valid bearer token. Tokens must have a valid HS256
signature, issuer (default `http://unilend.local`), and expiration, and their
`sub` claim must match the user's email in the database. Item ownership and
admin role checks continue to use the user record in the database.


## Docker stack

Run frontend, backend and MySQL together from the repository root using
`compose.yaml`. Follow [the Docker guide](docs/DOCKER.md) to generate private
configuration, build, check service health and preserve database/upload volumes.
The provided frontend snapshot still uses mock authentication; the guide records
this integration limitation. No demo or ADMIN account is automatically seeded.
