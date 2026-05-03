import { Env } from "#/data/schemas.ts";
import router from "#/router.tsx";
import { parseEnv } from "#/utils/parse-env.ts";
import { serve } from "remix/node-serve";

const { PORT } = parseEnv(Env);

let server = serve(request => router.fetch(request), {
    port: PORT,
});

await server.ready;
console.log(`Server running at http://localhost:${server.port}`);
