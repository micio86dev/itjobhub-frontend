import { component$, useStylesScoped$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeAction$,
  Form,
  z,
  zod$,
} from "@builder.io/qwik-city";

export const useContactAction = routeAction$(
  async (data, { fail }) => {
    try {
      const response = await fetch("http://localhost:3001/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return fail(response.status, {
          message: result.message || "Failed to send message",
        });
      }

      return {
        success: true,
        message: "Message sent successfully!",
      };
    } catch (error) {
      console.error("Contact form error:", error);
      return fail(500, {
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  },
  zod$({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    subject: z.enum(["error_report", "collaboration", "other"]),
    message: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(1000, "Message is too long"),
  }),
);

export default component$(() => {
  const action = useContactAction();

  useStylesScoped$(`
    .page-container {
      @apply flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 min-h-screen;
    }
    .title-gradient {
      @apply block bg-clip-text bg-gradient-to-r from-green-500 dark:from-green-400 to-emerald-400 dark:to-emerald-300 text-transparent;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      @apply relative shadow-xl px-6 sm:px-10 py-8 rounded-lg overflow-hidden;
    }
    .dark .glass-panel {
      background: rgba(17, 24, 39, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .neon-accent {
      @apply top-0 left-0 absolute bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-75 w-full h-1;
    }
    .success-icon-bg {
      @apply flex justify-center items-center bg-green-100 dark:bg-green-900 mx-auto mb-6 rounded-full w-16 h-16;
    }
    .error-box {
      @apply rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800;
    }
  `);

  return (
    <div class="page-container">
      <div class="space-y-8 w-full max-w-md">
        <div class="text-center">
          <h1 class="mb-2 font-extrabold text-4xl sm:text-5xl tracking-tight">
            <span class="title-gradient">Get in Touch</span>
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400 text-lg">
            Have a question, suggestion, or just want to say hi?
          </p>
        </div>

        <div class="glass-panel">
          {/* Neon accent */}
          <div class="neon-accent"></div>

          {action.value?.success ? (
            <div class="py-10 text-center animate-fade-in-up">
              <div class="success-icon-bg">
                <svg
                  class="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-gray-100 text-xl">
                Message Sent!
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Thanks for reaching out. We'll get back to you shortly.
              </p>
              <button
                class="mt-6 w-full btn-primary"
                onClick$={() => window.location.reload()}
              >
                Send Another
              </button>
            </div>
          ) : (
            <Form action={action} class="space-y-6">
              {action.value?.failed && (
                <div class="error-box">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg
                        class="w-5 h-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="font-medium text-red-800 dark:text-red-200 text-sm">
                        Error sending message
                      </h3>
                      <div class="mt-2 text-red-700 dark:text-red-300 text-sm">
                        <p>{action.value.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Name
                  <div class="mt-1">
                    <input
                      name="name"
                      type="text"
                      required
                      class="w-full input"
                      placeholder="Your Name"
                    />
                  </div>
                </label>
                {action.value?.fieldErrors?.name && (
                  <p class="mt-1 text-red-600 dark:text-red-400 text-sm">
                    {action.value.fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Email Address
                  <div class="mt-1">
                    <input
                      name="email"
                      type="email"
                      required
                      class="w-full input"
                      placeholder="you@example.com"
                    />
                  </div>
                </label>
                {action.value?.fieldErrors?.email && (
                  <p class="mt-1 text-red-600 dark:text-red-400 text-sm">
                    {action.value.fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Subject
                  <div class="mt-1">
                    <select name="subject" required class="w-full select">
                      <option value="collaboration">
                        Collaboration / Participation
                      </option>
                      <option value="error_report">Report an Error</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </label>
              </div>

              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 text-sm">
                  Message
                  <div class="mt-1">
                    <textarea
                      name="message"
                      rows={4}
                      required
                      class="w-full input"
                      placeholder="How can we help you?"
                    />
                  </div>
                </label>
                {action.value?.fieldErrors?.message && (
                  <p class="mt-1 text-red-600 dark:text-red-400 text-sm">
                    {action.value.fieldErrors.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  class="w-full btn-primary"
                  disabled={action.isRunning}
                >
                  {action.isRunning ? (
                    <span class="flex items-center">
                      <svg
                        class="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Contact Us - DevBoards.io",
  meta: [
    {
      name: "description",
      content:
        "Contact us for support, error reporting, or collaboration opportunities.",
    },
  ],
};
