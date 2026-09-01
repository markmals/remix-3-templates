import { navigate, run } from "remix/ui";

// Must be registered before `run` so `event.preventDefault` works properly
//
// - Form submissions: GET via soft-navigate, utilizing the button[data-rmx-target] attribute
// - Form submissions: POST via fetch, then soft-navigate to the redirect URL
navigation.addEventListener("navigate", async event => {
    if (!event.canIntercept) return;

    // triggered programatically, handled by built-in listener
    if (!event.sourceElement) return;
    // anchors handled by built-in listener
    if (event.sourceElement.closest("a, area")) return;

    // sourceElement is <button type="submit"> inside of form submissions
    let target = event.sourceElement.getAttribute("data-rmx-target") ?? undefined;
    let src = event.sourceElement.getAttribute("data-rmx-src") ?? undefined;
    let resetScroll = event.sourceElement.hasAttribute("data-rmx-reset-scroll") ?? undefined;

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
    async resolveFrame(src, options) {
        let headers = new Headers({ accept: "text/html" });
        if (options?.target) headers.set("x-remix-frame", options.target);
        let response = await fetch(src, { headers, signal: options?.signal });
        return response.body ?? (await response.text());
    },
});
