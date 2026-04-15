import { D1DatabaseAdapter } from "#/data/d1-data-table.ts";
import { env } from "cloudflare:workers";
import { Database } from "remix/data-table";
import { type Middleware } from "remix/fetch-router";

export function database(): Middleware {
    let adapter = new D1DatabaseAdapter(env.DB);
    let db = new Database(adapter);

    return (ctx, next) => {
        ctx.set(Database, db);
        return next();
    };
}
