# Test Report — services-page-redesign

**Estado global: PASS.** 235 tests verdes, REQ-008 cerrado y el PRODUCT_BUG de REQ-009 **resuelto en T009**. El desbordamiento residual resultó ser un defecto **preexistente del top-nav**, ajeno a este spec y presente en todas las rutas → se deriva a un `bugfix/` propio.

## Document Control

| Field | Value |
|-------|-------|
| Spec path | `docs/specs/changes/services-page-redesign/` |
| Fecha | 2026-09-05 |
| Leader | Claude Code (opus) — T1, no escribió tests |
| Suites | 2 · **1 Tester delegado** (frontend unit) + **1 inline** (responsive en navegador, por el Leader) |
| Tester | `akili-tester` (sonnet) — **≠ Implementer** (Antigravity), independencia cumplida |
| Base | 234 tests verdes al entrar |

## Summary

| Suite | Tipo | Ejecución | Estado |
|-------|------|-----------|--------|
| Conservación de estado en cambio de idioma | frontend unit | Tester delegado | **PASS** |
| Comportamiento responsive | manual / navegador | Leader inline | **PRODUCT_BUG → resuelto (T009)** |

**Backend unit / integración / E2E:** no aplican — fase 1 sin API (TRD ADR-003) y sin runner de navegador (fuera de alcance declarado en `requirements.md` §6).

**Cobertura previa citada, no reescrita:** los 234 tests que produjo `/akili-execute` se citan como evidencia. El presupuesto de esta fase se gastó solo en lo que esos tests no probaban.

## 1. Frontend Unit — conservación de estado al cambiar de idioma · PASS

**Hueco cerrado:** el escenario de REQ-008 exige *"AND IT MUST conservar el capítulo y el estado de expansión"*. `services-page.spec.ts` stubeaba `LocaleService` con solo `{ translate }`, así que el idioma no podía cambiar y el escenario era intestable. El nuevo test usa un stub con **diccionario como señal**, imitando el patrón que ya existía en `contact-section.spec.ts`.

| Cláusula | Aserción |
|----------|----------|
| Conserva la expansión | `data-collapsed` sigue `null` y `aria-expanded="true"` tras el cambio |
| Conserva el capítulo | `aria-current="true"` permanece **solo** en Riesgo, y exactamente 1 enlace lo tiene |
| El texto sí cambia de idioma | `h2` (`g1Title`) y el botón `.more` (`svcShowLess`) pasan de ES a EN |

**Detalle de diseño del test que evita una trampa:** el capítulo activo se fija en **Riesgo**, distinto del valor por defecto `contabilidad`. Con el default, "conservar" y "resetear" darían el mismo resultado y el test pasaría por accidente.

La tercera cláusula impide la tautología contraria: sin ella, un componente que ignorase el idioma también pasaría.

**Falsabilidad demostrada.** Se inyectó temporalmente en `services-page.ts` un `effect()` que reseteaba `expanded` y `activeGroup` en cada cambio de diccionario — la regresión exacta que WARN-2 advertía. La prueba nueva se puso **roja** (`expected 'true' to be null`) mientras las otras 234 seguían verdes. Restaurado desde respaldo; `git diff` del archivo de producción **vacío**, verificado por el Leader.

**Resultado:** 234 → **235 tests**, lint limpio.

## 2. Responsive — PRODUCT_BUG · REQ-009 incumplido

Verificado por el Leader cargando `/services` en iframes de anchura fija (cada iframe tiene su propio viewport para las media queries), ya que el navegador embebido no se puede redimensionar.

| Viewport | `documentElement.scrollWidth` | Veredicto |
|----------|-------------------------------|-----------|
| **1400px** | 1400 | ✅ sin desbordamiento |
| **768px** | ~775 | ❌ desborda |
| **375px** | **775** | ❌ **desborda 400px** |

REQ-009 dice literal: *"BUT it must NOT provocar scroll horizontal en el cuerpo de la página"*. **Incumplido por debajo de ~1000px.**

### Causa raíz (parcialmente confirmada en vivo)

El índice en modo chips suma **748px**. El CSS declara `grid-template-columns: 1fr` en la media query `≤1099px`; una pista `1fr` **no baja de su `min-content`**, así que esos 748px inflan la columna y arrastran a `.chapters`, `.chapter`, `h2` y `.subs` — todos medidos en 756px dentro de un viewport de 375px.

Aplicando `minmax(0, 1fr)` en caliente, el `scrollWidth` cae de **775 → 461**. Confirma el mecanismo, pero **queda un segundo contribuyente de ~86px** en el full-bleed del rail móvil (`margin: 0 calc(50% - 50vw)` + `padding: … calc(50vw - 50% + …)`), sin diagnosticar del todo.

### Por qué ningún gate lo detectó

- **jsdom no hace layout**: ninguna de las 235 pruebas puede medir desbordamiento.
- **El check de navegador se hizo a 1080px**, donde el desbordamiento coincide con el viewport y `scrollWidth > innerWidth` daba `false`. Medición correcta, cobertura insuficiente — exactamente el **WARN-3** del informe de validación.

El defecto solo se manifiesta por debajo de ~1000px, que es la mayoría del tráfico móvil.

### Resolución en el layout de escritorio (efecto colateral positivo)

