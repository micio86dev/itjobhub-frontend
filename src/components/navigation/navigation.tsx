import { component$, $, useStore, useStylesScoped$ } from "@builder.io/qwik";
import logger from "../../utils/logger";
import { Link } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useI18n, useTranslate, type SupportedLanguage } from "~/contexts/i18n";
import { useTheme } from "~/contexts/theme";
import styles from "./navigation.css?inline";

export const Navigation = component$(() => {
  useStylesScoped$(styles);
  const auth = useAuth();
  const i18n = useI18n();
  const theme = useTheme();
  const t = useTranslate();

  // Extract values and signals to avoid serialization issues
  const currentLanguage = i18n.currentLanguage;
  const logoutSignal = auth.logoutSignal;
  const setLanguageSignal = i18n.setLanguageSignal;

  /* State for mobile menu */
  const state = useStore({
    showLanguageDropdown: false,
    isMenuOpen: false,
  });

  const handleLogout = $(() => {
    // Trigger logout through signal
    logoutSignal.value = true;
    state.isMenuOpen = false;
  });

  const toggleLanguageDropdown = $(() => {
    state.showLanguageDropdown = !state.showLanguageDropdown;
  });

  const toggleMenu = $(() => {
    state.isMenuOpen = !state.isMenuOpen;
  });

  const selectLanguage = $((lang: SupportedLanguage) => {
    logger.info({ lang }, "selectLanguage called");
    logger.info({ currentLanguage }, "Current language before change");
    // Trigger language change through signal
    setLanguageSignal.value = { language: lang };
    logger.info({ language: lang }, "Signal set");
    state.showLanguageDropdown = false;
  });

  const languages = [
    { code: "it" as SupportedLanguage, name: t("lang.italian"), flag: "🇮🇹" },
    { code: "en" as SupportedLanguage, name: t("lang.english"), flag: "🇺🇸" },
    { code: "es" as SupportedLanguage, name: t("lang.spanish"), flag: "🇪🇸" },
    { code: "de" as SupportedLanguage, name: t("lang.german"), flag: "🇩🇪" },
    { code: "fr" as SupportedLanguage, name: t("lang.french"), flag: "🇫🇷" },
  ];

  const currentLanguageObj = languages.find(
    (lang) => lang.code === currentLanguage,
  );

  return (
    <nav class="nav-wrapper">
      <div class="container">
        <div class="nav-content">
          {/* Left Side: Brand & (Desktop) Links */}
          <div class="nav-left">
            <Link href="/" class="brand">
              {t("nav.brand")}
            </Link>

            {/* Desktop Navigation Links */}
            <div class="desktop-links">
              <Link href="/jobs" class="nav-link">
                {t("nav.jobs")}
              </Link>
              {auth.user?.role === "admin" && (
                <Link href="/admin/stats" class="nav-link">
                  {t("nav.dashboard")}
                </Link>
              )}
              {auth.isAuthenticated && (
                <Link href="/favorites" class="nav-link">
                  {t("nav.favorites")}
                </Link>
              )}
            </div>
          </div>

          {/* Right Side: Theme, Lang, Auth (Desktop), Hamburger (Mobile) */}
          <div class="nav-right">
            {/* Theme toggle - Always Visible */}
            <button
              onClick$={theme.toggleTheme}
              class="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme.theme === "light" ? (
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {/* Language selector - Always Visible */}
            <div class="lang-selector">
              <button onClick$={toggleLanguageDropdown} class="lang-btn">
                <span>{currentLanguageObj?.flag}</span>
                <span class="hidden md:inline">{currentLanguageObj?.name}</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {state.showLanguageDropdown && (
                <div class="lang-dropdown">
                  <div class="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick$={$(() => selectLanguage(lang.code))}
                        class={`lang-dropdown-item ${
                          lang.code === currentLanguage
                            ? "lang-dropdown-item-active"
                            : "lang-dropdown-item-default"
                        }`}
                      >
                        <span class="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div class="desktop-auth">
              {auth.isAuthenticated ? (
                <>
                  <Link href="/profile" class="nav-link">
                    {t("nav.profile")}
                  </Link>
                  <button
                    onClick$={handleLogout}
                    class="btn-logout"
                    data-testid="logout-button"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" class="nav-link">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" class="btn-register">
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div class="mobile-menu-btn-wrapper">
              <button
                onClick$={toggleMenu}
                type="button"
                data-testid="mobile-menu-button"
                class="mobile-menu-btn"
                aria-expanded="false"
              >
                <span class="sr-only">{t("nav.open_menu")}</span>
                {/* Icon when menu is closed */}
                {!state.isMenuOpen ? (
                  <svg
                    class="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  /* Icon when menu is open */
                  <svg
                    class="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {state.isMenuOpen && (
        <div class="mobile-menu">
          <div class="mobile-menu-panel">
            <Link href="/jobs" class="mobile-nav-link">
              {t("nav.jobs")}
            </Link>
            {auth.user?.role === "admin" && (
              <Link href="/admin/stats" class="mobile-nav-link">
                {t("nav.dashboard")}
              </Link>
            )}
            {auth.isAuthenticated && (
              <Link href="/favorites" class="mobile-nav-link">
                {t("nav.favorites")}
              </Link>
            )}

            <div class="mobile-divider">
              {auth.isAuthenticated ? (
                <div class="mobile-auth-wrapper">
                  <Link href="/profile" class="mobile-nav-link">
                    {t("nav.profile")}
                  </Link>
                  <button
                    onClick$={handleLogout}
                    class="mobile-btn-logout"
                    data-testid="logout-button"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div class="mobile-auth-wrapper">
                  <Link href="/login" class="mobile-nav-link">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" class="mobile-btn-register">
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});
