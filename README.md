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

The backend validates HS256 bearer tokens using the Base64-encoded `JWT_SECRET`
from `backend/.env`; the decoded key must be at least 32 bytes. No external
`JWT_ISSUER_URI` or `JWT_AUDIENCE` is required. Tokens must have a valid
signature, issuer (`JWT_ISSUER`, default `http://unilend.local`), and
expiration, and their `sub` claim must equal the user's email in the Uni-Lend
database. Never commit signing keys or secrets to source control.

Unauthenticated access is limited to `GET /categories`, `GET /categories/{id}`,
`GET /items`, and `GET /items/{id}`. Other endpoints require a valid bearer
token. Item ownership and admin role checks continue to use the user record in
the database.
