import {
  component$,
  useSignal,
  useTask$,
  isBrowser,
  $,
} from "@builder.io/qwik";
import {
  useNavigate,
  type DocumentHead,
  routeLoader$,
} from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { API_URL } from "~/constants";
import { Spinner } from "~/components/ui/spinner";

interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_sender_logged_in: boolean;
  created_at: string;
  replies: Array<{
    id: string;
    message: string;
    created_at: string;
    read_by_sender: boolean;
    replier: {
      first_name: string;
      last_name: string;
    };
  }>;
}

export const useMessagesProtection = routeLoader$(
  async ({ cookie, redirect, url }) => {
    const token = cookie.get("auth_token")?.value;
    if (!token) {
      throw redirect(302, `/login?returnUrl=${url.pathname}`);
    }
  },
);

export default component$(() => {
  useMessagesProtection();
  const nav = useNavigate();
  const auth = useAuth();
  const i18n = useI18n();
  const t = useTranslate();

  const messages = useSignal<ContactMessage[]>([]);
  const isLoading = useSignal(true);
  const error = useSignal<string | null>(null);
  const selectedMessage = useSignal<ContactMessage | null>(null);
  const currentPage = useSignal(1);
  const totalPages = useSignal(1);

  // Fetch user's messages
  const fetchMessages = $(async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_URL}/messages/user/me/contacts?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      messages.value = data.data || [];
      currentPage.value = data.pagination?.page || 1;
      totalPages.value = data.pagination?.pages || 1;
    } catch (err) {
      error.value = "error";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  });

  // Load messages on mount
  useTask$(async ({ track }) => {
    track(() => auth.isAuthenticated);
    if (isBrowser && auth.isAuthenticated) {
      await fetchMessages();
    } else if (isBrowser && !auth.isAuthenticated) {
      nav("/login");
    }
  });

  const formattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.currentLanguage, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section class="py-12 md:py-20 min-h-screen bg-brand-light-bg dark:bg-brand-dark-bg transition-colors duration-300">
      <div class="mx-auto px-4 container max-w-4xl">
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">
            {t("messages.my_messages")}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {t("messages.view_sent_received")}
          </p>
        </div>

        {isLoading.value && (
          <div class="flex justify-center items-center py-12">
            <Spinner />
          </div>
        )}

        {error.value && (
          <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
            <p class="text-red-700 dark:text-red-200">
              {t("messages.error_loading")}
            </p>
          </div>
        )}

        {!isLoading.value && !selectedMessage.value && (
          <div class="space-y-4">
            {messages.value.length === 0 ? (
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <svg
                  class="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  ></path>
                </svg>
                <p class="text-gray-600 dark:text-gray-400">
                  {t("messages.no_messages")}
                </p>
              </div>
            ) : (
              <>
                {messages.value.map((msg) => (
                  <button
                    key={msg.id}
                    onClick$={() => (selectedMessage.value = msg)}
                    class="block w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow p-4"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="font-semibold text-lg text-gray-900 dark:text-white flex-1 truncate">
                        {msg.subject}
                      </h3>
                      {msg.replies.length > 0 && (
                        <span class="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 text-xs font-semibold rounded">
                          {t("messages.answered")}
                        </span>
                      )}
                      {msg.replies.length === 0 && (
                        <span class="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 text-xs font-semibold rounded">
                          {t("messages.pending")}
                        </span>
                      )}
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {msg.message.substring(0, 100)}...
                    </p>
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{formattedDate(msg.created_at)}</span>
                      {msg.replies.length > 0 && (
                        <span>
                          {msg.replies.length}{" "}
                          {msg.replies.length === 1
                            ? t("messages.reply")
                            : t("messages.replies")}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Pagination */}
            {totalPages.value > 1 && (
              <div class="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick$={() => fetchMessages(currentPage.value - 1)}
                  disabled={currentPage.value === 1}
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("common.previous")}
                </button>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {currentPage.value} / {totalPages.value}
                </span>
                <button
                  onClick$={() => fetchMessages(currentPage.value + 1)}
                  disabled={currentPage.value === totalPages.value}
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </div>
        )}

        {selectedMessage.value && (
          <div class="space-y-4">
            <button
              onClick$={() => (selectedMessage.value = null)}
              class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
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
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              {t("common.back")}
            </button>

            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {selectedMessage.value.subject}
                </h2>
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{formattedDate(selectedMessage.value.created_at)}</span>
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {selectedMessage.value.is_sender_logged_in
                      ? t("messages.you_sent")
                      : t("messages.sent_anonymously")}
                  </span>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedMessage.value.message}
                </p>
              </div>

              {selectedMessage.value.replies.length > 0 && (
                <div class="border-t pt-6">
                  <h3 class="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                    {t("messages.replies")} (
                    {selectedMessage.value.replies.length})
                  </h3>
                  <div class="space-y-4">
                    {selectedMessage.value.replies.map((reply) => (
                      <div
                        key={reply.id}
                        class="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-700/30"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="font-semibold text-gray-900 dark:text-white">
                            {reply.replier.first_name} {reply.replier.last_name}
                          </span>
                          <div class="flex items-center gap-2">
                            {reply.read_by_sender && (
                              <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 px-2 py-1 rounded">
                                {t("messages.read")}
                              </span>
                            )}
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                              {formattedDate(reply.created_at)}
                            </span>
                          </div>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {reply.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMessage.value.replies.length === 0 && (
                <div class="border-t pt-6 text-center">
                  <p class="text-gray-600 dark:text-gray-400">
                    {t("messages.no_replies_yet")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export const head: DocumentHead = () => {
  return {
    title: "My Messages - DevBoards.io",
    meta: [
      {
        name: "description",
        content: "View your contact messages and replies",
      },
    ],
  };
};
