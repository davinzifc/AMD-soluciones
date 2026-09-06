/* Mockup — Servicios redesign v0.1
   Data shape mirrors client/.../services-page.ts `GROUPS` so /akili-specify can
   map it 1:1 onto the Angular component (ids are the SAME anchor contract). */

const VISIBLE = 6; // rows shown before "ver más" (progressive disclosure)

const GROUPS = [
  {
    id: 'contabilidad',
    title: 'Contabilidad',
    lead: 'Portafolio integral para persona natural y jurídica. Contratación individual o en paquetes.',
    subs: [
      ['Estados Financieros', 'Preparación, elaboración y revisión con precisión.'],
      ['Declaraciones', 'Renta, IVA, ReteFuente y demás obligaciones.'],
      ['Revisoría Fiscal / Auditoría', 'Auditorías profesionales de cumplimiento.'],
      ['Facturación electrónica', 'Implementación y documentos soporte.'],
      ['Información exógena', 'Medios magnéticos oportunos y precisos.'],
      ['Asesoría contable / tesorería', 'Orientación en contabilidad, finanzas y tesorería.'],
      ['Sistema contable', 'Optimización y verificación de eficiencia.'],
      ['Inventarios', 'Levantamiento y mantenimiento con metodologías actuales.'],
      ['Costos', 'Análisis y mantenimiento para maximizar rentabilidad.'],
      ['Actualización RUB', 'Registro Único de Beneficiarios vigente.'],
      ['Cámara de Comercio', 'Inscripción y renovación.'],
      ['RUT', 'Creación y actualización eficiente.'],
      ['RUP para ESAL', 'Actualización para entidades sin ánimo de lucro.'],
      ['Proyecciones financieras', 'Planificación del futuro financiero.'],
      ['Certificado de ingresos', 'Para personas naturales, con rapidez.'],
      ['RNT y TRA', 'Registro Nacional de Turismo y alojamiento.'],
    ],
  },
  {
    id: 'administrativa',
    title: 'Gestión Administrativa',
    lead: 'Operación administrativa con cumplimiento normativo para personas naturales y jurídicas.',
    subs: [
      ['Seguridad social', 'Afiliación, revisión y liquidación.'],
      ['Nómina', 'Revisión y liquidación con pagos exactos.'],
      ['Cartera y proveedores', 'Levantamiento y mantenimiento actualizado.'],
      ['Fidelización', 'Seguimiento de clientes y proveedores.'],
    ],
  },
  {
    id: 'riesgo',
    title: 'Sistemas de Riesgo',
    lead: 'Protección reputacional, control interno y cumplimiento en entornos competitivos.',
    note: 'Copy provisional — validar con AMD / brochure.',
    subs: [
      ['Diagnóstico de riesgos', 'Identificación de exposiciones operativas y normativas.'],
      ['Políticas y controles', 'Diseño de controles y documentación de procesos.'],
      ['Monitoreo continuo', 'Seguimiento y mejora de sistemas de riesgo.'],
      ['Cumplimiento normativo', 'Acompañamiento frente a obligaciones sectoriales.'],
    ],
  },
  {
    id: 'asesoria',
    title: 'Asesoría',
    lead: 'Formaliza tu negocio y asegura crecimiento sostenible con orientación experta.',
    subs: [
      ['Asesoría legal', 'Constitución de empresa y beneficios de la formalización.'],
      ['Asesoría financiera', 'Gestión de finanzas y optimización del crecimiento.'],
      ['Planes personalizados', 'Adaptados a la industria del cliente.'],
      ['Soporte post-implementación', 'Acompañamiento continuo después del arranque.'],
    ],
  },
  {
    id: 'marca',
    title: 'Marca',
    lead: 'Identidad y posicionamiento para reforzar la propuesta de valor en el mercado.',
    note: 'Alcance provisional — validar con AMD.',
    subs: [
      ['Identidad visual', 'Lineamientos de marca coherentes con el negocio.'],
      ['Posicionamiento', 'Mensaje y presencia alineados a la oferta.'],
      ['Materiales comerciales', 'Soportes para comunicación con clientes.'],
    ],
  },
];

const ord = (i) => String(i + 1).padStart(2, '0');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Row → contact with the service preselected (fase 1: fragment + query context). */
const contactHref = (groupId, title) =>
  `/#contacto?servicio=${encodeURIComponent(groupId)}&detalle=${encodeURIComponent(title)}`;

