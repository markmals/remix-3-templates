import * as s from "remix/data-schema";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { Document } from "#/components/Document.tsx";
import { Welcome } from "#/components/Welcome.tsx";
import { CreateGuestBookEntry, GuestBook } from "#/data/schemas.ts";
import { routes } from "#/routes.ts";

export default createController(routes.guestBook, {
    actions: {
        async index({ storage, headers, render, url }) {
            let entries = await storage.getMany(GuestBook);

            if (headers.get("x-remix-target") === "welcome") {
                return render(<Welcome entries={entries} />);
            }

            return render(<Document url={url} />);
        },
        async action({ storage, formData }) {
            let payload = s.parse(CreateGuestBookEntry, formData);
            await storage.set(GuestBook, payload);
            return redirect(routes.guestBook.index.href());
        },
    },
});
