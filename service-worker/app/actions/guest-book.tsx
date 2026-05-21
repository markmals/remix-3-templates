import { Document } from "#/components/Document.tsx";
import { Welcome } from "#/components/Welcome.tsx";
import { AppStorage } from "#/data/app-storage.ts";
import { CreateGuestBookEntry, GuestBook } from "#/data/schemas.ts";
import { routes } from "#/routes.ts";
import { frame, render } from "#/utils/render.tsx";
import * as s from "remix/data-schema";
import { createHtmlResponse as html } from "remix/response/html";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

export default createController(routes.guestBook, {
    actions: {
        async index(ctx) {
            let storage = ctx.get(AppStorage);
            let entries = await storage.getMany(GuestBook);

            if (ctx.headers.get("x-remix-target") === "welcome") {
                return frame(render(<Welcome entries={entries} />, ctx.url));
            }

            return html(render(<Document url={ctx.url} />, ctx.url));
        },
        async action(ctx) {
            let storage = ctx.get(AppStorage);
            let payload = s.parse(CreateGuestBookEntry, ctx.formData);
            await storage.set(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
});
