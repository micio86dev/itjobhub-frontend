import { isBrowser } from "@builder.io/qwik";
import { API_URL } from "../constants";
import logger from "./logger";

export const request = async (url: string | URL, options: RequestInit = {}) => {
  let finalUrl = url.toString();

  // If we are in the browser, proxy the request to our own server to avoid CSP
  if (isBrowser && finalUrl.startsWith(API_URL)) {
    const apiPath = finalUrl.replace(API_URL, "");
    // Ensure we don't have double slashes and handle cases where API_URL might not end with /
    const cleanPath = apiPath.startsWith("/") ? apiPath.substring(1) : apiPath;
    finalUrl = `/api/proxy/${cleanPath}`;
  }

  try {
    logger.info(
      { method: options.method || "GET", url: finalUrl },
      "[API] Request",
    );
    const response = await fetch(finalUrl, options);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        logger.warn(
          { url: finalUrl },
          "Unauthorized request detected (401), triggering global logout",
        );
        window.dispatchEvent(
          new CustomEvent("unauthorized", {
            detail: { pathname: window.location.pathname },
          }),
        );
      }
    }

    return response;
  } catch (error) {
    logger.error({ error, url: finalUrl }, "Fetch error");
    throw error;
  }
};
