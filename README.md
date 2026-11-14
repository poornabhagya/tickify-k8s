# Tickify - Production-Grade Multi-Container Dockerization

A fully containerized, production-ready setup for **Tickify**—a full-stack event ticketing platform with Redis seat reservations, BullMQ background job processing, and real-time updates.

This repository demonstrates **Advanced Docker Concepts**, including Multi-Stage Docker Builds, Docker Compose Orchestration, Custom Health Checks, Persistent Volume Mounts, and Environment Overrides (`dev` vs `prod`).

---

## Disclaimer & Educational Notice

> **Educational Purpose Only:** This repository was created solely for **educational, learning, and portfolio demonstration purposes** to master modern containerization, DevOps workflows, and system architecture.

### Acknowledgements & Credits

Special thanks to the original author for creating the full-stack Tickify application codebase:

- **Original Author:** [psang39](https://github.com/psang39)
- **Original Repository:** [psang39/tickify](https://github.com/psang39/tickify)

---

## Architecture & Docker Features

- **Multi-Stage Builds:** Optimized images for Node.js TypeScript Backend & Vite/React Frontend.
- **Service Orchestration:** `Express API`, `React Frontend`, `MongoDB`, and `Redis` coordinated via Docker Compose.
- **Health Checks & Resilience:** Container dependency ordering using native health checks (`depends_on`).
- **Environment Separation:**
  - `docker-compose.override.yml`: Local development with Bind Mounts for Live/Hot Reloading.
  - `docker-compose.prod.yml`: Production deployment utilizing pre-built versioned images from Docker Hub.
- **Container Registry Integration:** Published semantic versioned images (`v1.0.0`) on Docker Hub.

---

## Docker Hub Repositories

Pre-built images are publicly available on Docker Hub:

- **Backend Image:** [`bhagyaekanayake/tickify-backend:v1.0.0`](https://hub.docker.com/r/bhagyaekanayake/tickify-backend)
- **Frontend Image:** [`bhagyaekanayake/tickify-frontend:v1.0.0`](https://hub.docker.com/r/bhagyaekanayake/tickify-frontend)

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed.
- `git` installed.

### 1. Clone the Repository

```bash
git clone [https://github.com/poornabhagya/tickify-dockerized.git](https://github.com/poornabhagya/tickify-dockerized.git)
cd tickify-dockerized
2. Run in Local Development Mode (Live Reload Enabled)
To start all services locally with hot-reloading:

Bash
docker compose up -d
Frontend: http://localhost:5173

Backend API: http://localhost:3000

3. Run in Production Mode (Pre-built Docker Hub Images)
To simulate a production deployment using tagged Docker Hub images:

Bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
4. Stop All Services
Bash
docker compose down -v

Author & Maintainer
Docker Architecture & DevOps Implementation: Bhagya Ekanayake (@poornabhagya)
```
