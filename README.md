# Tickify — Production-Grade Kubernetes Deployment

A cloud-native, high-availability Kubernetes deployment for **Tickify**—a full-stack event ticketing platform featuring real-time seat reservations, Redis-backed distributed locking, BullMQ background job processing, and Server-Sent Events (SSE) live updates.

This repository demonstrates migrating a multi-container full-stack application from Docker Compose to a production-hardened Kubernetes architecture using **StatefulSets**, **Persistent Volume Claims (PVCs)**, **NGINX Ingress**, **Liveness/Readiness Probes**, **Resource Quotas**, and **Horizontal Pod Autoscaling (HPA)**.

---

### Table of Contents

- [Key Kubernetes & DevOps Features](#key-kubernetes--devops-features)
- [Tech Stack](#tech-stack)
- [Repository & Manifest Structure](#repository--manifest-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Deployment Guide](#step-by-step-deployment-guide)
- [Verification & Health Checks](#verification--health-checks)
- [Cleanup & Cluster Management](#cleanup--cluster-management)
- [Acknowledgements & Credits](#acknowledgements--credits)

---

### Key Kubernetes & DevOps Features

- **Namespace Isolation:** All application resources are isolated inside a dedicated `tickify` namespace.
- **High Availability & Load Balancing:** Stateless React frontend and Node.js backend workloads run across multiple replicas (`replicas: 2`) behind `ClusterIP` Services.
- **Horizontal Pod Autoscaling (HPA):** Automatically scales backend pods between **2 and 5 replicas** when average CPU utilization exceeds **70%** via `metrics-server`.
- **Stateful Data Persistence:** MongoDB 7.0 and Redis 7 (with AOF persistence enabled) run as **StatefulSets** backed by **Headless Services** (`clusterIP: None`) and dedicated **Persistent Volume Claims (PVCs)** so data survives pod restarts.
- **Unified Ingress Routing & SSE Support:** NGINX Ingress Controller routes `/api/v1` traffic to the backend and `/` traffic to the frontend under a single domain (`tickify.local`), eliminating CORS issues. Configured with `proxy-buffering: "off"` and `3600s` timeouts to support long-lived Server-Sent Events (SSE) connections.
- **Self-Healing & Zero-Downtime Rollouts:** Deep health checks (`/api/v1/health` verifying both MongoDB and Redis connectivity) power Kubernetes `readinessProbe` and `livenessProbe` configurations alongside CPU/memory `requests` and `limits`.
- **Security Best Practices:** Non-sensitive configurations are decoupled into `ConfigMaps`, sensitive credentials and RSA-2048 keypairs are managed via Kubernetes `Secrets` (excluded from Git via `.gitignore` with a sanitized `02-secret.example.yaml` template), and containers run with least-privilege configurations.

---

### Tech Stack

| Layer | Technology | Kubernetes Workload |
| :--- | :--- | :--- |
| **Orchestration** | Kubernetes (Minikube), `kubectl` | Namespace `tickify` |
| **Ingress / Proxy** | NGINX Ingress Controller | `Ingress` (`tickify.local`) |
| **Frontend** | React, TypeScript, Vite, Nginx | `Deployment` (2 Replicas) + `ClusterIP` |
| **Backend API** | Node.js, Express, TypeScript, BullMQ | `Deployment` (2–5 Replicas via `HPA`) + `ClusterIP` |
| **Primary Database** | MongoDB 7.0 | `StatefulSet` + Headless `Service` + `1Gi` PVC |
| **Cache & Queue** | Redis 7 Alpine (`--appendonly yes`) | `StatefulSet` + Headless `Service` + `512Mi` PVC |

---

### Repository & Manifest Structure


tickify-k8s/
├── backend/                     # Node.js + Express + TypeScript backend API
├── frontend/                    # React + Vite frontend with custom Nginx SPA routing
├── k8s/                         # Kubernetes declarative manifests
│   ├── 00-namespace.yaml        # Isolated 'tickify' namespace
│   ├── 01-configmap.yaml        # Non-sensitive environment variables
│   ├── 02-secret.example.yaml   # Sanitized template for Secrets & RSA keys
│   ├── 03-mongodb.yaml          # MongoDB StatefulSet, Headless Service & 1Gi PVC
│   ├── 04-redis.yaml            # Redis StatefulSet, Headless Service & 512Mi PVC
│   ├── 05-backend.yaml          # Backend Deployment, Probes, Resource Limits & Service
│   ├── 06-frontend.yaml         # Frontend Deployment, Probes & Service
│   ├── 07-ingress.yaml          # NGINX Ingress rules with SSE buffering disabled
│   └── 08-hpa.yaml              # Horizontal Pod Autoscaler (CPU target: 70%)
├── docker-compose.yml           # Local multi-container reference setup
└── README.md

---

### Prerequisites
Ensure the following tools are installed on your local machine:

Docker Desktop

Minikube

kubectl

Node.js (for generating RSA-2048 keypairs)

### Step-by-Step Deployment Guide
1. Start Minikube & Enable Required Addons
Start a local Kubernetes cluster and enable the NGINX Ingress Controller and Metrics Server (required for HPA):

Bash
minikube start --driver=docker --cpus=4 --memory=4096
minikube addons enable ingress
minikube addons enable metrics-server
2. Clone the Repository
Bash
git clone [https://github.com/poornabhagya/tickify-k8s.git](https://github.com/poornabhagya/tickify-k8s.git)
cd tickify-k8s
3. Configure Kubernetes Secrets & RSA Keys
Create your local k8s/02-secret.yaml file from the provided template (this file is git-ignored so credentials are never committed):

Bash
cp k8s/02-secret.example.yaml k8s/02-secret.yaml
Generate a fresh RSA-2048 keypair for ticket JWT signing:

Bash
node -e "const { generateKeyPairSync } = require('crypto'); const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } }); console.log('RSA_PRIVATE_KEY:\n' + JSON.stringify(privateKey)); console.log('RSA_PUBLIC_KEY:\n' + JSON.stringify(publicKey));"
Update k8s/02-secret.yaml with your strong passwords, hex encryption key, and the generated RSA_PRIVATE_KEY and RSA_PUBLIC_KEY strings.

4. Apply Kubernetes Manifests
Deploy the manifests in sequential order:

Bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secret.yaml
kubectl apply -f k8s/03-mongodb.yaml
kubectl apply -f k8s/04-redis.yaml
kubectl apply -f k8s/05-backend.yaml
kubectl apply -f k8s/06-frontend.yaml
kubectl apply -f k8s/07-ingress.yaml
kubectl apply -f k8s/08-hpa.yaml
5. Configure Local DNS & Expose Ingress
Map tickify.local to 127.0.0.1 in your system hosts file:

Windows (Run PowerShell as Administrator):

PowerShell
Add-Content -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Value "`n127.0.0.1 tickify.local"
Linux / macOS:

Bash
echo "127.0.0.1 tickify.local" | sudo tee -a /etc/hosts
Start the Minikube tunnel in a separate terminal window (keep it running while accessing the app):

Bash
minikube tunnel
Open the application in your browser:

Frontend UI: http://tickify.local

Backend Health Endpoint: http://tickify.local/api/v1/health

Verification & Health Checks
Run the following commands to verify cluster health, persistence, and autoscaling:

Bash
# Check all Pods, Services, and Persistent Volume Claims
kubectl get pods,svc,pvc -n tickify

# Verify Ingress routing configuration
kubectl get ingress -n tickify

# Monitor real-time CPU & Memory consumption
kubectl top pods -n tickify

# Verify Horizontal Pod Autoscaler status
kubectl get hpa -n tickify

# Tail logs across all load-balanced backend replicas
kubectl logs -l app=tickify-backend -n tickify --tail=20
Cleanup & Cluster Management
Bash
# Pause the cluster while preserving Persistent Volume data
minikube stop

# Or delete all Tickify Kubernetes resources completely
kubectl delete namespace tickify
Acknowledgements & Credits
Special thanks to the original author for creating the full-stack Tickify application codebase:

Original Author: psang39

Original Repository: psang39/tickify

Author
Poorna Bhagya Ekanayake

GitHub: @poornabhagya
