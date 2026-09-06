import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { WHATSAPP_NUMBER } from '../../../core/contact/contact.config';
import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
import { type ChapterPosition, resolveActiveChapter } from './active-chapter';
import {
  SERVICE_GROUPS,
  SERVICE_VISIBLE_LIMIT,
  type ServiceGroup,
  type ServiceGroupId,
} from './service-catalog.data';

export {
  SERVICE_GROUP_IDS,
  SERVICE_VISIBLE_LIMIT,
  SERVICE_GROUPS,
  type ServiceGroupId,
  type ServiceGroup,
  type ServiceSub,
} from './service-catalog.data';

/**
 * Servicios deep page (T005 / REQ-001…REQ-007 / design.md §5.3 / DD-017).
 *
 * Connects scroll reading-position tracking to the persistent TOC rail.
 * Listens to scroll/resize outside Angular zone, coalesced into single
 * animation frames (NFR-001), re-entering the zone only when the active
 * chapter id changes. Measured via pure resolveActiveChapter without
 * IntersectionObserver (DD-017).
 */
@Component({
  selector: 'app-services-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './services-page.html',
  styleUrl: './services-page.css',
})
export class ServicesPage {
  private readonly locale = inject(LocaleService);
  private readonly whatsappNumber = inject(WHATSAPP_NUMBER);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly groups = SERVICE_GROUPS;
  protected readonly visibleLimit = SERVICE_VISIBLE_LIMIT;
  protected readonly totalLines = this.groups.length;
  protected readonly totalServices = this.groups.reduce((acc, g) => acc + g.subs.length, 0);

  readonly activeGroup = signal<ServiceGroupId>('contabilidad');
  readonly expanded = signal<ReadonlySet<ServiceGroupId>>(new Set());

  private rafId: number | null = null;
  private scrollCleanup: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      this.initScrollSpy();
    });

    this.destroyRef.onDestroy(() => {
      this.destroyScrollSpy();
    });
  }

  readonly moreLabel = computed(() => {
    const showMoreTemplate = this.locale.translate('svcShowMore');
    const showLessText = this.locale.translate('svcShowLess');
    const expandedSet = this.expanded();

    return (group: ServiceGroup): string => {
      if (expandedSet.has(group.id)) {
        return showLessText;
      }
      const hidden = group.subs.length - SERVICE_VISIBLE_LIMIT;
      return showMoreTemplate.replace('{n}', String(hidden));
    };
  });

  readonly quoteLine = computed(() => {
    const quoteTemplate = this.locale.translate('svcQuoteLine');

    return (group: ServiceGroup): string => {
      const line = this.locale.translate(group.titleKey);
      return quoteTemplate.replace('{line}', line);
    };
  });

  readonly whatsappUrl = computed(
    () => `https://wa.me/${this.whatsappNumber}`,
  );

  toggleGroup(groupId: ServiceGroupId): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });

    // Re-evaluate reading position outside zone as group expansion shifts subsequent chapters
    this.zone.runOutsideAngular(() => {
      this.scheduleUpdate();
    });
  }

  isExpanded(groupId: ServiceGroupId): boolean {
    return this.expanded().has(groupId);
  }

  formatOrdinal(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  initScrollSpy(): void {
    if (this.scrollCleanup || typeof window === 'undefined') {
      return;
    }

    const onScrollOrResize = () => {
      this.scheduleUpdate();
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });
      this.scheduleUpdate();
    });

    this.scrollCleanup = () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }

  scheduleUpdate(): void {
    if (this.rafId !== null || typeof window === 'undefined') {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.checkActiveChapter();
    });
  }

  checkActiveChapter(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const root = this.host.nativeElement;
    const chapterElements = Array.from(root.querySelectorAll<HTMLElement>('article.chapter'));
    // Mandatory guard: if chapter list is empty, exit without calling resolveActiveChapter
    if (chapterElements.length === 0) {
      return;
    }

    const chapterPositions: ChapterPosition<ServiceGroupId>[] = chapterElements.map((el) => ({
      id: el.id as ServiceGroupId,
      top: el.getBoundingClientRect().top,
    }));

    const readingLine = window.innerHeight * 0.3;
    const scrollHeight = document.documentElement?.scrollHeight ?? document.body.scrollHeight;
    const atBottom = window.innerHeight + window.scrollY >= scrollHeight - 2;

    const nextId = resolveActiveChapter(
      [chapterPositions[0], ...chapterPositions.slice(1)],
      readingLine,
      atBottom,
    );

    // Re-enter Angular zone ONLY when the active chapter id changes (NFR-001)
    if (nextId !== this.activeGroup()) {
      this.zone.run(() => {
        this.activeGroup.set(nextId);
      });
    }
  }

  destroyScrollSpy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scrollCleanup?.();
    this.scrollCleanup = null;
  }
}
