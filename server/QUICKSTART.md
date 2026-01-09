# 🚀 Quick Start Guide - Trip Planner Backend

## Szybkie uruchomienie serwera

### 1. Upewnij się że baza PostgreSQL działa
```bash
# Z głównego folderu projektu
docker-compose up -d db
```

### 2. Zainstaluj zależności
```bash
cd server
npm install
```

### 3. Wygeneruj Prisma Client
```bash
npm run prisma:generate
```

### 4. Uruchom serwer
```bash
npm run dev
```

Serwer będzie dostępny na: **http://localhost:3000**

---

## 🧪 Testowanie endpointów

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Rejestracja nowego użytkownika
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "name": "Test",
    "surname": "User",
    "password": "password123"
  }'
```

### 3. Logowanie
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "admin"
  }'
```

**Odpowiedź zawiera token JWT** - skopiuj go!

### 4. Pobierz listę wycieczek (wymaga tokenu)
```bash
curl http://localhost:3000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Dodaj nową wycieczkę
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trip to Paris",
    "country": "France",
    "dateFrom": "2025-06-01",
    "dateTo": "2025-06-10",
    "tripType": ["city-break", "cultural"],
    "tags": ["Summer", "Europe"],
    "budget": "$2000",
    "description": "Amazing trip to Paris!",
    "image": "/public/assets/eiffel-tower.jpg"
  }'
```

### 6. Pobierz pojedynczą wycieczkę po ID
```bash
curl http://localhost:3000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Zaktualizuj wycieczkę
```bash
curl -X PUT http://localhost:3000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Trip to Paris",
    "country": "France",
    "dateFrom": "2025-07-01",
    "dateTo": "2025-07-15",
    "tripType": ["city-break"],
    "tags": ["Summer"],
    "budget": "$2500"
  }'
```

### 8. Usuń wycieczkę
```bash
curl -X DELETE http://localhost:3000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👤 Testowanie endpointów admin

**Uwaga:** Musisz być zalogowany jako admin (email: admin@admin.com, password: admin)

### 1. Pobierz wszystkich użytkowników
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 2. Zmień rolę użytkownika
```bash
curl -X PUT http://localhost:3000/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### 3. Zmień hasło użytkownika
```bash
curl -X PUT http://localhost:3000/api/admin/users/USER_ID/password \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword123"}'
```

### 4. Usuń użytkownika
```bash
curl -X DELETE http://localhost:3000/api/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## ✅ Kryteria spełnione

### 1. Pierwszy endpoint - lista elementów ✅
- `GET /api/trips` - zwraca listę wycieczek
- **200 OK** + JSON z danymi

### 2. Dynamiczny parametr ✅
- `GET /api/trips/:id` - pobiera pojedynczą wycieczkę
- Jeśli istnieje → **200 OK** + JSON
- Jeśli nie istnieje → **404 Not Found** + komunikat

### 3. Obsługa błędu ✅
- `GET /api/trips/invalid-uuid` → **400 Bad Request** 
- `GET /api/trips/non-existent-uuid` → **404 Not Found**
- Brak tokenu → **401 Unauthorized**
- Niewystarczające uprawnienia → **403 Forbidden**

---

## 🛠️ Narzędzia do testowania

### Postman / Insomnia
Importuj kolekcję endpointów do Postman/Insomnia dla łatwiejszego testowania.

### VS Code REST Client
Możesz też użyć pliku `.http` w VS Code z rozszerzeniem REST Client.

---

## 🐛 Troubleshooting

### Błąd: "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### Błąd: "JWT_SECRET is not defined"
Sprawdź czy plik `.env` istnieje i zawiera `JWT_SECRET`

### Błąd połączenia z bazą danych
Upewnij się że PostgreSQL działa:
```bash
docker-compose ps
```

Jeśli nie działa:
```bash
docker-compose up -d db
```

---

**Gotowe! Backend działa i jest gotowy do integracji z frontendem React! 🎉**
