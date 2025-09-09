# Suppliers Dashboard App

A comprehensive dashboard application for managing suppliers, built with React frontend and Node.js backend, fully containerized with Docker.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + TypeScript + Prisma + PostgreSQL
- **Database**: PostgreSQL with Redis for caching
- **Containerization**: Docker & Docker Compose

## Running with Docker

### Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of available RAM
- Ports 3000, 4000, 5432, 6379, and 8080 should be available

### Environment Setup

Before running the application, make sure you have the required environment files:

1. `backend/.docker.env` - Backend environment variables
2. `frontend/.docker.env` - Frontend environment variables (including `VITE_API_URL`)
3. `backend/src/config/db/.docker.env` - Database environment variables

### Full Application Deployment

To run the complete application stack (frontend, backend, database, and all services):

```bash
# Clone the repository
git clone <repository-url>
cd suppliers-dashboard-app

# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f

# Stop all services
docker-compose down
```

This command will start:

- **PostgreSQL Database** (port 5432)
- **Redis Cache** (port 6379)
- **PgAdmin4** (port 8080) - Database management interface
- **Backend API** (port 4000)
- **Frontend App** (port 3000)

### Development Database Only

If you only need to run the databases for local development:

```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

This will start only PostgreSQL, Redis, and PgAdmin4 without the application services.

### Accessing the Application

After running `docker-compose up -d` from the root directory:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PgAdmin4 (Database UI)**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Useful Docker Commands

```bash
# View running containers
docker ps

# View application logs
docker-compose logs -f frontend_app backend_app

# Restart a specific service
docker-compose restart frontend_app

# Rebuild and start services
docker-compose up -d --build

# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Access container shell
docker exec -it suppliers_frontend sh
docker exec -it suppliers_backend sh
```

### Troubleshooting

1. **Port conflicts**: Make sure ports 3000, 4000, 5432, 6379, and 8080 are not in use
2. **Environment variables**: Ensure all `.docker.env` files are properly configured
3. **Build issues**: Try `docker-compose down && docker-compose up -d --build`
4. **Database connection**: Wait a few seconds for the database to fully initialize
5. **API URL issues**: Verify that `VITE_API_URL` in `frontend/.docker.env` points to the correct backend URL

### Development Notes

- The frontend uses Vite with hot reload in development mode
- Backend includes nodemon for automatic restarts
- Database changes require running Prisma migrations
- All services are connected through a custom Docker network `suppliers_dashboard_app`
