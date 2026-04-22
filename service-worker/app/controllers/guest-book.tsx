import type { Controller } from "remix/fetch-router";

import { Document } from "#/components/Document.tsx";
import { Welcome } from "#/components/Welcome.tsx";
import { GuestBook } from "#/data/schemas.ts";
import { CreateGuestBookEntry } from "#/data/schemas.ts";
import { routes } from "#/routes.ts";
import { render, frame } from "#/utils/render.tsx";
import * as s from "remix/data-schema";
import { redirect } from "remix/response/redirect";
import { AppStorage } from "#/data/app-storage.ts";

export default {
    actions: {
        async index(ctx) {
            let storage = ctx.get(AppStorage);
            let entries = await storage.getMany(GuestBook);

            if (ctx.headers.get("x-remix-frame") === "welcome") {
                return frame(<Welcome entries={entries} />);
            }

            return render(<Document url={ctx.url} />, ctx.url);
        },
        async action(ctx) {
            let storage = ctx.get(AppStorage);
            let payload = s.parse(CreateGuestBookEntry, ctx.get(FormData));
            await storage.set(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
} satisfies Controller<typeof routes.guestBook>;
