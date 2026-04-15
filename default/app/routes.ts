import { route, form } from "remix/fetch-router/routes";

export let routes = route({
    guestBook: form("/"),
});
