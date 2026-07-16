import { form, get, route } from "remix/routes";

export const ASSETS_BASE = "/assets";

export let routes = route({
    assets: get(`${ASSETS_BASE}/*path`),
    guestBook: form("/"),
});
