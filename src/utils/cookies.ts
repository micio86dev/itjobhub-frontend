export const setCookie = (name: string, value: string, days: number = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  // URI encode the value to handle special characters in JSON
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value || "") +
    expires +
    "; path=/; SameSite=Lax";
};

export const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  // Try deleting with direct path
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

  // Try deleting with current domain
  if (typeof window !== "undefined") {
    const domain = window.location.hostname;
    document.cookie =
      name +
      "=; Path=/; Domain=" +
      domain +
      "; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Also try without subdomains if any
    const parts = domain.split(".");
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join(".");
      document.cookie =
        name +
        "=; Path=/; Domain=" +
        rootDomain +
        "; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }
};
