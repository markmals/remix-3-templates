import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import * as s from "remix/data-schema";
import { loadMigrations } from "remix/data-table/migrations/node";
import { createSqliteDatabase } from "remix/data-table/sqlite";

const { DATABASE_URL } = parseEnv(Env);

let Direction = s.union([s.literal("up" as const), s.literal("down" as const)]);
let direction = s.parse(s.defaulted(Direction, "up"), process.argv[2]);
let to = process.argv[3];

let sqlite = new DatabaseSync(DATABASE_URL);
let db = createSqliteDatabase(sqlite);
let migrations = await loadMigrations(path.resolve("db/migrations"));
let result = await db.migrate(migrations, to ? { direction, to } : { direction });
console.log(direction + " complete", {
    applied: result.applied.map(entry => entry.id),
    reverted: result.reverted.map(entry => entry.id),
});
