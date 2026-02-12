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
    // Check if policy already exists to avoid duplicate error
    if (
      window.trustedTypes.getAttributeType("devboards-policy", "createHTML")
    ) {
      // We can't retrieve the object by name if created elsewhere, but we can assume it exists.
      // However, standard API doesn't expose a 'getPolicy'.
      // We must rely on our singleton 'devboardsPolicy' variable or try to create it.
    }

    try {
      devboardsPolicy = window.trustedTypes.createPolicy("devboards-policy", {
        createHTML: (string) => string, // Pass-through, relies on sanitize/validation at call site
        createScript: (string) => string,
        createScriptURL: (string) => string,
      });
      return devboardsPolicy;
    } catch (e) {
      console.warn(
        "TrustedType policy 'devboards-policy' failure (likely already exists):",
        e,
      );
      // We cannot recover the policy object if we didn't create it here in this scope/session mostly.
      // But for our app, this module should be the owner.
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
    try {
      // Browsers might have already created it (e.g. from our inline script in root.tsx)
      // Note: trustedTypes doesn't have a 'getPolicy', so we just try to create it if we don't have it.
      // But we can't create 'default' twice unless 'allow-duplicates' is set (which it is).
      return window.trustedTypes.createPolicy("default", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string,
      });
    } catch {
      // If it fails, it might already exist. We can't easily get the object back,
      // but the browser will use the existing one as fallback anyway.
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
