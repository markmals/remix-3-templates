import { createRequestListener } from "remix/node-fetch-server";
import http from "node:http";
import router from "./app/entry.server.tsx";

let port = process.env.PORT || 3000;

let server = http.createServer(createRequestListener(request => router.fetch(request)));

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
