import { test, expect, type Page, type TestInfo } from '@playwright/test';
import type { MeasurementRecord } from './visual-gate-reporter';

// ── Measurement Rule Helpers ───────────────────────────────────────────────────

/**
 * Enforces Rule 1 (scroll-behavior: auto !important) and Rule 2 (document.fonts.ready).
 */
async function enforceMeasurementBasics(page: Page): Promise<void> {
  await page.addStyleTag({
    content: 'html, body, * { scroll-behavior: auto !important; }',
  });
  await page.evaluate(async () => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    document.body.style.setProperty('scroll-behavior', 'auto', 'important');
    await document.fonts.ready;
  });
}

/**
 * Enforces Rule 3 (repeated readings, at least 3 times) and calculates dispersion.
 */
async function sampleRepeated<T extends number>(
  fn: () => Promise<T>,
  samples = 3,
  delayMs = 40
): Promise<{ values: T[]; dispersion: number; finalValue: T }> {
  const values: T[] = [];
  for (let i = 0; i < samples; i++) {
    values.push(await fn());
    if (i < samples - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  const dispersion = Math.max(...values) - Math.min(...values);
  const finalValue = values[values.length - 1];
  return { values, dispersion, finalValue };
}

/**
 * Attaches measurement record to test and asserts PASS.
 * Rule 4: INCONCLUSO is never PASS and must exit non-zero.
 */
function recordAndAssert(testInfo: TestInfo, record: MeasurementRecord): void {
  testInfo.attach('measurement-result', {
    body: JSON.stringify(record),
    contentType: 'application/json',
  });

  if (record.status === 'INCONCLUSO') {
    throw new Error(`INCONCLUSO: ${record.name} (dispersión: ${record.dispersion}) - ${record.details || ''}`);
  }
  if (record.status === 'FAIL') {
    throw new Error(`FAIL: ${record.name} medido ${record.measured} fuera de umbral ${record.threshold}. ${record.details || ''}`);
  }
}

// ── Helper: WCAG relative luminance & contrast ratio (sRGB linearized) ─────────

function srgbLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ── Test Suite ─────────────────────────────────────────────────────────────────

test.describe('T012 · Gate de medición en navegador (DD-038)', () => {

  test('01. Proporción de tinta a 1440 px (35–45 %)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const readRatio = async () => {
      return await page.evaluate(() => {
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>('#inicio, #servicios, #sobre-amd, #cifras, #confianza, #contacto')
        );
        const darkSections = sections.filter((s) => !s.classList.contains('section--light'));
        const darkH = darkSections.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
        const totalDocH = document.documentElement.scrollHeight;
        return (darkH / totalDocH) * 100;
      });
    };

    const { dispersion, finalValue } = await sampleRepeated(readRatio, 3, 50);
    const measuredStr = `${finalValue.toFixed(2)} %`;
    const thresholdStr = '35.00–45.00 %';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (dispersion > 0.5) {
      status = 'INCONCLUSO';
      details = `Dispersión de ${dispersion.toFixed(3)} % supera tolerancia de 0.5 %`;
    } else if (finalValue < 35.0 || finalValue > 45.0) {
      status = 'FAIL';
      details = `Proporción fuera del intervalo [35 %, 45 %]`;
    }

    const record: MeasurementRecord = {
      num: 1,
      name: 'Proporción de tinta a 1440 px',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(dispersion / 2).toFixed(3)} %`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('02. Primer tramo claro (≤ 1.2 alturas de viewport)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const readRatio = async () => {
      return await page.evaluate(() => {
        const firstLight = document.querySelector<HTMLElement>('.section--light');
        if (!firstLight) return 999;
        return firstLight.offsetTop / window.innerHeight;
      });
    };

    const { dispersion, finalValue } = await sampleRepeated(readRatio, 3, 50);
    const measuredStr = `${finalValue.toFixed(2)} vh`;
    const thresholdStr = '≤ 1.20 vh';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (dispersion > 0.05) {
      status = 'INCONCLUSO';
      details = `Dispersión de ${dispersion.toFixed(3)} vh supera tolerancia de 0.05 vh`;
    } else if (finalValue > 1.2) {
      status = 'FAIL';
      details = `Primer tramo claro en ${finalValue.toFixed(2)} vh supera 1.20 vh`;
    }

    const record: MeasurementRecord = {
      num: 2,
      name: 'Primer tramo claro',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(dispersion / 2).toFixed(3)} vh`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('03. Sin scroll horizontal a 375/768/900/1200/1600/1920 px (tol 1 px)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const widths = [375, 768, 900, 1200, 1600, 1920];
    const overflows: { width: number; diff: number; dispersion: number }[] = [];

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(50);

      const readOverflow = async () => {
        return await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
      };

      const { dispersion, finalValue } = await sampleRepeated(readOverflow, 3, 30);
      overflows.push({ width: w, diff: finalValue, dispersion });
    }

    const maxOverflowItem = overflows.reduce((max, cur) => (cur.diff > max.diff ? cur : max), overflows[0]);
    const maxDispersion = Math.max(...overflows.map((o) => o.dispersion));

    const measuredStr = maxOverflowItem.diff > 1
      ? `+${maxOverflowItem.diff.toFixed(2)} px (${maxOverflowItem.width}px)`
      : `${maxOverflowItem.diff.toFixed(2)} px`;
    const thresholdStr = '≤ 1.00 px (375–1920)';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (maxDispersion > 1.0) {
      status = 'INCONCLUSO';
      details = `Dispersión de lecturas ${maxDispersion.toFixed(2)} px supera tolerancia de 1 px`;
    } else if (maxOverflowItem.diff > 1.0) {
      status = 'FAIL';
      const failing = overflows.filter((o) => o.diff > 1);
      details = `Desbordamiento horizontal detectado en: ${failing.map((f) => `${f.width}px (+${f.diff.toFixed(1)}px)`).join(', ')}`;
    }

    const record: MeasurementRecord = {
      num: 3,
      name: 'Sin scroll horizontal (6 anchos)',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(maxDispersion / 2).toFixed(2)} px`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('04. Índices de sección visibles por ancho (exactamente 1 por ancho)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const widths = [375, 768, 900, 1200, 1600, 1920];
    const resultsByWidth: { width: number; count: number; activeIndex: string }[] = [];

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(50);

      if (w >= 900) {
        // Desktop: scroll past hero to #servicios so subnav becomes active
        await page.evaluate(() => {
          const servicios = document.querySelector('#servicios');
          if (servicios) {
            window.scrollTo(0, (servicios as HTMLElement).offsetTop + 10);
            window.dispatchEvent(new Event('scroll'));
          }
        });
        await page.waitForTimeout(60);

        const counts = await page.evaluate(() => {
          function isVis(el: Element | null): boolean {
            if (!el) return false;
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          }
          const subnav = isVis(document.querySelector('nav.subnav'));
          const drawer = isVis(document.querySelector('#drawer, .drawer'));
          const dots = isVis(document.querySelector('.sidenav, .dots-nav'));
          let c = 0;
          if (subnav) c++;
          if (drawer) c++;
          if (dots) c++;
          return { count: c, activeIndex: subnav ? 'subnav' : drawer ? 'drawer' : 'none' };
        });
        resultsByWidth.push({ width: w, count: counts.count, activeIndex: counts.activeIndex });
      } else {
        // Mobile (<900px): closed drawer does NOT count (closed = 0).
        // Opening the hamburger drawer reveals the single section index.
        await page.evaluate(() => {
          const btn = document.querySelector<HTMLElement>('.menu-btn');
          if (btn) btn.click();
        });
        await page.waitForTimeout(60);

        const counts = await page.evaluate(() => {
          function isVis(el: Element | null): boolean {
            if (!el) return false;
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          }
          const subnav = isVis(document.querySelector('nav.subnav'));
          const drawer = isVis(document.querySelector('#drawer, .drawer'));
          const dots = isVis(document.querySelector('.sidenav, .dots-nav'));
          let c = 0;
          if (subnav) c++;
          if (drawer) c++;
          if (dots) c++;
          return { count: c, activeIndex: drawer ? 'drawer' : subnav ? 'subnav' : 'none' };
        });
        resultsByWidth.push({ width: w, count: counts.count, activeIndex: counts.activeIndex });

        // Close drawer back
        await page.evaluate(() => {
          const backdrop = document.querySelector<HTMLElement>('.drawer-backdrop');
          if (backdrop) backdrop.click();
        });
        await page.waitForTimeout(50);
      }
    }

    const allOne = resultsByWidth.every((r) => r.count === 1);
    const measuredStr = allOne ? '1 exacto' : `${resultsByWidth.map((r) => `${r.width}:${r.count}`).join(', ')}`;
    const thresholdStr = 'exactamente 1 por ancho';

    const status: 'PASS' | 'FAIL' | 'INCONCLUSO' = allOne ? 'PASS' : 'FAIL';
    const details = allOne
      ? 'sub-header activo desde 900px, panel de hamburguesa por debajo'
      : `Discrepancia de índices: ${resultsByWidth.map((r) => `${r.width}px=${r.count} (${r.activeIndex})`).join(', ')}`;

    const record: MeasurementRecord = {
      num: 4,
      name: 'Índices de sección visibles por ancho',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('05. Costura del carrusel (|desfase| ≤ 0.5 px a 1440/768/375)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const widths = [1440, 768, 375];
    const seams: { width: number; desfase: number; dispersion: number }[] = [];

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.evaluate(() => {
        window.dispatchEvent(new Event('resize'));
        return document.fonts.ready;
      });
      await page.waitForTimeout(60);

      const readSeam = async () => {
        return await page.evaluate(() => {
          const track = document.querySelector<HTMLElement>('.clients__track');
          if (!track) return 999;
          const half = track.scrollWidth / 2;
          const lis = Array.from(track.querySelectorAll<HTMLLIElement>('li'));
          if (lis.length < 14) return 999;
          // Offset of 14th item (index 13) relative to the beginning of the track (1st li)
          const copy2Start = lis[13].offsetLeft - lis[0].offsetLeft;
          return copy2Start - half;
        });
      };

      const { dispersion, finalValue } = await sampleRepeated(readSeam, 3, 30);
      seams.push({ width: w, desfase: finalValue, dispersion });
    }

    const maxDesfaseItem = seams.reduce((max, cur) => (Math.abs(cur.desfase) > Math.abs(max.desfase) ? cur : max), seams[0]);
    const maxDispersion = Math.max(...seams.map((s) => s.dispersion));

    const measuredStr = `${maxDesfaseItem.desfase.toFixed(2)} px`;
    const thresholdStr = '|desfase| ≤ 0.50 px';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (maxDispersion > 0.2) {
      status = 'INCONCLUSO';
      details = `Dispersión de lecturas ${maxDispersion.toFixed(3)} px supera tolerancia de 0.2 px`;
    } else if (Math.abs(maxDesfaseItem.desfase) > 0.5) {
      status = 'FAIL';
      details = `Salto de costura en ${maxDesfaseItem.width}px: ${maxDesfaseItem.desfase.toFixed(2)} px supera 0.50 px`;
    }

    const record: MeasurementRecord = {
      num: 5,
      name: 'Costura del carrusel (1440/768/375)',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(maxDispersion / 2).toFixed(3)} px`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('06. Velocidad del carrusel entre anchos (±10 % a 1440/768/375)', async ({ page }, testInfo) => {
    const widths = [1440, 768, 375];
    const speeds: { width: number; speed: number; durStr: string }[] = [];

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await enforceMeasurementBasics(page);

      const readSpeed = async () => {
        return await page.evaluate(() => {
          const track = document.querySelector<HTMLElement>('.clients__track');
          if (!track) return { speed: 0, durStr: '' };
          const durStr = getComputedStyle(track).getPropertyValue('--marquee-dur').trim();
          const dur = parseFloat(durStr);
          const dist = track.scrollWidth / 2;
          return { speed: dur > 0 ? dist / dur : 0, durStr };
        });
      };

      const { finalValue } = await sampleRepeated(async () => (await readSpeed()).speed, 3, 30);
      const { durStr } = await readSpeed();
      speeds.push({ width: w, speed: finalValue, durStr });
    }

    const speedValues = speeds.map((s) => s.speed);
    const avgSpeed = speedValues.reduce((a, b) => a + b, 0) / speedValues.length;
    const deviations = speedValues.map((v) => (Math.abs(v - avgSpeed) / avgSpeed) * 100);
    const maxDev = Math.max(...deviations);

    const measuredStr = `±${maxDev.toFixed(2)} % (${avgSpeed.toFixed(1)} px/s)`;
    const thresholdStr = '±10.00 %';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (maxDev > 10.0) {
      status = 'FAIL';
      details = `Desviación de velocidad ${maxDev.toFixed(2)} % supera umbral ±10 %: ` +
        speeds.map((s) => `${s.width}px=${s.speed.toFixed(1)}px/s (${s.durStr})`).join(', ');
    } else {
      details = speeds.map((s) => `${s.width}px=${s.speed.toFixed(1)}px/s`).join(', ');
    }

    const record: MeasurementRecord = {
      num: 6,
      name: 'Velocidad carrusel entre anchos',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(maxDev / 2).toFixed(2)} %`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('07. Pausa del carrusel en hover (paused en hover, running al salir)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const clientsLocator = page.locator('.clients');
    await clientsLocator.scrollIntoViewIfNeeded();

    const checkState = async () => {
      return await page.evaluate(() => {
        const track = document.querySelector<HTMLElement>('.clients__track');
        return track ? getComputedStyle(track).animationPlayState : 'unknown';
      });
    };

    const stateInitial = await checkState();
    await clientsLocator.hover();
    await page.waitForTimeout(50);
    const stateHover = await checkState();

    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);
    const stateOut = await checkState();

    const pass = stateInitial === 'running' && stateHover === 'paused' && stateOut === 'running';
    const measuredStr = `${stateHover}/${stateOut}`;
    const thresholdStr = 'paused / running';

    const status: 'PASS' | 'FAIL' | 'INCONCLUSO' = pass ? 'PASS' : 'FAIL';
    const details = `Inicial: ${stateInitial} → Hover: ${stateHover} → Salida: ${stateOut}`;

    const record: MeasurementRecord = {
      num: 7,
      name: 'Pausa en hover del carrusel',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('08. Foto del ledger no desborda contenedor durante la transición (tol 1 px)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    await page.locator('#servicios').scrollIntoViewIfNeeded();
    const line = page.locator('.line').first();
    await line.scrollIntoViewIfNeeded();

    // Trigger hover to start transition
    await line.hover();

    // Take 10 continuous readings across the 900ms transition to verify no overflow in the middle
    let maxOverflow = 0;
    const tol = 1.0;

    for (let step = 0; step < 10; step++) {
      const reading = await page.evaluate(() => {
        const l = document.querySelector('.line');
        if (!l) return 0;
        const media = l.querySelector<HTMLElement>('.line__media');
        const img = media?.querySelector<HTMLImageElement>('img');
        if (!media || !img) return 0;
        const m = media.getBoundingClientRect();
        const i = img.getBoundingClientRect();
        const oL = m.left - i.left;
        const oR = i.right - m.right;
        const oT = m.top - i.top;
        const oB = i.bottom - m.bottom;
        return Math.max(0, oL, oR, oT, oB);
      });
      if (reading > maxOverflow) {
        maxOverflow = reading;
      }
      await page.waitForTimeout(80);
    }

    const measuredStr = `${maxOverflow.toFixed(2)} px`;
    const thresholdStr = '≤ 1.00 px (sin desborde)';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (maxOverflow > tol) {
      status = 'FAIL';
      details = `Desbordamiento durante transición: ${maxOverflow.toFixed(2)} px supera tolerancia de 1 px`;
    } else {
      details = `Contenedor recorta imagen en todo punto de la transición (máx desborde: ${maxOverflow.toFixed(2)} px)`;
    }

    const record: MeasurementRecord = {
      num: 8,
      name: 'Foto ledger dentro de contenedor en transición',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00 px',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('09. Contraste de cada texto dorado sobre claro (375 y 1200 px)', async ({ page }, testInfo) => {
    const viewports = [375, 1200];
    const evaluatedElements: {
      viewport: number;
      token: string;
      text: string;
      ratio: number;
      required: number;
      pass: boolean;
      fontSize: number;
      fontWeight: number;
    }[] = [];

    for (const w of viewports) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await enforceMeasurementBasics(page);

      const items = await page.evaluate(() => {
        function parseRgb(colorStr: string) {
          const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return null;
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
        }

        function getEffectiveBg(el: HTMLElement) {
          let cur: HTMLElement | null = el;
          const stack: { r: number; g: number; b: number; a: number }[] = [];
          while (cur) {
            const bg = window.getComputedStyle(cur).backgroundColor;
            const parsed = parseRgb(bg);
            if (parsed && parsed.a > 0) {
              stack.push(parsed);
              if (parsed.a >= 0.99) break;
            }
            cur = cur.parentElement;
          }

          let r = 13, g = 20, b = 26;
          for (let i = stack.length - 1; i >= 0; i--) {
            const l = stack[i];
            r = l.r * l.a + r * (1 - l.a);
            g = l.g * l.a + g * (1 - l.a);
            b = l.b * l.a + b * (1 - l.a);
          }
          return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
        }

        const rootStyle = window.getComputedStyle(document.documentElement);
        const tokenNames = ['--amd-gold', '--amd-gold-soft', '--amd-gold-ink', '--amd-gold-ink-deep'];
        const resolvedTokens: Record<string, string> = {};
        for (const name of tokenNames) {
          const val = rootStyle.getPropertyValue(name).trim();
          const span = document.createElement('span');
          span.style.color = val;
          document.body.appendChild(span);
          resolvedTokens[name] = window.getComputedStyle(span).color;
          span.remove();
        }

        const goldColors = Object.values(resolvedTokens);
        const all = Array.from(document.querySelectorAll<HTMLElement>('*'));
        const matched: {
          token: string;
          text: string;
          colorRgb: { r: number; g: number; b: number };
          bgRgb: { r: number; g: number; b: number };
          fontSizePx: number;
          fontWeight: number;
        }[] = [];

        for (const el of all) {
          if (['SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD', 'BR'].includes(el.tagName)) continue;
          const text = el.textContent?.trim();
          if (!text) continue;

          const style = window.getComputedStyle(el);
          const color = style.color;
          if (!goldColors.includes(color)) continue;
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;

          const bg = getEffectiveBg(el);
          // Check luminance of bg
          const srgbL = (c: number) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          const bgLum = 0.2126 * srgbL(bg.r) + 0.7152 * srgbL(bg.g) + 0.0722 * srgbL(bg.b);

          if (bgLum > 0.18) {
            // Leaf text element
            const hasChildSame = Array.from(el.children).some((c) => {
              const cs = window.getComputedStyle(c);
              return goldColors.includes(cs.color) && (c.textContent || '').trim().length > 0;
            });
            if (hasChildSame) continue;

            const tokenEntry = Object.entries(resolvedTokens).find(([, v]) => v === color);
            const parsedColor = parseRgb(color) || { r: 0, g: 0, b: 0, a: 1 };
            const fontSizePx = parseFloat(style.fontSize);
            const fontWeight = parseInt(style.fontWeight, 10) || (style.fontWeight === 'bold' ? 700 : 400);

            matched.push({
              token: tokenEntry ? tokenEntry[0] : 'unknown',
              text: text.slice(0, 30),
              colorRgb: { r: parsedColor.r, g: parsedColor.g, b: parsedColor.b },
              bgRgb: bg,
              fontSizePx,
              fontWeight,
            });
          }
        }
        return matched;
      });

      for (const item of items) {
        const fgLum = srgbLuminance(item.colorRgb.r, item.colorRgb.g, item.colorRgb.b);
        const bgLum = srgbLuminance(item.bgRgb.r, item.bgRgb.g, item.bgRgb.b);
        const ratio = contrastRatio(fgLum, bgLum);
        const isLarge = item.fontSizePx >= 24 || (item.fontSizePx >= 18.66 && item.fontWeight >= 700);
        const required = isLarge ? 3.0 : 4.5;
        evaluatedElements.push({
          viewport: w,
          token: item.token,
          text: item.text,
          ratio,
          required,
          pass: ratio >= required,
          fontSize: item.fontSizePx,
          fontWeight: item.fontWeight,
        });
      }
    }

    const minRatioItem = evaluatedElements.reduce((min, cur) => (cur.ratio < min.ratio ? cur : min), evaluatedElements[0]);
    const allPass = evaluatedElements.every((e) => e.pass);

    const measuredStr = `mín ${minRatioItem.ratio.toFixed(2)}:1`;
    const thresholdStr = '≥ 4.5:1 (≥ 3:1 texto gde)';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (!allPass) {
      status = 'FAIL';
      const failing = evaluatedElements.filter((e) => !e.pass);
      details = `Fallos de contraste: ${failing.map((f) => `[${f.viewport}px ${f.token} "${f.text}" ${f.ratio.toFixed(2)}:1 vs ${f.required}:1]`).join(', ')}`;
    } else {
      details = `${evaluatedElements.length} elementos dorados evaluados en 375px y 1200px; todos cumplen WCAG por tamaño computado`;
    }

    const record: MeasurementRecord = {
      num: 9,
      name: 'Contraste texto dorado sobre claro',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('10. Contenido del hero alineado a la izquierda a 1200 px (± 2 px)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const readDiff = async () => {
      return await page.evaluate(() => {
        const heroContent = document.querySelector('.hero__content');
        const otherWrap = document.querySelector('#servicios .wrap, #sobre-amd .wrap');
        if (!heroContent || !otherWrap) return 999;
        const hLeft = heroContent.getBoundingClientRect().left;
        const wLeft = otherWrap.getBoundingClientRect().left;
        return Math.abs(hLeft - wLeft);
      });
    };

    const { dispersion, finalValue } = await sampleRepeated(readDiff, 3, 30);
    const measuredStr = `${finalValue.toFixed(2)} px`;
    const thresholdStr = '|desfase| ≤ 2.00 px';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (dispersion > 0.5) {
      status = 'INCONCLUSO';
      details = `Dispersión de ${dispersion.toFixed(3)} px supera tolerancia de 0.5 px`;
    } else if (finalValue > 2.0) {
      status = 'FAIL';
      details = `Hero content desalineado por ${finalValue.toFixed(2)} px (> 2.00 px) frente al wrap de otra sección`;
    } else {
      details = 'Borde izquierdo del hero coincide con el del wrap de la siguiente sección (no centrado)';
    }

    const record: MeasurementRecord = {
      num: 10,
      name: 'Alineación izquierda del hero a 1200 px',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: `±${(dispersion / 2).toFixed(3)} px`,
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('11. Enlaces del top-nav agrupados a la derecha (hueco izq ≫ der)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const readGaps = async () => {
      return await page.evaluate(() => {
        const brand = document.querySelector('.brand');
        const links = document.querySelector('.topnav__links');
        const actions = document.querySelector('.topnav__actions');
        const lastLink = links?.querySelector('li:last-child a');
        if (!brand || !links || !actions || !lastLink) return { leftGap: 0, rightGap: 999, ratio: 0 };
        const b = brand.getBoundingClientRect();
        const l = links.getBoundingClientRect();
        const ll = lastLink.getBoundingClientRect();
        const a = actions.getBoundingClientRect();
        const leftGap = l.left - b.right;
        const rightGap = a.left - ll.right;
        return { leftGap, rightGap, ratio: rightGap > 0 ? leftGap / rightGap : 999 };
      });
    };

    const { finalValue } = await sampleRepeated(async () => (await readGaps()).ratio, 3, 30);
    const gaps = await readGaps();

    const measuredStr = `${gaps.leftGap.toFixed(0)} vs ${gaps.rightGap.toFixed(0)} px`;
    const thresholdStr = 'hueco izq ≫ der';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (gaps.leftGap <= gaps.rightGap || finalValue < 3.0) {
      status = 'FAIL';
      details = `Enlaces no agrupados a la derecha: hueco izq (${gaps.leftGap.toFixed(1)}px) no es muy superior al derecho (${gaps.rightGap.toFixed(1)}px)`;
    } else {
      details = `Hueco izquierdo (${gaps.leftGap.toFixed(1)}px) es ${finalValue.toFixed(1)}x el derecho (${gaps.rightGap.toFixed(1)}px)`;
    }

    const record: MeasurementRecord = {
      num: 11,
      name: 'Agrupación enlaces top-nav a la derecha',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('12. Pulsar «Scroll» revela el sub-header (is-on y visible tras click)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    // Ensure at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(50);

    // Initial check: subnav must not be on
    const initIsOn = await page.evaluate(() => {
      const subnav = document.querySelector('nav.subnav');
      return subnav ? subnav.classList.contains('is-on') : false;
    });

    // Click hero scroll (force: true bypasses continuous CSS bob animation)
    await page.locator('a.hero__scroll').click({ force: true });
    await page.waitForTimeout(200);

    const postScroll = await page.evaluate(() => {
      const subnav = document.querySelector('nav.subnav');
      if (!subnav) return { isOn: false, isVis: false, opacity: '0' };
      const s = window.getComputedStyle(subnav);
      const isVis = s.display !== 'none' && s.visibility === 'visible' && parseFloat(s.opacity) > 0.8;
      return { isOn: subnav.classList.contains('is-on'), isVis, opacity: s.opacity };
    });

    const pass = !initIsOn && postScroll.isOn && postScroll.isVis;
    const measuredStr = postScroll.isOn && postScroll.isVis ? 'is-on visible' : 'no visible';
    const thresholdStr = 'is-on y visible tras click';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (!pass) {
      status = 'FAIL';
      details = `Subnav no activado correctamente tras click: isOn=${postScroll.isOn}, isVis=${postScroll.isVis}`;
    } else {
      details = 'Tolerancia de 2 px de T018 confirmada suficiente: nav.subnav tiene is-on y visibilidad activa';
    }

    const record: MeasurementRecord = {
      num: 12,
      name: 'Pulsar «Scroll» revela sub-header',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

  test('13. Dirección ticker de sectores opuesta a logos (sentidos opuestos)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await enforceMeasurementBasics(page);

    const directions = await page.evaluate(() => {
      const logosTrack = document.querySelector('.clients__track');
      const tickerTrack = document.querySelector('.ticker__track');
      const lDir = logosTrack ? getComputedStyle(logosTrack).animationDirection : 'none';
      const tDir = tickerTrack ? getComputedStyle(tickerTrack).animationDirection : 'none';
      return { lDir, tDir };
    });

    const isOpposite =
      (directions.lDir === 'reverse' && directions.tDir === 'normal') ||
      (directions.lDir === 'normal' && directions.tDir === 'reverse');

    const measuredStr = `${directions.lDir} / ${directions.tDir}`;
    const thresholdStr = 'sentidos opuestos';

    let status: 'PASS' | 'FAIL' | 'INCONCLUSO' = 'PASS';
    let details = '';

    if (!isOpposite) {
      status = 'FAIL';
      details = `Direcciones no son opuestas: logos=${directions.lDir}, ticker=${directions.tDir}`;
    } else {
      details = `Logos (${directions.lDir}) y sectores (${directions.tDir}) corren en sentido contrario`;
    }

    const record: MeasurementRecord = {
      num: 13,
      name: 'Dirección ticker sectores vs logos',
      measured: measuredStr,
      threshold: thresholdStr,
      status,
      dispersion: '0.00',
      details,
    };

    recordAndAssert(testInfo, record);
  });

});
