# PRD — AMD Soluciones Integrales

Rework completo del sitio público de AMD Soluciones Integrales S.A.S. (Cali, Colombia): una landing profesional, bilingüe e interactiva que convierta visitantes en leads de contacto. **Fase 1 = solo landing (Angular).** Panel admin, usuarios, seguridad y pagos quedan fuera de esta fase.

## 1. Overview & Purpose

AMD Soluciones Integrales ayuda a personas naturales y jurídicas a formalizar y operar su actividad económica (contabilidad, gestión administrativa, sistemas de riesgo, asesoría, marca). El sitio actual en Zyrosite comunica la oferta pero no alcanza el estándar visual ni la conversión de referencias premium (p. ej. Stripe).

Este PRD define el producto digital v1: una experiencia de marketing en `client/` que inspire confianza, explique el portafolio y empuje al contacto (formulario + WhatsApp).

## 2. Problem Statement

| Problema | Impacto |
|----------|---------|
| Sitio actual poco diferenciado y con estética de builder genérico | Baja percepción de marca premium |
| CTA de contacto débil frente a scroll/engagement | Menos leads cualificados |
| Sin i18n | Se pierde audiencia EN |
| Sin base app propia (Angular/Nest) | Difícil iterar UX y preparar fases futuras |

**Job to be done:** Cuando un dueño de negocio busca formalizar o profesionalizar su operación, quiere entender rápido qué ofrece AMD y contactar sin fricción.

## 3. Target Personas

| Persona | Necesidad | Éxito para ellos |
|---------|-----------|------------------|
| **P1 — Emprendedor / PYME (ES)** | Formalizar, declarar, ordenar finanzas | Entiende servicios y envía consulta o WhatsApp |
| **P2 — Founder / ops lead (EN)** | Same offer, English UI | Completa el mismo journey en EN |
| **P3 — Equipo AMD (interno, fase 2+)** | Gestionar leads y contenido | Fuera de v1; solo asumido en roadmap |

## 4. Goals & Success Metrics

**North Star (v1):** leads cualificados por mes (envíos de formulario con intención clara **o** clicks a WhatsApp con contexto de servicio).

| Métrica | Meta inicial (hipótesis) | Cómo medir (fase 1) |
|---------|--------------------------|---------------------|
| Leads / mes | Baseline actual → +30% en 90 días post-lanzamiento | Contador de submits + clicks WhatsApp (analytics client-side) |
| Scroll depth ≥ 75% | ≥ 40% de sesiones | Analytics |
| Language switch used | Track only | Evento i18n |
| Lighthouse Performance (móvil) | ≥ 85 en hero estático | CI / manual |

## 5. Scope (In / Out)

### In — Fase 1 (Landing)

- SPA marketing: Inicio → Servicios → Sobre AMD → Prueba social → Contacto
- Scroll storytelling + parallax moderado + CTAs por sección
- i18n **ES + EN**
- Formulario de contacto **client-side** + WhatsApp flotante (sin Nest en esta fase)
- Theming PrimeNG alineado a tokens de marca (dorado AMD + neutros premium)
- Contenido migrado/refinado desde amdsoluciones.com

### Out — Fase 1

- `server/` NestJS (API, persistencia de leads, email transaccional)
- Panel administrativo, auth, roles, pagos
- CMS headless, blog, portal de clientes
- Deploy a producción (solo entorno local + plan Docker)

### Roadmap (no v1)

| Fase | Entrega |
|------|---------|
| **2** | NestJS: leads API, email, base Docker Compose full-stack |
| **3+** | Admin, usuarios, seguridad, métodos de pago |

## 6. User Stories

1. Como visitante, quiero ver en el primer viewport la marca AMD y una promesa clara para decidir si sigo scrolleando.
2. Como visitante, quiero explorar servicios contables/administrativos/asesoría sin salir de un flujo continuo.
3. Como visitante, quiero cambiar idioma ES↔EN y conservar el contexto de sección.
4. Como visitante, quiero contactar por formulario o WhatsApp desde cualquier punto del journey.
5. Como visitante con `prefers-reduced-motion`, quiero una versión usable sin parallax agresivo.
6. Como equipo AMD, quiero una base Angular lista para iterar diseños antes de invertir en backend.

## 7. Acceptance Criteria

- [ ] La SPA cubre secciones: Hero, Servicios, Sobre, Social proof, Contacto (y nav anclado).
- [ ] CTAs primarios llevan a contacto o WhatsApp; al menos un CTA por capítulo de scroll.
- [ ] i18n ES/EN operativo en copy UI (contenido legal/contacto coherente).
- [ ] Formulario valida campos requeridos en cliente; en fase 1 no depende de Nest (ver Assumptions).
- [ ] WhatsApp abre chat con mensaje prefijado (servicio opcional).
- [ ] Tokens de color/tipografía/efectos cumplen `docs/ux-ui/design.md` (dorado `#CFBB66`, sin púrpura de template).
- [ ] Parallax/glass/neuromorfismo respetan `prefers-reduced-motion`.
- [ ] Responsive usable en 375 / 768 / 1024 / 1440.
- [ ] No se implementa ni se bloquea el trabajo de landing por código Nest en fase 1.

## 8. Assumptions, Dependencies, & Constraints

| ID | Tipo | Hipótesis / hecho |
|----|------|-------------------|
| A1 | Assumption | El dorado `#CFBB66` (“Amarillo AMD” en el sitio actual) + neutros oscuros es la paleta oficial hasta brand book. |
| A2 | Assumption | Fase 1 del formulario: validación client-side + handoff a WhatsApp y/o `mailto:` / deep-link; persistencia Nest = fase 2. |
| A3 | Assumption | El contenido actual del sitio/brochure es la fuente de verdad de copy hasta revisión comercial. |
| A4 | Constraint | Stack: Angular (`client/`) + PrimeNG themed; Nest (`server/`) reservado fase 2. |
| A5 | Constraint | Iteración de diseño precede a cualquier inversión backend. |
| A6 | Dependency | Assets de logo (`logo-amd-circular`, wordmark) disponibles desde el sitio actual o entregados por AMD. |
| A7 | Assumption | Dockerización completa se diseña ahora y se implementa cuando haya algo que contenerizar (client primero; compose full-stack en fase 2). |

## 9. Open Questions

1. ¿Hay brand book / logo vectorial oficial más allá del PNG Zyrosite?
2. ¿Número WhatsApp canónico único (`324 8805290` vs otros números públicos)?
3. ¿Analytics preferido (GA4, Plausible, ninguno en MVP)?
4. ¿Traducción EN la provee AMD o se genera y valida después?

## Next step

Tras aprobar esta constitución: `/akili-propose` del primer milestone de landing (Greenfield) o `/akili-specify docs/specs/domain/landing` si el alcance v1 cabe en un solo spec.
