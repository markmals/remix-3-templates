import * as s from "remix/data-schema";
import * as f from "remix/data-schema/form-data";
import type { StoreRecord } from "./app-storage.ts";
import { store } from "./app-storage.ts";
import * as storage from "./schema-helpers.ts";

export let GuestBook = store({
    name: "guest_book",
    schema: s.object({
        id: storage.id(),
        name: s.string(),
        message: s.string(),
        createdAt: storage.now(),
    }),
});

export type GuestBookEntry = StoreRecord<typeof GuestBook>;

export let CreateGuestBookEntry = f.object({
    name: f.field(s.string()),
    message: f.field(s.string()),
});
