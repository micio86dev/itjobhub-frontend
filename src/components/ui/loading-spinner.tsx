import { component$ } from "@builder.io/qwik";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  class?: string;
}

export const LoadingSpinner = component$<LoadingSpinnerProps>(
  ({ size = "md", class: className }) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-10 h-10",
      lg: "w-16 h-16",
    };

    return (
      <div class={`flex items-center justify-center py-12 ${className || ""}`}>
        <div
          class={`${sizeClasses[size]} animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400`}
        ></div>
      </div>
    );
  },
);
