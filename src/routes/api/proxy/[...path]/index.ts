import type { RequestHandler } from "@builder.io/qwik-city";
import { API_URL } from "~/constants";
import logger from "~/utils/logger";

const handleProxy = async (
  method: string,
  {
    params,
    url,
    cookie,
    env,
    json,
    request,
  }: import("@builder.io/qwik-city").RequestEvent,
) => {
  const path = params.path;
  const apiUrl =
    env.get("PUBLIC_API_URL") ||
    env.get("INTERNAL_API_URL") ||
    env.get("API_URL") ||
    API_URL;
  const targetUrl = new URL(url.toString());

  // Construct the backend URL
  const backendUrl = `${apiUrl}/${path}${targetUrl.search}`;

  logger.warn(
    { method, path, backendUrl, fullUrl: url.toString() },
    "[Proxy] Forwarding request",
  );

  const headers: Record<string, string> = {
    "Accept-Language": cookie.get("preferred-language")?.value || "it",
  };

  // Prioritize the Authorization header sent by the browser (always raw/fresh)
  const incomingAuth =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");
  if (incomingAuth) {
    headers["Authorization"] = incomingAuth;
  } else {
    // Fallback: read from cookie (decodeURIComponent because setCookie uses encodeURIComponent)
    const rawToken = cookie.get("auth_token")?.value;
    if (rawToken) {
      try {
        headers["Authorization"] = `Bearer ${decodeURIComponent(rawToken)}`;
      } catch {
        headers["Authorization"] = `Bearer ${rawToken}`;
      }
    }
  }

  // Preserve Content-Type if present in original request
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    logger.warn(
      { fetchOptions, backendUrl },
      `[Proxy] About to fetch ${method} request`,
    );

    const response = await fetch(backendUrl, fetchOptions);
    const data = await response.json();

    logger.warn(
      { status: response.status, backendUrl, method },
      `[Proxy] Got response from backend`,
    );

    json(response.status, data);
  } catch (err) {
    logger.error({ err, backendUrl }, "[Proxy] Error forwarding request");
    json(500, { success: false, message: "Proxy error" });
  }
};

export const onGet: RequestHandler = async (ev) => handleProxy("GET", ev);
export const onPost: RequestHandler = async (ev) => handleProxy("POST", ev);
export const onPut: RequestHandler = async (ev) => handleProxy("PUT", ev);
export const onPatch: RequestHandler = async (ev) => handleProxy("PATCH", ev);
export const onDelete: RequestHandler = async (ev) => handleProxy("DELETE", ev);
