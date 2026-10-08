import { assetServer } from "#/utils/assets.ts";
import * as path from "node:path";
import { type ScriptEntry } from "remix/assets";
import { getContext } from "remix/middleware/async-context";
import { createContextKey, type Middleware } from "remix/router";

interface AssetEntry {
    script: ScriptEntry;
    stylesheetHref: string;
}

let assetsEntryKey = createContextKey<AssetEntry>();
let defaultScriptEntry = path.resolve(import.meta.dirname, "../assets/entry.ts");
let defaultStylesheetEntry = path.resolve(import.meta.dirname, "../assets/preflight.css");

export function loadAssetEntry(
    scriptEntry = defaultScriptEntry,
    stylesheetEntry = defaultStylesheetEntry,
): Middleware<{ key: typeof assetsEntryKey; value: AssetEntry }> {
    return async (context, next) => {
        let [script, stylesheetHref] = await Promise.all([
            assetServer.getScriptEntry(scriptEntry),
            assetServer.getHref(stylesheetEntry),
        ]);

        context.set(assetsEntryKey, { script, stylesheetHref });
        return next();
    };
}

export function getAssetEntry(): AssetEntry {
    return getContext().get(assetsEntryKey);
}
