import { Env } from "#/data/schemas.ts";
import router from "#/entry.server.tsx";
import { parseEnv } from "#/utils/parse-env.ts";
import { serve } from "bun";

const { PORT } = parseEnv(Env);

let server = serve({
    port: PORT,
    fetch: request => router.fetch(request),
});

console.log(`Server running at http://localhost:${server.port}`);
