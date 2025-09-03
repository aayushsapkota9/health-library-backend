# Health Library Backend

A hospital management system built with NestJS for patient monitoring, hospital registration, blood monitoring, doctor management, and patient admission processes.

##  Features

- **Patient Monitoring** - Real-time health tracking
- **Hospital Registration** - Hospital onboarding and management
- **Blood Monitoring** - Blood test tracking and results
- **Doctor Management** - Healthcare provider profiles
- **Patient Assignment** - Doctor-patient assignment system
- **Patient Admission** - Admission and discharge processes

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL + TypeORM
- **Search**: Elasticsearch
- **Auth**: JWT + Passport.js
- **Docs**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js >= 18.19.0
- npm >= 10.2.3
- PostgreSQL

##  Quick Start

### Installing Elasticsearch
1. Install Docker on your machine
2. Create a `.env` file in the root directory and add contents from `.env.example`
3. Run Elasticsearch services:
   ```bash
   docker compose up -d
   ```

### Installing PostgreSQL
1. Setup a PostgreSQL database
2. Create a database named "healthlibrarydb"
3. Navigate to `health-library-backend/src/db/dbconfig.ts` and update configuration

### Installation
```bash
npm install
```

### Running the App
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The app runs at `http://localhost:3000` by default.

### Database Setup
**Stop the app and seed the database:**
```bash
npm run seed
```

### API Documentation
Visit `http://localhost:3000/api` for Swagger docs

##  Available Scripts

```bash
npm run start:dev      # Development mode
npm run build          # Build application
npm run test           # Run tests
npm run seed           # Seed database
```

##  Key API Endpoints

- `/auth/login` - Authentication
- `/patients` - Patient management
- `/doctors` - Doctor management
- `/hospitals` - Hospital registration
- `/monitoring` - Patient monitoring & blood tests

##  Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create Pull Request

## 📄 License

UNLICENSED
