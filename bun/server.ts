import router from "#/entry.server.tsx";
import { parseEnv } from "#/utils/parse-env.ts";
import { serve } from "bun";
import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";

const { PORT } = parseEnv(s.object({ PORT: s.defaulted(coerce.number(), 3000) }));

let server = serve({
    port: PORT,
    fetch: request => router.fetch(request),
});

console.log(`Server running at http://localhost:${server.port}`);
