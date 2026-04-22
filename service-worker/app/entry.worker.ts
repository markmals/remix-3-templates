import { router } from "#/router.ts";
import { addEventListeners, TypedEventTarget } from "remix/component";

declare const self: ServiceWorkerGlobalScope & TypedEventTarget<ServiceWorkerGlobalScopeEventMap>;

let { signal } = new AbortController();

addEventListeners(self, signal, {
    install() {
        self.skipWaiting();
    },
    activate(event) {
        event.waitUntil(self.clients.claim());
    },
    fetch(event) {
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
});
