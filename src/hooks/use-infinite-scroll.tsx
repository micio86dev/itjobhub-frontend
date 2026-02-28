import { useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { QRL, Signal } from "@builder.io/qwik";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  loadMore$: QRL<() => void>;
}

interface UseInfiniteScrollReturn {
  ref: Signal<HTMLElement | undefined>;
}

export const useInfiniteScroll = (
  options: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn => {
  const { threshold = 0, rootMargin = "100px", loadMore$ } = options;
  const ref = useSignal<HTMLElement>();

  useVisibleTask$(({ track, cleanup }) => {
    // Track ref changes to re-observe if it becomes available later
    const element = track(() => ref.value);

    // Only observe once we have an element
    if (!element) return;

    // Create new IntersectionObserver for detecting when element enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore$();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    cleanup(() => {
      observer.disconnect();
    });
  });

  return {
    ref,
  };
};
