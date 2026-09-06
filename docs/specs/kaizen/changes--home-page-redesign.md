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

---

## KZ-005 · addendum — tercera reincidencia, y por qué la lección no está entrando

**Medido (2026-09-06, T007).** El `Directory boundary` de T007 era
`client/src/app/features/home/`, y su Scope ordena retirar `roadHint` de los diccionarios. **Tercera
tarea de la misma spec** cuyo boundary excluye lo que la propia tarea manda tocar (T003 y T005 fueron
las dos primeras). El Leader lo detectó al despachar y amplió el boundary antes de que el worker
llegara al conflicto.

**Lo que añade este caso al KZ-005 original.** Los dos primeros casos eran de **creación** de copy:
el brief no nombraba i18n y el worker escribía literales. Éste es de **borrado**, y el defecto no
está en el brief sino en `tasks.md`: el Scope nombra el fichero y el boundary lo excluye, en la misma
tarea y a cuatro líneas de distancia. Un worker obediente tiene entonces dos salidas y las dos son
malas — violar el boundary, o dejar la clave.

**Por eso la estandarización propuesta no basta.** Los tres puntos del KZ-005 original actúan sobre
el brief del Implementer y sobre los tests. Ninguno impide que `tasks.md` nazca ya contradictorio.
Tres reincidencias en trece tareas dicen que la revisión caso a caso del Leader no escala: es él
quien lo ha atrapado las tres veces, siempre en el último momento, y bastaría un despacho distraído
para que pase.

**Cuarto punto propuesto — gate al escribir `tasks.md`, no al despachar.** Al cerrar `/akili-specify`,
comprobar por tarea que **todo fichero o directorio nombrado en el `### Scope` cae dentro del
`Directory boundary` declarado**. Es una comprobación mecánica sobre texto que ya está escrito, y
habría atrapado los tres casos antes de que existiera un brief.

**Segundo hallazgo del mismo día — `Depends on` no captura la dependencia real.** El Scope de T007
ordenaba añadir el ancla `#cifras` a `home-page.spec.ts`, pero esa sección la crea T009, que **no
está** en el `Depends on` de T007. Cumplir T007 al pie de la letra dejaba la suite en rojo, en
contradicción directa con su propio Evidence disqualifier. Mismo patrón que el anterior: una tarea
internamente inconsistente que sólo se detecta leyéndola entera con el código delante. El gate
propuesto se extiende: **todo símbolo, id o ancla que una tarea asevere existir debe estar creado por
esa tarea o por una de sus `Depends on`.**

**Estado:** Proposed · Severidad: Alta · Origen: Reviewer T007, 2026-09-06

---

## KZ-006 (propuesto) — Revertir una mutación con `git checkout` destruye trabajo sin commitear

**Medido (2026-09-06, revisión de T007).** El Reviewer aplicó una mutación falsable sobre
`home-page.ts` y la revirtió con `git checkout -- <fichero>`. Ese comando restaura desde el **último
commit**, no desde el estado previo a la mutación — y durante una ronda de revisión el árbol siempre
tiene cambios sin commitear, que son justo los que se están auditando. Resultado: el trabajo del
Implementer en ese fichero desapareció. Se recuperó verbatim porque el diff completo se había
capturado antes de mutar, y se reverificó todo en verde.

**Causa raíz.** `git checkout --` parece un "deshacer" local y no lo es: su punto de referencia es
HEAD. En cualquier otro contexto el hábito es inocuo; en una ronda de revisión sobre un árbol sucio
es destructivo, y falla en silencio — el fichero queda sintácticamente válido y sólo lo delata que la
suite se rompa o, peor, que no se rompa.

**Estandarización propuesta.**

1. `.agents/reviewer.md`: para mutar un fichero, **copiar antes** (`cp <f> /tmp/<f>.bak`) y revertir
   con `cp` de vuelta. **Nunca `git checkout`, `git restore` ni `git stash`** mientras el árbol tenga
   cambios del Implementer sin commitear.
