import { component$ } from "@builder.io/qwik";

export const Logo = component$(() => {
  return (
    <div class="group flex items-center gap-3 font-mono select-none">
      <div class="relative flex justify-center items-center bg-brand-dark-bg shadow-neon-sm group-hover:shadow-neon-strong border border-brand-neon/50 rounded w-10 h-10 transition-all duration-300">
        <span class="font-bold text-brand-neon text-lg animate-pulse-subtle">
          &gt;_
        </span>
        <div class="absolute inset-0 bg-brand-neon/10 opacity-0 group-hover:opacity-100 rounded transition-opacity duration-300"></div>
      </div>
      <span class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-neon text-xl tracking-tight transition-colors duration-300">
        DevBoards<span class="text-brand-neon">.io</span>
      </span>
    </div>
  );
});
