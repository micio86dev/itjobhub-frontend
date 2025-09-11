import { component$, createContextId, useContextProvider, useContext, useStore, $, useTask$, Slot, useSignal } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleSignal: Signal<boolean>;
  setThemeSignal: Signal<Theme | null>;
}

export const ThemeContext = createContextId<ThemeStore>('theme-context');

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  // Return theme functions that set signals instead of storing functions
  return {
    theme: context.theme,
    toggleTheme: $(() => {
      context.toggleSignal.value = true;
    }),
    setTheme: $((theme: Theme) => {
      context.setThemeSignal.value = theme;
    })
  };
};

export const ThemeProvider = component$(() => {
  const store = useStore<{ theme: Theme }>({
    theme: 'light'
  });

  // Create signals for theme operations
  const toggleSignal = useSignal<boolean>(false);
  const setThemeSignal = useSignal<Theme | null>(null);

  const themeStore: ThemeStore = {
    theme: store.theme,
    toggleSignal,
    setThemeSignal
  };

  // Handle toggle theme requests
  useTask$(({ track }) => {
    const shouldToggle = track(() => toggleSignal.value);
    if (shouldToggle && typeof window !== 'undefined') {
      const newTheme = store.theme === 'light' ? 'dark' : 'light';
      store.theme = newTheme;
      
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      toggleSignal.value = false;
    }
  });

  // Handle set theme requests
  useTask$(({ track }) => {
    const newTheme = track(() => setThemeSignal.value);
    if (newTheme && typeof window !== 'undefined') {
      store.theme = newTheme;
      
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      setThemeSignal.value = null;
    }
  });

  useContextProvider(ThemeContext, themeStore);

  // Initialize theme from localStorage on client side
  useTask$(({ track }) => {
    track(() => typeof window !== 'undefined');
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      store.theme = initialTheme;
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          store.theme = newTheme;
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup in case this runs multiple times
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  });

  return <Slot />;
});