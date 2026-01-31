import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";
import styles from "./footer.module.css";

export const Footer = component$(() => {
  const t = useTranslate();
  const year = new Date().getFullYear();

  return (
    <footer class={styles.footer}>
      <div class={`container ${styles.content}`}>
        <p class={styles.copyright}>
          &copy; {year} DevBoards.io. {t("footer.all_rights_reserved")}
          <span class="mx-2">•</span>
          <a
            href="/privacy-policy"
            class="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {t("footer.privacy_policy")}
          </a>
        </p>
        <p class={styles.credits}>
          {t("footer.developed_by")}
          <a
            href="https://micio86dev.it/"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
            aria-label="Visit developer portfolio"
          >
            @miciodev
          </a>
        </p>
      </div>
    </footer>
  );
});
