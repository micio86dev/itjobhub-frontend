import { component$, $, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./scroll-buttons.css?inline";

export const ScrollButtons = component$(() => {
  useStylesScoped$(styles);

  const scrollToTop = $(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const scrollToBottom = $(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  return (
    <div class="scroll-buttons-container">
      <button onClick$={scrollToTop} class="scroll-btn" title="Scroll to Top">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        class="scroll-btn"
        title="Scroll to Bottom"
      >
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
