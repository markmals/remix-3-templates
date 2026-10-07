import { type ScriptEntry } from "remix/assets";

import characterCounterHref from "#/components/CharacterCounter.tsx?url";

/**
 * Browser module URLs for this app's islands, keyed by the source key the
 * `remix()` plugin writes into each `clientEntry()` call (`file:<key>#<Export>`).
 *
 * The server-rendered templates build this from `pitlane/assets/manifest`,
 * which describes a *server* module graph. This app's server is a Service
 * Worker: it runs in the browser, inside the client module graph, and the
 * manifest refuses to load there. Vite's own `?url` imports name the same
 * modules, and they are already how the document finds its browser entry and
 * its stylesheet, so islands resolve the same way.
 *
 * Add an entry here for every new island the Service Worker renders.
 */
const ISLAND_HREFS: Record<string, string> = {
    "app/components/CharacterCounter.tsx": characterCounterHref,
};

/**
 * The resolver `render({ assets })` calls to turn an island's source key into
 * the browser module that hydrates it.
 */
export let assets = {
    async getScriptEntry(sourceId: string): Promise<ScriptEntry> {
        let key = sourceId.startsWith("file:") ? sourceId.slice("file:".length) : sourceId;
        let href = ISLAND_HREFS[key];

        if (href === undefined) {
            throw new Error(`No browser module registered for island '${key}' in app/assets.ts`);
        }

        return { href, importMap: { imports: {} }, preloads: [] };
    },
};
