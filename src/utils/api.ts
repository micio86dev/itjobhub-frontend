export const request = async (url: string | URL, options: RequestInit = {}) => {
  try {
    console.log(`[API] ${options.method || "GET"} ${url}`);
    const response = await fetch(url, options);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        console.warn(
          "Unauthorized request detected (401), triggering global logout",
        );
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }
    }

    return response;
  } catch (error) {
    console.error(`Fetch error for URL: ${url}`, error);
    throw error;
  }
};
