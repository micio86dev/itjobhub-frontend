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
  const isLoadingRef = useSignal(false);

  // IntersectionObserver is not serializable and only used in visible task
  useTask$(({ track, cleanup }) => {
    const element = track(() => ref.value);

    if (isBrowser && element) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && !isLoadingRef.value) {
            isLoadingRef.value = true;
            Promise.resolve(loadMore$()).finally(() => {
              // Reset flag after a small delay to prevent rapid multiple calls
              setTimeout(() => {
                isLoadingRef.value = false;
              }, 500);
            });
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
    }
  });

  return {
    ref,
  };
};
