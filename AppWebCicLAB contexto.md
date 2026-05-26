# 🌍 WorldCup Fan Planner 2026 – MASTER DOCUMENT FINAL (ULTIMATE VERSION)

---

# 🧠 VISIÓN DEL PROYECTO

WorldCup Fan Planner 2026 es una aplicación web full-stack diseñada para automatizar completamente la planificación de un fan del Mundial 2026.

El Mundial 2026:
- 3 países: USA, Canadá, México
- múltiples ciudades
- logística extremadamente compleja

👉 Problema: el usuario no puede organizar esto manualmente  
👉 Solución: un sistema inteligente que lo haga por él

---

# 💡 PROPUESTA DE VALOR

👉 Asistente inteligente de viajes + fútbol

Debe:
- entender al usuario
- analizar partidos
- optimizar rutas
- integrar vuelos reales
- generar itinerarios automáticos
- explicar decisiones

👉 Objetivo UX:
**“No tengo que pensar nada, la app lo hace por mí”**

---

# 👤 INPUT DEL USUARIO

- selección favorita
- ciudad de origen
- aeropuerto cercano
- presupuesto
- fechas de viaje
- flexibilidad (±2 días)
- nº personas
- edad
- carnet de conducir
- preferencias:
  - barato
  - cómodo
  - rápido
  - fútbol
  - turismo

---

# 👤 TIPOS DE USUARIO

## 1. Fan local
- no viaja
- solo calendario y partidos

## 2. Fan una ciudad
- partidos en esa ciudad
- hoteles
- transporte local

## 3. Fan multi-ciudad (CORE)
- rutas optimizadas
- vuelos entre ciudades
- timing
- coste total

---

# 🎯 OUTPUT

La app devuelve:

### ✈️ Vuelos
- más barato
- más rápido
- recomendado

### 📊 Datos
- duración total
- escalas
- horarios

### 🧭 Itinerario
- timeline día a día

### 💰 Coste
- total + desglose

### 🔁 Alternativas
- incluso fuera de presupuesto

---

# ✈️ AMADEUS (INTEGRACIÓN REAL)

## Flight Offers Search
- vuelos reales
- orden:
  - precio
  - duración
  - escalas

## Fechas flexibles
- -2 / -1 / 0 / +1 / +2

## Airport & City Search
- ciudad → IATA
- autocomplete

⚠️ obligatorio:
- sin mocks
- manejo errores
- cache Redis
- rate limits

---

# ⚽ API PARTIDOS (TheSportsDB)

- league ID: 4429

Datos:
- partidos
- equipos
- horarios
- sedes

Uso:
- calendario
- filtros
- itinerario

---

# 🕒 API DE TIEMPO (TimeAPI)

Endpoint:
https://timeapi.bio/api/time/current/zone

Backend:
- /api/time

Datos:
- hora local
- fecha
- timezone
- UTC offset
- DST

Configuración:
- refresh: 60000 ms
- cache: 30s

---

# 🌦️ CLIMA

- OpenWeather

Uso:
- clima en partidos
- alertas
- recomendaciones

---

# 🚕 TRANSPORTE LOCAL

- Uber (deep links)
- taxis locales
- transporte público
- tiempo estimado

---

# 🧭 FUNCIONALIDADES

## 📅 Calendario
- filtros
- horarios locales

## 🗺️ Mapa (CORE UI)

Mapa del mundo interactivo con:

- origen del usuario
- destino(s)
- rutas de vuelos dibujadas
- visualización clara de trayectos

---

# 🖥️ INTERFAZ AVANZADA (MUY IMPORTANTE)

## 🌍 PANTALLA PRINCIPAL (POST-ONBOARDING)

Una vez el usuario introduce sus datos:

### 🗺️ MAPA CENTRAL
- mapa del mundo
- rutas de vuelos (origen → destino)
- ciudades destacadas
- visual limpio y atractivo

---

## 👤 TOP RIGHT – PERFIL DESPLEGABLE

- botón con avatar
- dropdown editable

Opciones:
- editar perfil
- cambiar preferencias
- ver datos de viaje
- logout

---

## 📰 TOP LEFT – MENÚ PERIÓDICO (DISEÑO PAPEL DOBLADO)

Icono:
👉 estilo periódico doblado

Función:
- mostrar portada del medio deportivo más importante según país del usuario

Comportamiento:
- preview tipo portada
- al hacer click → redirección a web oficial

---

## 🌎 LISTA DE PERIÓDICOS POR PAÍS

### CONCACAF
- México — Récord
- USA — ESPN Soccer
- Canadá — The Athletic Canada
- Panamá — RPC Deportes
- Haití — Haïti Tempo
- Curazao — Curaçao Chronicle Sports

### UEFA
- UEFA — UEFA Official
- España — Marca
- Francia — L'Équipe
- Inglaterra — BBC Sport
- Alemania — Kicker
- Portugal — A Bola
- Países Bajos — Voetbal International
- Italia — La Gazzetta
- Bélgica — Sporza

### CONMEBOL
- Argentina — Olé
- Brasil — Globo Esporte
- Uruguay — Ovación
- Colombia — Win Sports

### CAF
- Marruecos — Al Mountakhab
- Senegal — Wiwsport
- Egipto — KingFut

### AFC
- Japón — Nikkan Sports
- Corea — Sports Chosun
- Australia — The Roar

### OFC
- Nueva Zelanda — Stuff Sport

---

# 🧠 SISTEMA DE RECOMENDACIÓN

Evalúa:
- precio
- duración
- escalas
- comodidad
- timing partidos

Devuelve:
- mejor opción
- alternativas

👉 con explicación clara

---

# 🧠 UX AVANZADA

- siguiente paso visible
- checklist de viaje
- indicador de estrés
- planes alternativos
- recomendaciones de zonas

---

# 🎨 DISEÑO

- estilo FIFA
- minimalista
- moderno

Colores dinámicos:
- Canadá → rojo
- USA → azul marino
- México → verde oliva

---

# 🧱 STACK

Frontend:
- React + Vite
- Tailwind
- Zustand

Backend:
- Node.js + Express

DB:
- PostgreSQL + Prisma

Otros:
- Redis
- JWT

---

# 🧩 BASE DE DATOS

- users
- profiles
- matches
- cities
- itineraries
- flights
- hotels
- car_rentals

---

# 🚀 MVP

- onboarding
- perfil
- vuelos reales
- calendario
- mapa
- itinerario básico

---

# 🎯 EXPERIENCIA FINAL

👉 sistema guiado  
👉 decisiones automáticas  
👉 UX sin fricción  

---

# 🤖 PROMPT FINAL PARA CLAUDE

Construye una app full-stack “WorldCup Fan Planner 2026” con:

Frontend:
- React + Vite + Tailwind

Backend:
- Node.js + Express

DB:
- PostgreSQL + Prisma

Integra APIs REALES:
- Amadeus
- TheSportsDB
- TimeAPI
- Weather API

Debe:
- partir del origen del usuario
- convertir ciudad → IATA
- usar fechas flexibles
- optimizar rutas
- mostrar vuelos:
  - barato
  - rápido
  - recomendado
- calcular costes
- sugerir transporte local
- integrar clima
- incluir mapa interactivo con rutas
- incluir menú de periódicos por país
- incluir perfil editable
- explicar decisiones

Genera:
- estructura completa
- frontend base
- backend base
- integración APIs reales
- esquema Prisma
- lógica recomendación