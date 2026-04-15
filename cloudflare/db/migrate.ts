import { D1DatabaseAdapter } from "#/data/d1-data-table.ts";
import path from "node:path";
import * as s from "remix/data-schema";
import { createMigrationRunner } from "remix/data-table/migrations";
import { loadMigrations } from "remix/data-table/migrations/node";
import { getPlatformProxy } from "wrangler";

let Direction = s.union([s.literal("up" as const), s.literal("down" as const)]);
let direction = s.parse(s.defaulted(Direction, "up"), process.argv[2]);
let to = process.argv[3];

let proxy = await getPlatformProxy<Env>({
  configPath: "./wrangler.jsonc",
  persist: true,
});

let adapter = new D1DatabaseAdapter(proxy.env.DB);
let migrations = await loadMigrations(path.resolve("db/migrations"));
let runner = createMigrationRunner(adapter, migrations);

try {
  let result = await runner[direction]({ to });
  console.log(direction + " complete", {
    applied: result.applied.map((entry) => entry.id),
    reverted: result.reverted.map((entry) => entry.id),
  });
} finally {
  await proxy.dispose();
  process.exit(0);
}
