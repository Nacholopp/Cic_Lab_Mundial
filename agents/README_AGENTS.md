# Sistema de Agentes - WorldCup Fan Planner 2026

Este proyecto utiliza cuatro agentes con responsabilidades separadas para reducir errores y mejorar trazabilidad.

## Agentes

1. Experto en Dominio
2. Desarrollador
3. Quality Assurance
4. Auditor

## Flujo de trabajo

1. Experto en Dominio define o ajusta requisitos.
2. Desarrollador implementa cambios.
3. Quality Assurance valida comportamiento y casos de error.
4. Auditor revisa arquitectura, seguridad y coherencia.
5. Desarrollador corrige observaciones.
6. Auditor valida la version final.

## Regla de operacion

- Ningun agente modifica el scope sin actualizar documentacion de soporte.
- Las decisiones criticas deben quedar registradas en `docs/architecture.md` o `docs/roadmap.md`.
