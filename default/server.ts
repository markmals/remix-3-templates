import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import { serve } from "remix/node-serve";

import router from "./app/entry.server.tsx";

const { PORT } = parseEnv(Env);

let server = serve(request => router.fetch(request), {
    port: PORT,
});

await server.ready;
console.log(`Server running at http://localhost:${server.port}`);
