import * as http from "node:http";
import { createRequestListener } from "remix/node-fetch-server";

import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";

import router from "./app/entry.server.tsx";

const { PORT } = parseEnv(Env);

let server = http.createServer(createRequestListener(request => router.fetch(request)));

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
