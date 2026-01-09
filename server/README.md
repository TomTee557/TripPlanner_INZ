# Trip Planner - Server (Backend)

Backend Node.js + Express + TypeScript + Prisma dla aplikacji Trip Planner.

## 🚀 Technologie

- **Node.js** - Runtime
- **Express** - Framework webowy
- **TypeScript** - Typowanie statyczne
- **Prisma** - ORM do PostgreSQL
- **JWT** - Autentykacja
- **bcrypt** - Haszowanie haseł

## 📦 Instalacja

```bash
# Zainstaluj zależności
npm install

# Skopiuj i skonfiguruj zmienne środowiskowe
cp .env.example .env
# Edytuj .env z właściwymi danymi

# Wygeneruj Prisma Client
npm run prisma:generate

# (Opcjonalnie) Synchronizuj schemat z bazą danych
npm run prisma:push
```

## 🔧 Komendy

```bash
# Development - z hot reload
npm run dev

# Build produkcyjny
npm run build

# Start produkcyjny
npm start

# Prisma commands
npm run prisma:generate  # Wygeneruj Prisma Client
npm run prisma:studio    # Otwórz GUI do bazy danych
npm run prisma:push      # Push schema do bazy (bez migracji)
npm run prisma:pull      # Pull schema z istniejącej bazy
npm run prisma:migrate   # Utwórz migrację
```

## 🌐 Endpointy API

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Logowanie użytkownika
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/logout` - Wylogowanie (opcjonalne dla JWT)

### Trips (`/api/trips`) - Wymaga autentykacji
- `GET /api/trips` - Pobierz wszystkie wycieczki użytkownika
- `POST /api/trips` - Utwórz nową wycieczkę
- `PUT /api/trips/:id` - Zaktualizuj wycieczkę
- `DELETE /api/trips/:id` - Usuń wycieczkę

### Admin (`/api/admin`) - Wymaga roli ADMIN
- `GET /api/admin/users` - Pobierz wszystkich użytkowników
- `PUT /api/admin/users/:id/role` - Zmień rolę użytkownika
- `PUT /api/admin/users/:id/password` - Zmień hasło użytkownika
- `DELETE /api/admin/users/:id` - Usuń użytkownika

### Other
- `GET /api/health` - Health check endpoint

## 🗄️ Baza danych

Projekt używa bazy PostgreSQL. Schema jest zdefiniowany w `prisma/schema.prisma`.

**Tabele:**
- `users` - Użytkownicy aplikacji
- `trips` - Wycieczki użytkowników

## 🔐 Autentykacja

Aplikacja używa **JWT (JSON Web Tokens)** do autentykacji:
- Access token jest zwracany po udanym logowaniu
- Token musi być przesyłany w nagłówku: `Authorization: Bearer <token>`
- Czas życia tokena: 15 minut (konfigurowalny w `.env`)

## 📁 Struktura projektu

```
server/
├── prisma/
│   └── schema.prisma      # Prisma schema (model bazy danych)
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts    # Routing autentykacji
│   │   ├── trips.routes.ts   # Routing wycieczek
│   │   ├── admin.routes.ts   # Routing admina
│   │   └── index.ts          # Agregacja wszystkich routów
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces i typy
│   └── index.ts              # Entry point aplikacji
├── .env.example              # Przykładowa konfiguracja
├── package.json
└── tsconfig.json
```

## 🔄 Mapowanie endpointów (PHP → Node.js)

| PHP Endpoint | Node.js Endpoint | Metoda | Opis |
|-------------|------------------|--------|------|
| POST /login | POST /api/auth/login | POST | Logowanie |
| POST /register | POST /api/auth/register | POST | Rejestracja |
| POST /logout | POST /api/auth/logout | POST | Wylogowanie |
| GET /api/trips | GET /api/trips | GET | Lista wycieczek |
| POST /api/trips | POST /api/trips | POST | Nowa wycieczka |
| POST /api/trips/update | PUT /api/trips/:id | PUT | Edycja wycieczki |
| POST /api/trips/delete | DELETE /api/trips/:id | DELETE | Usunięcie wycieczki |
| GET /api/users | GET /api/admin/users | GET | Lista użytkowników |
| POST /api/users/role | PUT /api/admin/users/:id/role | PUT | Zmiana roli |
| POST /api/users/password | PUT /api/admin/users/:id/password | PUT | Zmiana hasła |
| POST /api/users/delete | DELETE /api/admin/users/:id | DELETE | Usunięcie użytkownika |

## ⚠️ Status: Ukończono implementację! ✅

✅ Routing i struktura endpointów
✅ Implementacja wszystkich kontrolerów
✅ Middleware autentykacji JWT
✅ Middleware autoryzacji (admin)
✅ Walidacja danych i obsługa błędów
✅ Prisma ORM integration

**Backend jest gotowy do testowania!**

---

**Uwaga:** Przed uruchomieniem upewnij się, że baza PostgreSQL działa (docker-compose up)!
