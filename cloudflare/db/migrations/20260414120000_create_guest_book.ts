import { GuestBook } from "#/data/schemas.ts";
import { createMigration } from "remix/data-table/migrations";

export default createMigration({
    async up({ schema }) {
        await schema.createTable(GuestBook, { ifNotExists: true });
    },
    async down({ schema }) {
        await schema.dropTable(GuestBook, { ifExists: true });
    },
});
