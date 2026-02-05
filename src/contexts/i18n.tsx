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
import logger from "../utils/logger";
import { getCookie, setCookie } from "../utils/cookies";

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
// Force HMR update to pick up new translation keys

interface I18nProviderProps {
  initialLanguage?: SupportedLanguage;
}

export const I18nProvider = component$((props: I18nProviderProps) => {
  // Create signal for language changes
  const setLanguageSignal = useSignal<SetLanguageRequest | null>(null);

  const i18nState: I18nState = useStore<I18nState>({
    currentLanguage: props.initialLanguage || "it",
    setLanguageSignal,
  });

  // Load saved language preference from cookies after hydration if not provided by server
  useTask$(() => {
    if (isBrowser && !props.initialLanguage) {
      const savedLang = getCookie("preferred-language") as SupportedLanguage;
      if (
        savedLang &&
        savedLang in translations &&
        savedLang !== i18nState.currentLanguage
      ) {
        logger.info({ savedLang }, "Loading saved language from cookies");
        i18nState.currentLanguage = savedLang;
      }
    }
  });

  // Handle language change requests
  useTask$(({ track }) => {
    const langReq = track(() => setLanguageSignal.value);
    if (langReq) {
      logger.info({ langReq }, "Language change request");
      i18nState.currentLanguage = langReq.language;
      console.log(
        `[E2E] I18nProvider: Language state updated to: ${langReq.language}`,
      );
      logger.info(
        { currentLanguage: i18nState.currentLanguage },
        "Language changed",
      );
      // Save to cookies
      if (isBrowser) {
        setCookie("preferred-language", langReq.language, 365); // Save for 1 year
        logger.info({ language: langReq.language }, "Saved to cookies");
      }
      setLanguageSignal.value = null;
    }
  });

  useContextProvider(I18nContext, i18nState);

  return (
    <div data-lang={i18nState.currentLanguage} data-testid="i18n-root">
      <Slot />
    </div>
  );
});

export const useI18n = () => {
  return useContext(I18nContext);
};

export const translate = (key: string, language: SupportedLanguage): string => {
  const currentTranslations = translations[language];
  if (!currentTranslations) {
    logger.warn(
      { language },
      `No translations found for language: ${language}`,
    );
    return key;
  }
  const translation =
    currentTranslations[key as keyof typeof currentTranslations];
  if (!translation) {
    logger.warn(
      { key, language },
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
