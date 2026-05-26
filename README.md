# WorldCup Fan Planner 2026

Aplicacion full-stack para planificar viajes del Mundial 2026 con datos reales de partidos y vuelos.

## Stack

- Frontend: React + Vite + Tailwind + Zustand
- Backend: Node.js + Express
- DB: PostgreSQL + Prisma
- Cache: Redis

## Estructura

- `agents/`: roles del sistema de agentes
- `docs/`: documentacion de producto y tecnica
- `backend/`: API REST
- `frontend/`: interfaz web
- `tests/`: pruebas

## Requisitos

- Node.js 20+
- npm 10+

## Variables de entorno

1. Copia `.env.example` a `.env`.
2. Rellena las claves requeridas.

Claves minimas para plan completo:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `OPENWEATHER_API_KEY`

## Instalacion

```bash
npm install
npm run install:all
```

## Ejecutar

```bash
npm run dev
```

Servicios:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Endpoints principales

- `GET /api/health`
- `GET /api/matches`
- `GET /api/time?timezone=Europe/Madrid`
- `POST /api/flights/search`
- `POST /api/itinerary/plan`
