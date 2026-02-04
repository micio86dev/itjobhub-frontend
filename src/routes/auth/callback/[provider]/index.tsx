import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import logger from "~/utils/logger";

export const useOAuthCallback = routeLoader$(
  async ({ params, url, cookie, redirect, env }) => {
    const provider = params.provider;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Handle Provider Errors
    if (error) {
      logger.error(
        { error, errorDescription, provider },
        "OAuth Provider Error",
      );
      throw redirect(
        302,
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
      );
    }

    // Handle Missing Code
    if (!code) {
      logger.warn({ provider }, "OAuth Missing Code");
      throw redirect(302, "/login?error=no_code");
    }

    const API_URL = env.get("PUBLIC_API_URL") || "http://127.0.0.1:3001";

    try {
      logger.info(
        {
          provider,
          code: code ? "PRESENT" : "MISSING",
          state,
          API_URL,
        },
        "Starting OAuth Exchange",
      );

      logger.info(
        { url: `${API_URL}/auth/oauth/${provider}/callback` },
        "Fetching OAuth Callback",
      );

      // Exchange Code for Token
      const response = await fetch(
        `${API_URL}/auth/oauth/${provider}/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // We don't use the 'request' utility here to keep it simple and explicit for server-side
          body: JSON.stringify({ code, state }),
        },
      );

      const text = await response.text();
      logger.info(
        { status: response.status, statusText: response.statusText },
        "OAuth Upstream Response Received",
      );

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        logger.error(
          { error: e, textPreview: text.substring(0, 100) },
          "Failed to parse JSON response",
        );
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (response.ok && data.success && data.data?.token) {
        const { token, user } = data.data;

        // Set Auth Cookie
        // Matching client-side 'setCookie' behavior: path=/, SameSite=Lax
        cookie.set("auth_token", token, {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "lax",
        });

        logger.info({ userId: user.id }, "OAuth Login Successful");

        // Redirect based on profile completion
        // Redirect based on profile completion
        if (!user.profileCompleted) {
          throw redirect(302, "/wizard");
        }

        // Parse returnTo from state
        let returnTo = "/";
        try {
          if (state) {
            const decodedState = atob(state);
            const stateObj = JSON.parse(decodedState);
            if (stateObj.returnTo && stateObj.returnTo.startsWith("/")) {
              returnTo = stateObj.returnTo;
            }
          }
        } catch (e) {
          logger.warn(
            { state, err: e },
            "Failed to parse state for returnTo, defaulting to /",
          );
        }

        // Check if returnTo is a protected route
        // User rule: "must not be a page visible only by logged users"
        const protectedPrefixes = [
          "/admin",
          "/wizard",
          "/profile",
          "/settings",
          "/dashboard",
        ];
        const isProtected = protectedPrefixes.some((prefix) =>
          returnTo.startsWith(prefix),
        );

        if (isProtected) {
          logger.info(
            { returnTo },
            "Redirect target is protected, falling back to home",
          );
          throw redirect(302, "/");
        }

        throw redirect(302, returnTo);
      } else {
        // Extract specific error message from backend
        const failureReason =
          data.message || `Authentication failed (Status: ${response.status})`;
        logger.error(
          { failureReason, backendData: data },
          "OAuth Exchange validation failed",
        );
        throw new Error(failureReason);
      }
    } catch (err) {
      logger.error({ err }, "OAuth Exchange Failed");

      let errorMsg = "Authentication failed";

      // Handle redirects (re-throw them)
      if (
        err &&
        (err instanceof Response ||
          (typeof err === "object" && "status" in err && err.status === 302))
      ) {
        throw err;
      }

      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === "string") {
        errorMsg = err;
      } else if (typeof err === "object") {
        try {
          errorMsg = JSON.stringify(err);
        } catch {
          errorMsg = "Unknown error object";
        }
      }

      throw redirect(302, `/login?error=${encodeURIComponent(errorMsg)}`);
    }
  },
);

export default component$(() => {
  // Trigger loader
  useOAuthCallback();

  return (
    <div class="flex justify-center items-center bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div class="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg p-8 rounded-lg">
        <div class="mb-4 border-4 border-brand-neon border-t-transparent rounded-full w-12 h-12 animate-spin" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200 text-xl">
          Processing authentication...
        </h2>
      </div>
    </div>
  );
});
