import * as http from "node:http";
import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";
import { createRequestListener } from "remix/node-fetch-server";

import router from "./app/entry.server.tsx";

let Env = s.object({ PORT: s.defaulted(coerce.number(), 1612) });
const { PORT } = s.parse(Env, process.env);

let server = http.createServer(createRequestListener((request) => router.fetch(request)));

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
