import { useStore, useSignal, useTask$, type QRL, type Signal, isBrowser } from "@builder.io/qwik";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasNextPage: boolean;
  isLoading: boolean;
  loadMore$: QRL<() => void>;
}

interface UseInfiniteScrollReturn {
  ref: Signal<HTMLElement | undefined>;
  isLoading: boolean;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const { threshold = 1.0, rootMargin = '100px', hasNextPage, isLoading, loadMore$ } = options;
  const ref = useSignal<HTMLElement>();

  const state = useStore({
    observer: null as IntersectionObserver | null,
  });

  useTask$(({ track, cleanup }) => {
    const element = track(() => ref.value);

    if (isBrowser && element) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasNextPage && !isLoading) {
            loadMore$();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(element);
      state.observer = observer;

      cleanup(() => {
        observer.disconnect();
      });
    }
  });

  return {
    ref,
    isLoading,
  };
};