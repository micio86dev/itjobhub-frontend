import { component$, useStyles$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { QRL } from "@builder.io/qwik";
import styles from "./reaction-buttons.css?inline";

interface CommentsButtonProps {
  count: number;
  active?: boolean;
  href?: string;
  onClick$?: QRL<() => void>;
  disabled?: boolean;
  class?: string;
}

export const CommentsButton = component$<CommentsButtonProps>((props) => {
  useStyles$(styles);

  const {
    count,
    active = false,
    href,
    onClick$,
    disabled = false,
    class: className,
  } = props;

  // Base classes for consistent styling
  const baseClasses = `reaction-btn ${
    active ? "reaction-btn-comment-active" : "reaction-btn-comment-inactive"
  } ${className || ""}`;

  const Icon = () => (
    <svg
      class="reaction-icon-svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      />
    </svg>
  );

  const Count = () => (
    <span class="font-medium text-sm reaction-count">
      {count}
      <Slot />
    </span>
  );

  if (href) {
    return (
      <Link href={href} class={baseClasses} aria-label="View comments">
        <Icon />
        <Count />
      </Link>
    );
  }

  return (
    <button
      onClick$={onClick$}
      disabled={disabled}
      class={baseClasses}
      aria-label={active ? "Hide comments" : "Show comments"}
      type="button"
    >
      <Icon />
      <Count />
    </button>
  );
});
