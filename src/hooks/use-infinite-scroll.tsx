import { useStore, useSignal, useVisibleTask$, type QRL, type Signal } from "@builder.io/qwik";

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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const element = ref.value;
    if (!element || typeof window === 'undefined') return;

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
  });

  return {
    ref,
    isLoading,
  };
};