import logger from "./logger";

export const request = async (url: string | URL, options: RequestInit = {}) => {
  try {
    logger.info(
      { method: options.method || "GET", url: url.toString() },
      "[API] Request",
    );
    const response = await fetch(url, options);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        logger.warn(
          { url: url.toString() },
          "Unauthorized request detected (401), triggering global logout",
        );
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }
    }

    return response;
  } catch (error) {
    logger.error({ error, url: url.toString() }, "Fetch error");
    throw error;
  }
};
