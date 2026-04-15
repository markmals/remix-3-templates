import assert from "node:assert";
import * as s from "remix/data-schema";

export function parseEnv<EnvironmentVariables extends Record<string, any>>(
    schema: s.Schema<unknown, EnvironmentVariables>,
) {
    let env = s.parseSafe(schema, process.env);
    let Path = s.optional(s.array(s.string()));
    let issues = !env.success
        ? env.issues.map(e => s.parse(Path, e.path)?.join(" ")).filter(Boolean)
        : [];
    let value = env.success ? env.value : null;

    assert(value, `\n\nMust provide the following environment variables:\n${issues.join("\n")}\n`);

    return value;
}
