import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";
import { serve } from "remix/node-serve";

import router from "./app/entry.server.tsx";

let Env = s.object({ PORT: s.defaulted(coerce.number(), 1612) });
const { PORT } = s.parse(Env, process.env);

let server = serve((request) => router.fetch(request), {
  port: PORT,
});

await server.ready;
console.log(`Server running at http://localhost:${server.port}`);
