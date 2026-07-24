import { Database as Sqlite } from "bun:sqlite";
import path from "node:path";
import * as s from "remix/data-schema";
import { createMigrationRunner } from "remix/data-table/migrations";
import { loadMigrations } from "remix/data-table/migrations/node";
import { SqliteDatabaseAdapter } from "remix/data-table/sqlite";

import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";

const { DATABASE_URL } = parseEnv(Env);

let Direction = s.union([s.literal("up" as const), s.literal("down" as const)]);
let direction = s.parse(s.defaulted(Direction, "up"), process.argv[2]);
let to = process.argv[3];

let sqlite = new Sqlite(DATABASE_URL);
let adapter = new SqliteDatabaseAdapter(sqlite);
let migrations = await loadMigrations(path.resolve("db/migrations"));
let runner = createMigrationRunner(adapter, migrations);

let result = await runner[direction]({ to });
console.log(direction + " complete", {
    applied: result.applied.map(entry => entry.id),
    reverted: result.reverted.map(entry => entry.id),
});
