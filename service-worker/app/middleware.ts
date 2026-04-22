import { type Middleware } from "remix/fetch-router";
import { AppStorage } from "./data/app-storage";

export function storage(): Middleware {
    let storage = new AppStorage();

    return (ctx, next) => {
        ctx.set(AppStorage, storage);
        return next();
    };
}
