import { createAssetResolver } from "pitlane/assets";
import manifest from "pitlane/assets/manifest";

export let assets = createAssetResolver(manifest);
export let stylesheetHref = await assets.getHref("app/index.css");
export let stylesheets = await assets.getStylesheets("app/entry.server.tsx");
