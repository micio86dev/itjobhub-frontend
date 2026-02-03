import { component$ } from "@builder.io/qwik";

/**
 * Spinner component for loading states
 * Provides a consistent loading indicator across the application
 */
interface SpinnerProps {
  /** Size of the spinner. Default: "md" */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom CSS class */
  class?: string;
}

export const Spinner = component$<SpinnerProps>(
  ({ size = "md", class: className }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-12 h-12",
    };

    return (
      <svg
        class={`animate-spin ${sizeClasses[size]} ${className || ""}`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        data-testid="spinner"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  },
);
