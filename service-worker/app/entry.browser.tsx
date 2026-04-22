import { navigate, run } from "remix/component";
import entry from "#/entry.worker.ts?url";

if (!navigator.serviceWorker.controller) {
    await navigator.serviceWorker.register(entry, { type: "module", scope: "/" });
    location.reload();
} else {
    // Must be registered before `run` so `event.preventDefault` works properly
    //
    // - Form submissions: GET via soft-navigate, utilizing the button[rmx-target] attribute
    // - Form submissions: POST via fetch, then soft-navigate to the redirect URL
    navigation.addEventListener("navigate", async event => {
        if (!event.canIntercept) return;

        // triggered programatically, handled by built-in listener
        if (!event.sourceElement) return;
        // anchors handled by built-in listener
        if (event.sourceElement.closest("a, area")) return;

        // sourceElement is <button type="submit"> inside of form submissions
        let target = event.sourceElement.getAttribute("rmx-target") ?? undefined;
        let src = event.sourceElement.getAttribute("rmx-src") ?? undefined;
        let resetScroll = event.sourceElement.hasAttribute("rmx-reset-scroll") ?? undefined;

        // Form POST submission
        if (event.formData) {
            event.intercept({
                focusReset: "manual",
                async handler() {
                    let response = await fetch(event.destination.url, {
                        method: "POST",
                        body: event.formData,
                        signal: event.signal,
                    });

                    await navigate(response.url, { target, src, resetScroll });

                    // FIXME:
                    // Workaround: Remix's Frame morphing preserves form input
                    // values and clientEntry state when the response comes from
                    // a service worker. Reset forms and re-trigger input handlers
                    // so clientEntry components (like CharacterCounter) recalculate.
                    for (let form of document.querySelectorAll("form")) {
                        form.reset();
                        for (let element of form.querySelectorAll("textarea, input")) {
                            element.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                    }
                },
            });
            return;
        }

        // Form GET submission
        event.preventDefault();
        await navigate(event.destination.url, { target, src, resetScroll });
    });

    run({
        async loadModule(moduleUrl, exportName) {
            let mod = await import(/* @vite-ignore */ moduleUrl);
            let exported = mod[exportName];

            if (typeof exported !== "function") {
                throw new TypeError(
                    `Expected export '${exportName}' from '${moduleUrl}' to be a function`,
                );
            }

            return exported;
        },
        async resolveFrame(src, signal, target) {
            let headers = new Headers({ accept: "text/html" });
            if (target) headers.set("x-remix-frame", target);
            let response = await fetch(src, { headers, signal });
            return response.body ?? (await response.text());
        },
    });
}
