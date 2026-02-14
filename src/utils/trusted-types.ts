/**
 * Trusted Types utility for Google Maps and General Usage
 * Handles creating a policy to safely assign script URLs and HTML
 */

// Declare the Trusted Types API
interface TrustedTypePolicy {
  createScriptURL(input: string): string;
  createHTML(input: string): string;
  createScript(input: string): string;
}

interface TrustedTypePolicyFactory {
  createPolicy(
    name: string,
    rules: {
      createScriptURL?: (input: string) => string | null;
      createHTML?: (input: string) => string | null;
      createScript?: (input: string) => string | null;
    },
  ): TrustedTypePolicy;
  getAttributeType(tagName: string, attribute: string): string | null;
  getPolicyNames(): string[];
}

declare global {
  interface Window {
    trustedTypes?: TrustedTypePolicyFactory;
    initGoogleMapsCallback?: () => void;
  }
}

let googleMapsPolicy: TrustedTypePolicy | undefined;
let devboardsPolicy: TrustedTypePolicy | undefined;

/**
 * Creates or retrieves a Trusted Types policy for Google Maps scripts
 */
export const createGoogleMapsPolicy = (): TrustedTypePolicy | undefined => {
  if (typeof window === "undefined") return undefined;

  // Return existing policy if already created
  if (googleMapsPolicy) return googleMapsPolicy;

  // If Trusted Types is not supported, return undefined (strings will work as is)
  if (!window.trustedTypes) return undefined;

  try {
    googleMapsPolicy = window.trustedTypes.createPolicy("google-maps", {
      createScriptURL: (input: string) => {
        // Validate that the URL starts with the expected Google Maps API prefix
        const allowedPrefix = "https://maps.googleapis.com/maps/api/js";
        if (input.startsWith(allowedPrefix)) {
          return input;
        }
        console.error(
          `Bounded script URL blocked by Trusted Types policy: ${input}`,
        );
        return null;
      },
    });
    return googleMapsPolicy;
  } catch (error) {
    console.warn("Failed to create Trusted Types policy:", error);
    return undefined;
  }
};

/**
 * Creates or retrieves the 'devboards-policy' for general trusted HTML/Script usage.
 * This policy is designed to be permissive for verified internal usage (e.g. JSON-LD, localized strings).
 */
export const getTrustedPolicy = (): TrustedTypePolicy | undefined => {
  if (typeof window === "undefined") return undefined;

  if (devboardsPolicy) return devboardsPolicy;

  if (window.trustedTypes) {
    const existing =
      typeof window.trustedTypes.getPolicyNames === "function"
        ? window.trustedTypes.getPolicyNames()
        : [];

    if (existing.includes("devboards-policy")) {
      // Logic to "get" it isn't standard, but we we know it exists.
      // We'll try to create it anyway since allow-duplicates is set, or just return undefined if we can't find our local ref.
    }

    try {
      devboardsPolicy = window.trustedTypes.createPolicy("devboards-policy", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string,
      });
      return devboardsPolicy;
    } catch {
      // Fail silently if it exists and allow-duplicates is somehow ignored
      return undefined;
    }
  }
  return undefined;
};

/**
 * Creates or retrieves a 'default' policy to act as a fallback for 3rd party libraries and framework internals.
 */
export const createDefaultPolicy = (): TrustedTypePolicy | undefined => {
  if (typeof window === "undefined") return undefined;

  // Check if it already exists in our local variable
  if (devboardsPolicy && devboardsPolicy.createHTML("")) return undefined; // already have one

  if (window.trustedTypes) {
    const existing =
      typeof window.trustedTypes.getPolicyNames === "function"
        ? window.trustedTypes.getPolicyNames()
        : [];

    if (existing.includes("default")) return undefined;

    try {
      return window.trustedTypes.createPolicy("default", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string,
      });
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// Initialize policies
if (typeof window !== "undefined") {
  createDefaultPolicy();
  getTrustedPolicy(); // devboards-policy
}

export const trustHtml = (html: string) => {
  const policy = getTrustedPolicy();
  // If policy is undefined (e.g. on server or unsupported), we return the string.
  // If it exists, we use it.
  return policy ? (policy.createHTML(html) as unknown as string) : html;
};

export const trustScript = (script: string) => {
  const policy = getTrustedPolicy();
  return policy ? (policy.createScript(script) as unknown as string) : script;
};
