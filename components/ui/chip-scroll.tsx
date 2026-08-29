"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ChipScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [thumb, setThumb] = useState({ top: 0, height: 40 });

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const hasOverflow = scrollHeight > clientHeight + 2;
    setOverflows(hasOverflow);
    if (!hasOverflow) return;
    const height = Math.max((clientHeight / scrollHeight) * clientHeight, 16);
    const maxTop = clientHeight - height;
    const top =
      scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * maxTop;
    setThumb({ top, height });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync, children]);

  const onTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    el.scrollTo({
      top: ratio * (el.scrollHeight - el.clientHeight),
      behavior: "smooth",
    });
  };

  return (
    <div className="flex items-stretch gap-2">
      <div
        ref={scrollerRef}
        className={cn(
          "max-h-20 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-24",
          className,
        )}
      >
        <div className="flex flex-wrap content-start gap-1.5">{children}</div>
      </div>
      <div
        aria-hidden="true"
        onClick={onTrackClick}
        className="relative h-20 w-1.5 shrink-0 cursor-pointer rounded-full bg-slate-200 dark:bg-slate-700 sm:h-24"
      >
        <div
          className="absolute inset-x-0 rounded-full bg-emerald-600 dark:bg-emerald-400"
          style={{
            height: overflows ? thumb.height : "40%",
            transform: `translateY(${overflows ? thumb.top : 0}px)`,
          }}
        />
      </div>
    </div>
  );
}
