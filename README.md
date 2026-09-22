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
