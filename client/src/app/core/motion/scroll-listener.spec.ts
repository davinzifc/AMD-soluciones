import { onPassiveScroll } from './scroll-listener';

describe('onPassiveScroll', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invokes the handler once immediately on setup', () => {
    const handler = vi.fn();
    const cleanup = onPassiveScroll(handler);

    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('registers scroll and resize listeners as passive', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const cleanup = onPassiveScroll(vi.fn());

    const scrollCall = addSpy.mock.calls.find(([type]) => type === 'scroll');
    const resizeCall = addSpy.mock.calls.find(([type]) => type === 'resize');

    expect(scrollCall?.[2]).toEqual({ passive: true });
    expect(resizeCall?.[2]).toEqual({ passive: true });
    cleanup();
  });

  it('invokes the handler again on scroll and resize events', () => {
    const handler = vi.fn();
    const cleanup = onPassiveScroll(handler);
    handler.mockClear();

    window.dispatchEvent(new Event('scroll'));
    expect(handler).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('stops invoking the handler after cleanup runs', () => {
    const handler = vi.fn();
    const cleanup = onPassiveScroll(handler);
    handler.mockClear();
    cleanup();

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));

    expect(handler).not.toHaveBeenCalled();
  });
});
