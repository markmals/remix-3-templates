import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";
import * as f from "remix/data-schema/form-data";
import { column as c, table, type TableRow } from "remix/data-table";

export let Env = s.object({
  DATABASE_URL: s.string(),
  PORT: s.defaulted(coerce.number(), 1612),
});

export let GuestBook = table({
  name: "guest_book",
  columns: {
    id: c.integer().primaryKey(),
    name: c.text().notNull(),
    message: c.text().notNull(),
    createdAt: c.timestamp().defaultNow(),
  },
});

export type GuestBookEntry = TableRow<typeof GuestBook>;

export let CreateGuestBookEntry = f.object({
  name: f.field(s.string()),
  message: f.field(s.string()),
});
