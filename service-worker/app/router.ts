import guestBook from "#/actions/guest-book.tsx";
import { storage } from "#/middleware.ts";
import { routes } from "#/routes.ts";
import { formData } from "remix/middleware/form-data";
import { createRouter } from "remix/router";

export let router = createRouter({
    middleware: [formData(), storage()],
});

router.map(routes.guestBook, guestBook);
