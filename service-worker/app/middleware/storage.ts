import { type Middleware } from "remix/router";

import { AppStorage } from "#/data/app-storage.ts";

export function loadStorage(): Middleware<{
    key: typeof AppStorage;
    value: AppStorage;
    property: "storage";
}> {
    let storage = new AppStorage();

    return (context, next) => {
        context.set(AppStorage, storage, { property: "storage" });
        return next();
    };
}
