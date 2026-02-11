/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is rendered outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import {
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
import Root from "./root";
import { requestStore } from "./utils/async-store";
export default function (opts: RenderToStreamOptions) {
  const serverData = opts.serverData as unknown as Record<string, unknown>;
  const qwikCityContext = serverData?.qwikcity as Record<string, unknown>;
  const ev = qwikCityContext?.ev as Record<string, unknown>;
  const sharedMap = ev?.sharedMap as Map<string, unknown>;

  const nonce =
    (sharedMap?.get?.("nonce") as string | undefined) ||
    requestStore.getStore()?.nonce ||
    (serverData?.nonce as string | undefined);

  return requestStore.run({ nonce }, () => {
    return renderToStream(<Root />, {
      ...opts,
      serverData: {
        ...opts.serverData,
        nonce,
      },
      // Pass nonce to the container (html)
      // We put nonce at the end of containerAttributes to ensure it's not overridden by ...opts
      containerAttributes: {
        lang: "it",
        ...opts.containerAttributes,
        ...(nonce ? { nonce } : {}),
      },
      // Ensure Qwik loader and other internal scripts pick up the nonce
      qwikLoader: {
        include: "always",
        ...(((opts as unknown as Record<string, unknown>).qwikLoader as Record<
          string,
          unknown
        >) || {}),
      },
    });
  });
}
