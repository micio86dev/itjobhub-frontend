import { component$, Slot, type PropFunction } from "@builder.io/qwik";
import { Spinner } from "./spinner";

/**
 * Standardized submit button component
 * Automatically handles loading states with spinner and disables during submission
 */
interface SubmitButtonProps {
  /** Whether the button is currently loading */
  loading: boolean;
  /** Text to display when loading. If not provided, uses the slot content */
  loadingText?: string;
  /** CSS class for styling */
  class?: string;
  /** Whether the button is disabled (in addition to loading state) */
  disabled?: boolean;
  /** Test ID for automated testing */
  testId?: string;
  /** onClick handler */
  onClick$?: PropFunction<() => void>;
  /** Button type. Default: "submit" */
  type?: "submit" | "button" | "reset";
}

export const SubmitButton = component$<SubmitButtonProps>(
  ({
    loading,
    loadingText,
    class: className,
    disabled = false,
    testId,
    onClick$,
    type = "submit",
  }) => {
    return (
      <button
        type={type}
        disabled={loading || disabled}
        class={className}
        data-testid={testId}
        onClick$={onClick$}
        aria-busy={loading}
      >
        {loading && <Spinner size="sm" class="-ml-1 mr-2" />}
        {loading && loadingText ? loadingText : <Slot />}
      </button>
    );
  },
);
