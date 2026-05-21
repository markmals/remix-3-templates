import { route, form } from "remix/routes";

export let routes = route({
    guestBook: form("/"),
});
