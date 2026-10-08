import { createAssetResolver } from "pitlane/assets";
import manifest from "pitlane/assets/manifest";

export let assets = createAssetResolver(manifest);
export let scriptEntry = await assets.getScriptEntry("app/entry.browser.ts");
export let stylesheetHref = await assets.getHref("app/styles/preflight.css");
export let stylesheets = await assets.getStylesheets("app/entry.server.tsx");
