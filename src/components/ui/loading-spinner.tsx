import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./loading-spinner.css?inline";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  class?: string;
}

export const LoadingSpinner = component$<LoadingSpinnerProps>(
  ({ size = "md", class: className }) => {
    useStylesScoped$(styles);

    const sizeClasses = {
      sm: "spinner-sm",
      md: "spinner-md",
      lg: "spinner-lg",
    };

    return (
      <div class={`spinner-container ${className || ""}`}>
        <div class={`spinner ${sizeClasses[size]}`}></div>
      </div>
    );
  },
);
