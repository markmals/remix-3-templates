import { Env } from "#/data/schemas.ts";
import router from "#/router.tsx";
import { parseEnv } from "#/utils/parse-env.ts";
import * as http from "node:http";
import { createRequestListener } from "remix/node-fetch-server";

const { PORT } = parseEnv(Env);

let server = http.createServer(createRequestListener(request => router.fetch(request)));

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
