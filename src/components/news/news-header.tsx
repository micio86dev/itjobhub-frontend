import { component$, useStylesScoped$, $, type QRL } from "@builder.io/qwik";
import styles from "./news-header.css?inline";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { ReactionButtons } from "../ui/reaction-buttons";

interface NewsHeaderProps {
  news: {
    id: string;
    title: string;
    category: string;
    image?: string;
    created_at: string;
    likes: number;
    dislikes: number;
    user_reaction?: "LIKE" | "DISLIKE" | null;
  };
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLike$: QRL<() => void>;
  onDislike$: QRL<() => void>;
  onDelete$: QRL<() => void>;
}

export const NewsHeader = component$<NewsHeaderProps>(
  ({ news, isAuthenticated, isAdmin, onLike$, onDislike$, onDelete$ }) => {
    useStylesScoped$(styles);
    const t = useTranslate();
    const i18n = useI18n();

    const localeMap: Record<string, string> = {
      it: "it-IT",
      en: "en-US",
      es: "es-ES",
      de: "de-DE",
      fr: "fr-FR",
    };
    const locale = localeMap[i18n.currentLanguage] || "it-IT";
    const formattedDate = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(news.created_at));

    return (
      <div class="heroHeader">
        <div class="headerContent">
          <div class="flex items-center gap-6">
            <div class="newsImageContainer">
              {news.image ? (
                <img
                  src={news.image}
                  alt={news.title}
                  width="80"
                  height="80"
                  class="newsImage"
                />
              ) : (
                <svg
                  class="newsImagePlaceholder"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 2v6h6"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h8m-8 4h3"
                  />
                </svg>
              )}
            </div>
            <div>
              <h1 class="newsTitle">{news.title}</h1>
              <div class="newsMeta">
                <span class="categoryLabel">{news.category}</span>
                <span class="date">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="dateIcon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div class="actionsContainer">
            <ReactionButtons
              likes={news.likes}
              dislikes={news.dislikes}
              userReaction={news.user_reaction}
              onLike$={onLike$}
              onDislike$={onDislike$}
              isAuthenticated={isAuthenticated}
              likeTitle={t("job.like")}
              dislikeTitle={t("job.dislike")}
            />

            {isAdmin && (
              <button
                onClick$={$(async () => await onDelete$())}
                class="deleteButton"
                data-testid="delete-button"
              >
                {t("common.delete")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