La misma técnica cerró el otro hueco de WARN-3: **el índice de escritorio queda verificado por primera vez** a 1400px — `grid-template-columns: 248px 868px`, rail `sticky`, lista vertical, filas a 2 columnas, CTA del rail visible, sin desbordamiento.

## 3. Coverage & Traceability

| REQ | Escenario | Tipo | Evidencia | Resultado |
|-----|-----------|------|-----------|-----------|
| REQ-001 | Índice sigue la lectura · salto por ancla · final de página | unit + navegador | `active-chapter.spec.ts` (3 escenarios) + clic real | **PASS** |
| REQ-002 | Salto suave, `<h2>` visible | navegador | capítulo en 144px, nav en 69px | **PASS** |
| REQ-003 | Jerarquía; no cards; sin numeración | unit + captura | `services-page.spec.ts` | **PASS** |
| REQ-004 | Revelar/colapsar; no fuera del DOM | unit + navegador | toggle conductual; 31 en DOM, 21 visibles | **PASS** |
| REQ-005 | Preselección; valor inválido; cambio de idioma | unit | `contact-section.spec.ts` | **PASS** |
| REQ-006 | CTA por línea + cierre | unit | anclado por capítulo | **PASS** |
| REQ-007 | Deep-link; 5 ids; id en `<article>` | unit | `services-page.spec.ts` | **PASS** |
| REQ-008 | Paridad; **conserva capítulo y expansión** | unit | `i18n-values-gate` + **test nuevo** | **PASS** |
| REQ-009 | Chips; 1 columna; **sin scroll horizontal** | navegador | iframes 1400/768/375 tras T009 | **PASS** |
| REQ-010 | Teclado, foco, ≥44px, estado programático | navegador + unit | ≥44px en 4 tipos de control | **PASS** |
| REQ-011 | Solo tokens AMD; cero púrpura | estático + navegador | contraste AA en 7 elementos | **PASS** |

**11 de 11 requisitos con evidencia. Cero FAIL.**

## 4. Remediation

| # | Acción | Prioridad |
|---|--------|-----------|
| ~~T009~~ | ~~Corregir el desbordamiento horizontal `≤1099px`~~ | **HECHO** — ver §6 |
| **NUEVO** | `bugfix/topnav-overflow-mobile`: `.topnav__actions` / `.menu-btn` llegan a 462px en un viewport de 375px, **en todas las rutas**. Fuera del alcance de este spec | Alta — spec aparte |
| R-2 | Añadir `npm run build` a la verificación de tareas que tocan CSS | Alta |
| R-5 | Adoptar la técnica del iframe como verificación responsive estándar en este repo | Media |

## 5. Accepted Gaps

| Gap | Razón |
|-----|-------|
| Sin E2E | Sin runner de navegador; excluido explícitamente en `requirements.md` §6 (TRD tier LITE) |
| El test de idioma no ejercita `LocaleService` real (fetch, caché, `localStorage`) | Usa un stub de señal equivalente; el servicio real ya tiene sus propias pruebas |
| Animación CSS de colapso no verificada | jsdom no anima; visualmente confirmada en el check de navegador |
| ~~Los ~86px residuales~~ | **Resuelto por atribución:** no eran de esta página. Ver §6 |

## 6. T009 — resolución del PRODUCT_BUG

**Ejecutado por Antigravity, verificado por el Leader en navegador.**

### Lo que cambió

- `.catalog` → `minmax(0, 1fr)` en `≤1099px`: la columna ya puede bajar del `min-content` de 748px de la lista de chips.
- **Se eliminó la dependencia de `50vw`**: el rail móvil deja el full-bleed (`margin: 0 calc(50% - 50vw)`) y se contiene dentro de `.wrap`. `50vw` incluye la barra de scroll y `50%` no, y esa disparidad era la fuente del residuo.
- `min-width: 0` en `.rail__list`, `.chapters` y `.rail`; `.subs` → `minmax(0, 1fr)` en `≤720px`.
- El scroll horizontal **interno** de los chips se conserva: es comportamiento de diseño.

Cumple KZ-002: cero selectores `body`/`html`, y **no** se tapó el síntoma con `overflow-x: hidden`.

### Medición del Reviewer (iframes con viewport propio)

| Viewport | `scrollWidth` | ¿Desborda la página? | Layout |
|----------|---------------|----------------------|--------|
| 1400px | 1400 | **no** | `248px 868px`, rail sticky, subs 2 col — escritorio intacto |
| 768px | 768 | **no** | `728px`, subs 2 col |
| 375px | 461 | ver abajo | `335px`, subs 1 col — **la página no aporta desbordamiento** |

### El residuo de 375px no es de este spec

`document.documentElement.scrollWidth` a 375px:

| Ruta | `scrollWidth` | `menu-btn` borde derecho |
|------|---------------|--------------------------|
| `/services` | 461 | 462 |
| `/about-us` (no tocada) | **461** | **462** |
| `/` Home (no tocada) | **461** | **462** |

Cifras **idénticas** en rutas que este spec no modificó. El desbordamiento restante lo produce `app-top-nav` (`.topnav__actions`, `.menu-btn`), un defecto **preexistente y global**. A 768px no se manifiesta porque 462 < 768.

**Conclusión:** REQ-009 se cumple para la página de Servicios. El defecto del nav se deriva a `bugfix/topnav-overflow-mobile`.

**Verificación final:** 28 archivos, **235 tests**, lint limpio, **build sin avisos**.
