import guestBook from "#/controllers/guest-book.tsx";
import { storage } from "#/middleware.ts";
import { routes } from "#/routes.ts";
import { createRouter } from "remix/fetch-router";
import { formData } from "remix/form-data-middleware";

export let router = createRouter({
    middleware: [formData(), storage()],
});

router.map(routes.guestBook, guestBook);
