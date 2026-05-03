import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import { rmSync } from "node:fs";

const { DATABASE_URL } = parseEnv(Env);
rmSync(DATABASE_URL, { force: true });
