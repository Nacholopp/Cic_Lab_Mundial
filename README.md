# WorldCup Fan Planner 2026

Aplicacion full-stack para planificar viajes del Mundial 2026.

## Stack

- Frontend: React + Vite + Tailwind + Zustand
- Backend: Node.js + Express
- DB: PostgreSQL (Neon) + Prisma

## Login/Registro

- Registro con `username`, `email`, `password`
- `email` unico (no se puede repetir)
- Si el email ya existe al registrar, la API responde para ir a login
- Sesion con JWT
- Dropdown arriba a la derecha con Login/Register/Logout
- Itinerarios guardados por usuario autenticado

## Configuracion

1. Copia `.env.example` a `.env`.
2. Configura `DATABASE_URL` con tu Neon (la cadena que te da Neon).
3. Define `JWT_SECRET`.
4. Configura `IGNAV_API_KEY` para vuelos.

## Instalacion

```bash
npm install
npm run install:all
```

## Preparar Prisma en Neon

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
```

## Ejecutar

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Endpoints auth

- `GET /api/auth/check-email?email=...`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
