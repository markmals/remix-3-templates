import * as s from "remix/data-schema";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { Document } from "#/components/Document.tsx";
import { Welcome } from "#/components/Welcome.tsx";
import { CreateGuestBookEntry, GuestBook } from "#/data/schemas.ts";
import { routes } from "#/routes.ts";

export default createController(routes.guestBook, {
    actions: {
        async index({ db, headers, render }) {
            let entries = await db.findMany(GuestBook);

            if (headers.get("x-remix-target") === "welcome") {
                return render(<Welcome entries={entries} />);
            }

            return render(<Document />);
        },
        async action({ db, formData }) {
            let payload = s.parse(CreateGuestBookEntry, formData);
            await db.create(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
});
