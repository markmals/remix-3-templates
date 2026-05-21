import { form, get, route } from "remix/routes";

export let routes = route({
    assets: get("/assets/*path"),
    guestBook: form("/"),
});
