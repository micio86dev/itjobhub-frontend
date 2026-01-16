import {
  createContextId,
  Slot,
  component$,
  useStore,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  Signal,
  noSerialize,
  isBrowser,
} from "@builder.io/qwik";

import it from "../locales/it.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import de from "../locales/de.json";
import fr from "../locales/fr.json";

export type SupportedLanguage = "it" | "en" | "es" | "de" | "fr";

export interface SetLanguageRequest {
  language: SupportedLanguage;
}

interface I18nState {
  currentLanguage: SupportedLanguage;
  setLanguageSignal: Signal<SetLanguageRequest | null>;
}

export const I18nContext = createContextId<I18nState>("i18n-context");

// Translation dictionaries
const translations = {
  it,
  en,
  es,
  de,
  fr,
};

export const I18nProvider = component$(() => {
  // Create signal for language changes
  const setLanguageSignal = useSignal<SetLanguageRequest | null>(null);

  const i18nState: I18nState = useStore<I18nState>({
    currentLanguage: "it",
    setLanguageSignal,
  });

  // Load saved language preference from localStorage after hydration
  // Load saved language preference from localStorage after hydration
  useTask$(() => {
    if (isBrowser) {
      const savedLang = localStorage.getItem(
        "preferred-language",
      ) as SupportedLanguage;
      if (
        savedLang &&
        savedLang in translations &&
        savedLang !== i18nState.currentLanguage
      ) {
        console.log("Loading saved language from localStorage:", savedLang);
        i18nState.currentLanguage = savedLang;
      }
    }
  });

  // Handle language change requests
  useTask$(({ track }) => {
    const langReq = track(() => setLanguageSignal.value);
    if (langReq) {
      console.log("Language change request:", langReq);
      i18nState.currentLanguage = langReq.language;
      console.log("Language changed to:", i18nState.currentLanguage);
      // Save to localStorage (will only run client-side)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("preferred-language", langReq.language);
        console.log("Saved to localStorage:", langReq.language);
      }
      setLanguageSignal.value = null;
    }
  });

  useContextProvider(I18nContext, i18nState);

  return <Slot />;
});

export const useI18n = () => {
  return useContext(I18nContext);
};

export const translate = (key: string, language: SupportedLanguage): string => {
  const currentTranslations = translations[language];
  if (!currentTranslations) {
    console.warn(`No translations found for language: ${language}`);
    return key;
  }
  const translation =
    currentTranslations[key as keyof typeof currentTranslations];
  if (!translation) {
    console.warn(
      `Translation missing for key "${key}" in language "${language}"`,
    );
  }
  return translation || key;
};

export const useTranslate = () => {
  const i18n = useContext(I18nContext);
  return noSerialize((key: string) => translate(key, i18n.currentLanguage)) as (
    key: string,
  ) => string;
};

// Helper function for interpolation
export const interpolate = (
  template: string,
  values: Record<string, string | number>,
): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
};
