# Kaizen — home-page-redesign (en curso)

## KZ-005 (propuesto) — El brief del Implementer debe nombrar i18n cuando la tarea produce copy

**Medido.** Dos Implementers independientes (T003 `SectionNav`, T005 `LedgerSection`), en tareas sin
relación entre sí y en paralelo, cometieron **el mismo defecto**: escribir copy en español dentro de
la plantilla o del código en vez de crear claves en los dos diccionarios. Uno además inventó tres
claves inexistentes y les puso un fallback en español; el otro reutilizó una clave que otra tarea del
mismo spec borra.

**Causa raíz — es del Leader, no de los workers.** Ninguno de los dos briefs mencionaba i18n. Ambas
tareas producían texto visible y ninguna lo declaraba como entregable. El `tasks.md` tampoco lo
nombraba en sus `### Tests`: la trazabilidad de REQ-011 apuntaba sólo a T004 (claves huérfanas) y
T011 (`testimonialLabel`), así que **ninguna tarea era dueña del copy nuevo**.

**El agravante, y la lección real.** El patrón `translated !== key ? translated : '<literal español>'`
no sólo incumple REQ-011: **destruye la detectabilidad del incumplimiento**. Que una clave ausente se
renderice *como la clave* es lo que vuelve visible el fallo en la primera mirada. Con fallback, la
clave cruda no llega nunca a pantalla y el defecto sobrevive a cualquier revisión visual — un
visitante EN ve español y nada falla. Igual de grave: declarar esas claves inventadas en el
`fakeLocaleService` de un test deja la suite **verde afirmando contra un diccionario que no existe**,
y ni el gate de paridad ES/EN (que compara los dos conjuntos entre sí, no contra el uso) ni
`i18n-values-gate` pueden detectarlo.

**Estandarización propuesta.**

1. `.agents/implementer.md`: si la tarea produce texto visible, las claves en **ambos** diccionarios
   son parte del entregable, y el *directory boundary* debe incluir `client/src/assets/i18n/`.
   Prohibido cualquier fallback de copy en código.
2. Plantilla de `tasks.md`: toda tarea que cree plantilla o texto lleva REQ-011 en sus
   `Requirements` y un `Done when` de paridad ES/EN.
3. Gate de test: un aserto que cruce **claves usadas** contra **claves declaradas**. La paridad ES/EN
   actual no lo cubre — compara los diccionarios entre sí, no contra el código que los consume.

**Estado:** Proposed · Severidad: Alta · Origen: Reviewer T003 y Reviewer T005, 2026-09-06