2. Tras revertir la última mutación, reverificar la suite completa **y** `git diff --stat` contra el
   estado esperado, antes de emitir el veredicto. Un `--stat` que perdió un fichero es la señal.

**Estado:** Proposed · Severidad: Media · Origen: Reviewer T007, 2026-09-06

---

## KZ-007 (propuesto) — Una tarea escrita como *delta de comportamiento* no porta el diseño, y la revisión no lo detecta

**Medido (2026-09-06, HITL).** El usuario abrió la Home en el navegador y encontró que **dos de las
seis secciones no se parecen al mockup aprobado**: `#sobre-amd` (Manifiesto) y `#confianza`. Once
tareas habían pasado con PASS del Reviewer antes de que nadie lo notara.

Comparación estructural posterior, clase por clase, mockup contra implementación:

| Sección | Cómo estaba escrita su tarea | Resultado |
|---|---|---|
| `#servicios` (T006) | «**Portar el CSS del ledger** desde `mockup/…`» | ✅ fiel |
| `#cifras` (T009) | «Sección nueva… CSS de referencia: `mockup/…`» | ✅ fiel |
| `#sobre-amd` (T008) | «La sección **pasa de `--amd-ink` a claro** y recibe la imagen» | ❌ el teaser viejo repintado |
| `#confianza` (T011) | «**Retirar `setInterval`**… montar `ClientWall`… pasa a blanco» | ❌ el Confianza viejo con el muro pegado |

**La correlación es exacta.** Las tareas redactadas como **port del mockup** salieron fieles. Las
redactadas como **delta de comportamiento sobre el componente existente** —«de tinta a claro»,
«retirar el temporizador»— produjeron componentes que cumplen su Done-when al 100 % y **no se parecen
al diseño aprobado**. `design.md` §5.5 («Cambios en componentes existentes») es una tabla de deltas, y
las tareas la copiaron literalmente: en ningún punto del spec existe la frase «que `#confianza` se
parezca al mockup».

**Causa raíz del lado del Reviewer, y es la parte grave.** El Reviewer validó **cada tarea contra su
propio Done-when**, que es lo que la metodología pide, y por eso las once pasaron. **Nunca abrió el
mockup.** Un Done-when se satisface entero mientras el resultado diverge del artefacto aprobado, y
ningún aserto en jsdom puede notarlo porque ninguno mira el mockup.

Agravante concreto: en **T008 el propio Leader detectó el hueco** —dejó escrito que «la cita y los
pilares no los porta ninguna tarea» y lo reportó al HITL— **y aun así decidió no portarlos**,
apoyándose en el texto de `requirements.md` §5.5 en vez de en el mockup. La información estaba; la
jerarquía de fuentes era la equivocada.

**Estandarización propuesta.**

1. **El mockup manda sobre la prosa del spec.** Cuando `requirements.md`/`design.md`/`tasks.md`
   describan una sección que el mockup dibuja, el mockup es la fuente de verdad del *qué se ve*, y la
   prosa lo es del *cómo se comporta*. Ante discrepancia, se para y se resuelve en HITL — no se elige
   la prosa por defecto.
2. **`/akili-specify`: toda tarea que toque una sección dibujada en el mockup lleva un `Done when` de
   fidelidad**, con el rango de líneas del markup y del CSS de referencia. Una tarea de delta sin ese
   ítem es una tarea incompleta.
3. **`/akili-execute`, paso de revisión: el Reviewer compara el inventario de clases del componente
   contra el de su sección en el mockup** antes de emitir veredicto. Es mecánico y barato:
   `class="…"` de ambos, ordenados, diff. Habría atrapado T008 y T011 en su primera ronda.
4. **La medición visual no puede vivir sólo en la última tarea.** T012 (gate de navegador) es la
   última del grafo, así que toda divergencia visual se acumula hasta el final — once tareas en este
   caso. El diff de inventario del punto 3 es la versión barata que sí puede correr en cada tarea.

**Estado:** Proposed · Severidad: **Crítica** · Origen: HITL 2026-09-06 (revisión en navegador del usuario)
