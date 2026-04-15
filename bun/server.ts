import router from "#/entry.server.tsx";

const PORT = process.env.PORT || 3000;

Bun.serve({
    port: PORT,
    fetch: request => router.fetch(request),
});

console.log(`Server running at http://localhost:${PORT}`);
