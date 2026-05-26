# Arquitectura

## Frontend

- React + Vite
- Zustand para estado global
- React Router para navegacion
- Tailwind para estilos

## Backend

- Express API
- Servicios desacoplados por dominio:
  - Amadeus
  - TheSportsDB
  - Time API
  - Weather
- Middleware de errores y rate limit
- Cache en Redis para respuestas de terceros

## Persistencia

- PostgreSQL con Prisma
