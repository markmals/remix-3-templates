import { form, get, route } from "remix/fetch-router/routes";

export let routes = route({
    assets: get("/assets/*path"),
    guestBook: form("/"),
});
