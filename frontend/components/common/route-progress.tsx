"use client";
import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A slim top-of-viewport progress bar that shows immediately when the
 * user clicks an internal link and hides once the destination route has
 * actually finished rendering — the "feels like Vercel/Linear" nav
 * pattern referenced in the requirements.
 *
 * How it works, since the App Router doesn't expose navigation
 * start/end events directly:
 * - A single click listener on `document` detects clicks on internal
 *   <a> tags (which is what next/link renders) and starts the bar.
 * - `usePathname`/`useSearchParams` change only once the destination
 *   route has actually committed, so that effect finishes the bar.
 * - Because state is a single boolean + width, clicking a second link
 *   before the first navigation lands simply restarts the animation —
 *   there's never more than one bar, so "cancel previous, show new"
 *   falls out naturally rather than needing extra bookkeeping.
 *
 * Note: this covers link-driven navigation (the common case, and the
 * one in the spec's example). Purely programmatic `router.push()` calls
 * with no originating click aren't detected by this listener.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const isFirstRender = React.useRef(true);

  const start = React.useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setVisible(true);
    setWidth(12);

    const step = () => {
      setWidth((w) => (w < 88 ? w + (88 - w) * 0.06 : w));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const finish = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setWidth(100);
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 200);
  }, []);

  // The destination route has committed once pathname/searchParams
  // reflect it — that's our signal to finish and hide the bar.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let destination: URL;
      try {
        destination = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin !== window.location.origin) return;

      const destinationKey = `${destination.pathname}${destination.search}`;
      const currentKey = `${window.location.pathname}${window.location.search}`;
      if (destinationKey === currentKey) return;

      start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [start]);

  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${width}%`, boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
      />
    </div>
  );
}
