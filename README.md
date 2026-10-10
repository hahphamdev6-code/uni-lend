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

The backend requires `JWT_ISSUER_URI` and `JWT_AUDIENCE` before it can start.
Set them to the trusted identity provider's issuer URL and the audience intended
for this API. The backend discovers the provider's JWKS endpoint from its issuer
metadata; if discovery is unavailable, set `JWT_JWK_SET_URI` to the trusted
JWKS URL as well. Tokens must have a valid signature, issuer, audience, and
expiration, and their `sub` claim must equal the user's email in the Uni-Lend
database. Never commit signing keys or secrets to source control.

Unauthenticated access is limited to `GET /categories`, `GET /categories/{id}`,
`GET /items`, and `GET /items/{id}`. Other endpoints require a valid bearer
token. Item ownership and admin role checks continue to use the user record in
the database.
