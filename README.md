# Trip Planner - Full Stack Application

Aplikacja do planowania wycieczek z pełnym stackiem technologicznym.

## 🚀 Technologie

### Backend
- **Node.js** + **Express** - Server
- **TypeScript** - Type safety
- **Prisma** - ORM dla PostgreSQL
- **JWT** - Autentykacja
- **bcrypt** - Hash passwords

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Redux-Saga** - Side effects
- **SCSS** - Styling

### Infrastruktura
- **PostgreSQL** - Database
- **Nginx** - Web server / Reverse proxy
- **Docker** - Containerization

---

## 📁 Struktura projektu

```
ZDPAI-Project/
├── server/              # Backend - Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── types/
│   ├── prisma/
│   └── package.json
│
├── client/              # Frontend - React + TypeScript + Redux (wkrótce)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── sagas/
│   │   └── styles/
│   └── package.json
│
├── legacy/              # Stary kod (archiwum)
│   ├── php-backend/     # Stary backend PHP
│   └── vanilla-frontend/ # Stary frontend vanilla JS
│
├── docker/              # Docker configurations
│   ├── nginx/
│   ├── php/
│   └── db/
│
├── database/            # SQL scripts i migracje
│   └── init.sql
│
├── docs/                # Dokumentacja i diagramy
│
└── docker-compose.yaml  # Orchestration
```

---

## 🔧 Instalacja i uruchomienie

### 1. Wymagania
- Node.js >= 18
- Docker & Docker Compose
- npm lub yarn

### 2. Uruchom bazę danych
```bash
docker-compose up -d db
```

### 3. Backend Setup
```bash
cd server
npm install
npm run prisma:generate
npm run dev
```

Backend dostępny na: **http://localhost:3000**

### 4. Frontend Setup (wkrótce)
```bash
cd client
npm install
npm run dev
```

Frontend dostępny na: **http://localhost:5173**

---

## 📚 Dokumentacja

- [Backend README](./server/README.md) - Dokumentacja API
- [Backend Quick Start](./server/QUICKSTART.md) - Szybki start
- [API Requests Examples](./server/api-requests.http) - Przykładowe requesty

---

## 🔐 Domyślne konto admin

```
Email: admin@admin.com
Password: admin
```

---

## 📝 Status migracji

### ✅ Ukończone:
- [x] Backend Node.js + Express + TypeScript
- [x] Prisma ORM integration
- [x] JWT Authentication
- [x] Wszystkie endpointy API
- [x] Middleware (auth, admin)
- [x] Docker PostgreSQL
- [x] Reorganizacja struktury projektu

### 🚧 W trakcie:
- [ ] Frontend React + TypeScript + Redux
- [ ] Docker Nginx configuration
- [ ] Frontend routing (React Router)
- [ ] Redux store setup
- [ ] Redux-Saga integration

### 📋 Do zrobienia:
- [ ] Testy jednostkowe (backend)
- [ ] Testy E2E
- [ ] CI/CD pipeline
- [ ] Production deployment

---

## 🤝 Autor

Tomasz - ZDPAI Project 2025

---

## 📄 Licencja

ISC
