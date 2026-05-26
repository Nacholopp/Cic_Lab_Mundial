# Sistema de agentes – WorldCup Fan Planner 2026

Este proyecto se organizará con cuatro agentes principales: Experto en Dominio, Desarrollador, Quality Assurance y Auditor. Cada agente tiene una responsabilidad clara para evitar errores, duplicidades y decisiones técnicas mal justificadas.

## 1. Experto en Dominio

El Experto en Dominio define qué debe hacer la aplicación desde el punto de vista del usuario fan del Mundial 2026.

Funciones:
- Entender los perfiles de usuario: fan local, fan de una ciudad y fan multi-ciudad.
- Validar que el onboarding recoge todos los datos necesarios.
- Definir qué información necesita el usuario para viajar.
- Revisar la lógica de itinerarios.
- Asegurar que las recomendaciones tienen sentido futbolístico y logístico.
- Confirmar que los partidos, vuelos, hoteles, transporte y clima se combinan correctamente.
- Mantener actualizado el documento de negocio del proyecto.

## 2. Desarrollador

El Desarrollador construye la aplicación full-stack.

Funciones:
- Crear la estructura del proyecto.
- Implementar frontend con React, Vite y Tailwind.
- Implementar backend con Node.js y Express.
- Crear base de datos con PostgreSQL y Prisma.
- Integrar Amadeus para vuelos reales.
- Integrar TheSportsDB para partidos.
- Integrar TimeAPI desde backend.
- Integrar Weather API.
- Crear endpoints REST.
- Implementar lógica de recomendación.
- Crear mapa, timeline, onboarding y dashboard.
- Mantener código limpio, modular y escalable.

## 3. Quality Assurance

El agente de Quality Assurance se encarga de probar que todo funciona correctamente.

Funciones:
- Probar onboarding completo.
- Probar búsqueda de vuelos.
- Probar fechas flexibles ±2 días.
- Probar conversión ciudad → IATA.
- Probar filtros de partidos.
- Probar itinerarios generados.
- Validar errores de APIs externas.
- Comprobar responsive design.
- Revisar accesibilidad básica.
- Crear checklist de bugs.
- Confirmar que no hay datos falsos donde deben usarse APIs reales.

## 4. Auditor

El Auditor revisa el proyecto desde un punto de vista técnico, de seguridad y coherencia.

Funciones:
- Revisar arquitectura general.
- Detectar código duplicado o mal organizado.
- Verificar que el frontend no llama directamente a APIs externas sensibles.
- Confirmar que Amadeus se usa desde backend.
- Revisar variables de entorno.
- Revisar manejo de errores.
- Revisar cache con Redis.
- Validar seguridad básica.
- Revisar que el proyecto cumple el brief original.
- Proponer mejoras antes de la entrega final.

## Flujo recomendado de trabajo

1. Experto en Dominio define requisitos.
2. Desarrollador implementa.
3. Quality Assurance prueba.
4. Auditor revisa.
5. Desarrollador corrige.
6. Auditor valida versión final.