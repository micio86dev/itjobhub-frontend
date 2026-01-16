import { component$, $ } from "@builder.io/qwik";

export const ScrollButtons = component$(() => {
  const scrollToTop = $(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const scrollToBottom = $(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  return (
    <div class="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
      <button
        onClick$={scrollToTop}
        class="p-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform focus:outline-none"
        title="Scroll to Top"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      <button
        onClick$={scrollToBottom}
        class="p-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform focus:outline-none"
        title="Scroll to Bottom"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  );
});
