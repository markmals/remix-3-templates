import { column as c, table } from "remix/data-table";
import { createMigration } from "remix/data-table/migrations";

export let GuestBook = table({
    name: "guest_book",
    columns: {
        id: c.integer().primaryKey(),
        name: c.text().notNull(),
        message: c.text().notNull(),
        createdAt: c.timestamp().defaultNow(),
    },
});

export default createMigration({
    async up({ schema }) {
        await schema.createTable(GuestBook, { ifNotExists: true });
    },
    async down({ schema }) {
        await schema.dropTable(GuestBook, { ifExists: true });
    },
});
