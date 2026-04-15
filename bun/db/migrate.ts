import { BunSqlDatabaseAdapter } from "../app/data/bun-sql-data-table.ts";
import { Env } from "../app/data/schemas.ts";
import { parseEnv } from "../app/utils/parse-env.ts";
import { SQL } from "bun";
import path from "node:path";
import * as s from "remix/data-schema";
import { createMigrationRunner } from "remix/data-table/migrations";
import { loadMigrations } from "remix/data-table/migrations/node";

const { DATABASE_URL } = parseEnv(Env);

let Direction = s.union([s.literal("up" as const), s.literal("down" as const)]);
let direction = s.parse(s.defaulted(Direction, "up"), process.argv[2]);
let to = process.argv[3];

let sql = new SQL(DATABASE_URL);
let adapter = new BunSqlDatabaseAdapter(sql, { dialect: "sqlite" });
let migrations = await loadMigrations(path.resolve("db/migrations"));
let runner = createMigrationRunner(adapter, migrations);

let result = await runner[direction]({ to });
console.log(direction + " complete", {
    applied: result.applied.map(entry => entry.id),
    reverted: result.reverted.map(entry => entry.id),
});
