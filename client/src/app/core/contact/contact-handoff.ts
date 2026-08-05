import type { ContactIntent } from './contact-intent.model';

/**
 * Partial shape accepted by the WhatsApp builder. Unlike the mailto builder
 * (only ever called on a validated submit), the "Abrir WhatsApp" action can
 * fire before every field is filled — locale is the only field always known.
 */
export type WhatsAppContext = Partial<Omit<ContactIntent, 'locale'>> & Pick<ContactIntent, 'locale'>;

/**
 * Mirrors mockup `landing.js buildWaUrl`: the localized prefill always
 * leads, followed only by the fields actually filled in — never empty
 * "Nombre: " / "Correo: " lines for a partially-completed form.
 */
export function buildWhatsAppMessage(context: WhatsAppContext, prefill: string): string {
  const lines = [
    prefill,
    context.fullName ? `Nombre: ${context.fullName}` : undefined,
    context.email ? `Correo: ${context.email}` : undefined,
    context.serviceInterest ? `Servicio: ${context.serviceInterest}` : undefined,
    context.message ? `Mensaje: ${context.message}` : undefined,
    `Idioma: ${context.locale}`,
  ];
  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

/** Builds the `wa.me` deep link — used by both the full-form submit and the standalone WA button. */
export function buildWhatsAppUrl(context: WhatsAppContext, number: string, prefill: string): string {
  const text = buildWhatsAppMessage(context, prefill);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Mailto fallback (REQ-008) — always buildable, even from an empty/partial form, so it stays a visible escape hatch. */
export function buildMailtoUrl(context: WhatsAppContext, inbox: string): string {
  const subject = encodeURIComponent(
    context.fullName ? `Consulta de ${context.fullName}` : 'Consulta — AMD Soluciones',
  );
  const bodyLines = [
    context.fullName ? `Nombre: ${context.fullName}` : undefined,
    context.email ? `Correo: ${context.email}` : undefined,
    context.serviceInterest ? `Servicio: ${context.serviceInterest}` : undefined,
    context.message ? `Mensaje: ${context.message}` : undefined,
    `Idioma: ${context.locale}`,
  ].filter((line): line is string => Boolean(line));
  const body = encodeURIComponent(bodyLines.join('\n'));
  return `mailto:${inbox}?subject=${subject}&body=${body}`;
}

/**
 * Opens the handoff URL in a new tab (REQ-008). A blocked popup makes
 * `window.open` return `null` instead of throwing — that is not treated as
 * an error here: the caller's visible meta/mailto fallback is the intended
 * recovery path, so this function never throws or logs (graceful
 * degradation, not a hard failure of the page).
 */
export function openHandoff(url: string): Window | null {
  return window.open(url, '_blank', 'noopener,noreferrer');
}
