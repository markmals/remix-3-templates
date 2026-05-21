import { route, get } from "remix/routes";

export let routes = route({
    home: get("/"),
});
