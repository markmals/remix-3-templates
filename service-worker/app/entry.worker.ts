import { TypedEventTarget } from "remix/ui";

import { router } from "#/router.ts";

declare const self: ServiceWorkerGlobalScope & TypedEventTarget<ServiceWorkerGlobalScopeEventMap>;

let { signal } = new AbortController();

self.addEventListener(
    "install",
    () => {
        self.skipWaiting();
    },
    { signal },
);

self.addEventListener(
    "activate",
    event => {
        event.waitUntil(self.clients.claim());
    },
    { signal },
);

self.addEventListener(
    "fetch",
    event => {
        let url = new URL(event.request.url);
        let sameOrigin = url.origin === location.origin;

        // Cross-origin requests: pass through
        if (!sameOrigin) return;

        // Vite internal requests: pass through
        if (url.pathname.startsWith("/@")) return;

        // Static assets and source files (anything with a file extension): pass through
        if (url.pathname.includes(".")) return;

        // Navigation and same-origin route requests → fetch router (after DB is ready)
        event.respondWith(router.fetch(event.request));
    },
    { signal },
);
