import {
  component$,
  createContextId,
  useContextProvider,
  useContext,
  useStore,
  $,
  useVisibleTask$,
  Slot,
  isBrowser,
} from "@builder.io/qwik";

export type Theme = "light" | "dark";

// Internal state interface
interface ThemeState {
  theme: Theme;
}

// Context interface
interface ThemeContextValue {
  themeState: ThemeState;
}

export const ThemeContext = createContextId<ThemeContextValue>("theme-context");

// Define QRLs outside to ensure stability
const toggleThemeQrl = $((context: ThemeContextValue) => {
  context.themeState.theme =
    context.themeState.theme === "light" ? "dark" : "light";
});

const setThemeQrl = $((context: ThemeContextValue, theme: Theme) => {
  context.themeState.theme = theme;
});

export const useTheme = () => {
  const context = useContext(ThemeContext);

  // Return theme functions that set signals directly
  // We wrap them to provide a cleaner API
  return {
    // Access property via getter to track changes
    get theme() {
      return context.themeState.theme;
    },
    toggleTheme: $(() => toggleThemeQrl(context)),
    setTheme: $((theme: Theme) => setThemeQrl(context, theme)),
  };
};

export const ThemeProvider = component$(() => {
  // Main source of truth
  const themeState = useStore<ThemeState>({
    theme: "dark",
  });

  // Provide the state container
  // We create the context value object once with stable QRLs (conceptually)
  // although strict ref equality isn't guaranteed for the functions wrapper, passing the QRLs directly is safer.
  // Actually, we need to pass the state and strictly typed QRLs isn't required by Context itself, but helpful.
  useContextProvider(ThemeContext, {
    themeState,
  });

  // Handle Syncing Store -> Client DOM
  // This ensures that whenever themeState.theme changes, the DOM updates.
  // We use useVisibleTask$ because this is a side effect on the DOM.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const theme = track(() => themeState.theme);

    if (isBrowser) {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  });

  // Initialize theme from localStorage on client side (Hydration fix)
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (isBrowser) {
      const storedTheme = localStorage.getItem("theme");
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      let initialTheme: Theme = "dark"; // Default

      if (storedTheme === "dark" || storedTheme === "light") {
        initialTheme = storedTheme;
      } else if (systemDark) {
        initialTheme = "dark";
      } else {
        initialTheme = "light";
      }

      // Sync state to reality
      themeState.theme = initialTheme;

      // Ensure DOM matches (in case inline script missed something or mismatch)
      document.documentElement.classList.toggle(
        "dark",
        initialTheme === "dark",
      );

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          themeState.theme = newTheme;
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  });

  return <Slot />;
});
