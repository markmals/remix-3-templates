import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";

export function id() {
    return s.defaulted(s.string(), () => crypto.randomUUID());
}

export function now() {
    return s.defaulted(coerce.date(), () => new Date());
}
