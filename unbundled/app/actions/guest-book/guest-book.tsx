import { Welcome } from "#/actions/guest-book/welcome.tsx";
import { CreateGuestBookEntry, GuestBook } from "#/data/schemas.ts";
import { Document } from "#/layouts/document.tsx";
import { routes } from "#/routes.ts";
import { frame, render } from "#/utils/render.tsx";
import * as s from "remix/data-schema";
import { Database } from "remix/data-table";
import { createHtmlResponse as html } from "remix/response/html";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

export default createController(routes.guestBook, {
    actions: {
        async index(ctx) {
            let db = ctx.get(Database);
            let entries = await db.findMany(GuestBook);

            if (ctx.headers.get("x-remix-target") === "welcome") {
                return frame(render(<Welcome entries={entries} />));
            }

            return html(render(<Document />));
        },
        async action(ctx) {
            let db = ctx.get(Database);
            let payload = s.parse(CreateGuestBookEntry, ctx.formData);
            await db.create(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
});
