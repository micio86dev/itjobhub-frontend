import {
  component$,
  createContextId,
  useContextProvider,
  useContext,
  useStore,
  $,
  useTask$,
  Slot,
  useSignal,
  isBrowser,
  type Signal,
} from "@builder.io/qwik";

export type Theme = "light" | "dark";

// Internal state interface
interface ThemeState {
  theme: Theme;
}

// Context interface
interface ThemeContextValue {
  themeState: ThemeState;
  toggleSignal: Signal<boolean>;
  setThemeSignal: Signal<Theme | null>;
}

export const ThemeContext = createContextId<ThemeContextValue>("theme-context");

export const useTheme = () => {
  const context = useContext(ThemeContext);

  // Return theme functions that set signals
  return {
    // Access property via getter to track changes
    get theme() {
      return context.themeState.theme;
    },
    toggleTheme: $(() => {
      context.toggleSignal.value = true;
    }),
    setTheme: $((theme: Theme) => {
      context.setThemeSignal.value = theme;
    }),
  };
};

export const ThemeProvider = component$(() => {
  // Main source of truth
  const themeState = useStore<ThemeState>({
    theme: "dark",
  });

  // Create signals for theme operations
  const toggleSignal = useSignal<boolean>(false);
  const setThemeSignal = useSignal<Theme | null>(null);

  // Provide the state container, not the primitive values
  useContextProvider(ThemeContext, {
    themeState,
    toggleSignal,
    setThemeSignal,
  });

  // Handle toggle theme requests
  useTask$(({ track }) => {
    const shouldToggle = track(() => toggleSignal.value);
    if (shouldToggle && typeof window !== "undefined") {
      const newTheme = themeState.theme === "light" ? "dark" : "light";
      themeState.theme = newTheme;

      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");

      toggleSignal.value = false;
    }
  });

  // Handle set theme requests
  useTask$(({ track }) => {
    const newTheme = track(() => setThemeSignal.value);
    if (newTheme && typeof window !== "undefined") {
      themeState.theme = newTheme;

      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");

      setThemeSignal.value = null;
    }
  });

  // Initialize theme from localStorage on client side
  useTask$(() => {
    if (isBrowser) {
      if (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
        themeState.theme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        themeState.theme = "light";
      }

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          themeState.theme = newTheme;
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark",
          );
        }
      };

      mediaQuery.addEventListener("change", handleChange);

      // Cleanup in case this runs multiple times
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  });

  return <Slot />;
});
