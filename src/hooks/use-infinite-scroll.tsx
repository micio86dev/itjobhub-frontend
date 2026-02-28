import { useSignal, useTask$, isBrowser } from "@builder.io/qwik";
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

  useTask$(({ cleanup }) => {
    if (!isBrowser) return;

    const element = ref.value;
    if (!element) return;

    // IntersectionObserver for detecting when element enters viewport
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
