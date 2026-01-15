import { useStore, useSignal, useVisibleTask$, type QRL, type Signal } from "@builder.io/qwik";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  loadMore$: QRL<() => void>;
}

interface UseInfiniteScrollReturn {
  ref: Signal<HTMLElement | undefined>;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const { threshold = 0, rootMargin = '100px', loadMore$ } = options;
  const ref = useSignal<HTMLElement>();

  const state = useStore({
    observer: null as IntersectionObserver | null,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const element = track(() => ref.value);

    // No need for isBrowser check inside useVisibleTask as it only runs in browser
    if (element) {
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
  };
};