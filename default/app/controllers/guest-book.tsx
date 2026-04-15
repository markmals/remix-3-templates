import type { Controller } from "remix/fetch-router";

import { Document } from "#/components/Document.tsx";
import { Welcome } from "#/components/Welcome.tsx";
import { GuestBook } from "#/data/schemas.ts";
import { CreateGuestBookEntry } from "#/data/schemas.ts";
import { routes } from "#/routes.ts";
import { render, frame } from "#/utils/render.tsx";
import * as s from "remix/data-schema";
import { Database } from "remix/data-table";
import { redirect } from "remix/response/redirect";

export default {
    actions: {
        async index(ctx) {
            let db = ctx.get(Database);
            let entries = await db.findMany(GuestBook);

            if (ctx.headers.get("x-remix-frame") === "welcome") {
                return frame(<Welcome entries={entries} />);
            }

            return render(<Document />);
        },
        async action(ctx) {
            let db = ctx.get(Database);
            let payload = s.parse(CreateGuestBookEntry, ctx.get(FormData));
            await db.create(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
} satisfies Controller<typeof routes.guestBook>;