function renderRail() {
  return GROUPS.map(
    (g, i) => `<li>
      <a class="rail__link" href="#${g.id}" data-rail="${g.id}"${i === 0 ? ' aria-current="true"' : ''}>
        <span class="rail__num">${ord(i)}</span>
        <span class="rail__label">${esc(g.title)}</span>
        <span class="rail__count">${g.subs.length}</span>
      </a>
    </li>`,
  ).join('');
}

function renderChapters() {
  return GROUPS.map((g, i) => {
    const collapsible = g.subs.length > VISIBLE;
    const hidden = g.subs.length - VISIBLE;
    const rows = g.subs
      .map(
        ([title, desc], n) => `<li class="sub"${collapsible && n >= VISIBLE ? ' data-overflow="true"' : ''}>
          <a class="sub__link" href="${contactHref(g.id, title)}">
            <span class="sub__title">${esc(title)}</span>
            <span class="sub__cue">Consultar &rarr;</span>
            <span class="sub__desc">${esc(desc)}</span>
          </a>
        </li>`,
      )
      .join('');

    return `<article class="chapter" id="${g.id}" tabindex="-1">
      <header class="chapter__head">
        <span class="chapter__ordinal" aria-hidden="true">${ord(i)}</span>
        <div class="chapter__rule"></div>
        <h2>${esc(g.title)}</h2>
        <p class="chapter__lead">${esc(g.lead)}</p>
        ${g.note ? `<p class="chapter__note">${esc(g.note)}</p>` : ''}
      </header>
      <ul class="subs"${collapsible ? ' data-collapsed="true"' : ''}>${rows}</ul>
      ${
        collapsible
          ? `<button class="more" type="button" aria-expanded="false" data-more="${g.id}">
               Ver ${hidden} servicios más
             </button>`
          : ''
      }
      <div class="chapter__cta">
        <a class="btn btn--gold" href="/#contacto?servicio=${g.id}">Cotizar ${esc(g.title)}</a>
        <a class="btn btn--ghost" href="https://wa.me/">WhatsApp</a>
      </div>
    </article>`;
  }).join('');
}

function mount() {
  document.querySelector('[data-slot="rail"]').innerHTML = renderRail();
  document.querySelector('[data-slot="chapters"]').innerHTML = renderChapters();

  const total = GROUPS.reduce((n, g) => n + g.subs.length, 0);
  document.querySelector('[data-slot="total"]').textContent = String(total);

  // Progressive disclosure
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-more]');
    if (!btn) return;
    const list = document.querySelector(`#${btn.dataset.more} .subs`);
    const open = list.dataset.collapsed !== 'true';
    list.dataset.collapsed = open ? 'true' : 'false';
    btn.setAttribute('aria-expanded', String(!open));
    const g = GROUPS.find((x) => x.id === btn.dataset.more);
    btn.textContent = open ? `Ver ${g.subs.length - VISIBLE} servicios más` : 'Ver menos';
  });

  mountSpy();
}

/**
 * Scroll-spy by measured position, not by IntersectionObserver batches.
 *
 * The observer callback only receives entries whose intersection state
 * CHANGED in that tick, so after an anchor jump the batch can contain the
 * next chapter while the one actually at the top never re-fires — the rail
 * then highlights the wrong line. Reading `getBoundingClientRect()` for all
 * chapters on every frame is deterministic and always agrees with what the
 * user sees.
 */
function mountSpy() {
  const chapters = [...document.querySelectorAll('.chapter')];
  const links = new Map([...document.querySelectorAll('[data-rail]')].map((a) => [a.dataset.rail, a]));
  const list = document.querySelector('[data-slot="rail"]');
  let current = null;
  let queued = false;

  function pick() {
    queued = false;
    const line = window.innerHeight * 0.3;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    // Last chapter whose top has crossed the reading line wins; at the very
    // bottom the last chapter always wins (it may be too short to cross it).
    let id = chapters[0]?.id;
    if (atBottom) id = chapters[chapters.length - 1].id;
    else for (const el of chapters) if (el.getBoundingClientRect().top <= line) id = el.id;

    if (!id || id === current) return;
    current = id;
    links.forEach((a, key) => {
      if (key === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    // Only the mobile chip bar scrolls horizontally; on desktop the rail fits.
    if (list.scrollWidth > list.clientWidth + 1) {
      const a = links.get(id);
      list.scrollTo({ left: a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(pick);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('click', (e) => {
    // Expanding a group changes every following chapter's offset.
    if (e.target.closest('[data-more], [data-rail]')) setTimeout(schedule, 0);
  });
  pick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
