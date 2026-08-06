import { buildMailtoUrl, buildWhatsAppUrl, openHandoff } from './contact-handoff';

const FULL_CONTEXT = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  message: 'Necesito asesoría contable',
  serviceInterest: 'contabilidad' as const,
  locale: 'es' as const,
};

describe('buildWhatsAppUrl', () => {
  it('includes the number and encoded context (name/email/message/service/locale) on a full submit', () => {
    const url = buildWhatsAppUrl(FULL_CONTEXT, '573248805290', 'Hola AMD');

    expect(url).toContain('https://wa.me/573248805290?text=');
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).toContain('Hola AMD');
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('ana@example.com');
    expect(text).toContain('contabilidad');
    expect(text).toContain('Necesito asesoría contable');
    expect(text).toContain('es');
  });

  it('falls back to only the localized prefill + locale when the form is empty (Abrir WhatsApp before typing)', () => {
    const url = buildWhatsAppUrl({ locale: 'en' }, '573248805290', 'Hi AMD');
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).toBe('Hi AMD\nIdioma: en');
  });

  it('never emits an empty "Nombre: " / "Correo: " line for fields that are not filled', () => {
    const url = buildWhatsAppUrl({ fullName: 'Ana', locale: 'es' }, '573248805290', 'Hola');
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).not.toContain('Correo:');
    expect(text).not.toContain('Mensaje:');
    expect(text).toContain('Nombre: Ana');
  });
});

describe('buildMailtoUrl', () => {
  it('includes the inbox and the full body context (name/email/service/message/locale)', () => {
    const url = buildMailtoUrl(FULL_CONTEXT, 'contacto@amdsoluciones.com');

    expect(url).toContain('mailto:contacto@amdsoluciones.com?subject=');
    const [, query] = url.split('?');
    const params = new URLSearchParams(query);
    const body = params.get('body') ?? '';
    expect(body).toContain('Ana Pérez');
    expect(body).toContain('ana@example.com');
    expect(body).toContain('contabilidad');
    expect(body).toContain('Necesito asesoría contable');
    expect(body).toContain('es');
  });

  it('uses a generic subject when no name is available yet', () => {
    const url = buildMailtoUrl({ locale: 'es' }, 'contacto@amdsoluciones.com');
    expect(decodeURIComponent(url)).toContain('subject=Consulta — AMD Soluciones');
  });
});

describe('openHandoff', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the URL in a new, unreferenced tab', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    openHandoff('https://wa.me/573248805290');
    expect(spy).toHaveBeenCalledWith('https://wa.me/573248805290', '_blank', 'noopener,noreferrer');
  });

  it('does not throw when the popup is blocked (window.open returns null)', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    expect(() => openHandoff('https://wa.me/573248805290')).not.toThrow();
  });
});
