import { readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "db/migrations";

// Wrangler reads flat `<name>.sql` files from `migrations_dir`. Our source migrations
// are `<timestamp>_<slug>/up.sql`, so mirror each `up.sql` into a sibling `<timestamp>_<slug>.sql`.
for (let entry of readdirSync(MIGRATIONS_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".sql")) {
        unlinkSync(join(MIGRATIONS_DIR, entry.name));
    }
}

for (let entry of readdirSync(MIGRATIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let sql = readFileSync(join(MIGRATIONS_DIR, entry.name, "up.sql"), "utf8");
    writeFileSync(join(MIGRATIONS_DIR, `${entry.name}.sql`), sql);
}

process.exit(0);
