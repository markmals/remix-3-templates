import * as s from "remix/data-schema";
import {
    clear,
    createStore,
    del,
    get as idbGet,
    keys,
    set as idbSet,
    type UseStore as IdbStore,
    update as idbUpdate,
    values,
} from "idb-keyval";

export interface Store<T> {
    schema: s.Schema<unknown, T>;
    getKey: (record: T) => IDBValidKey;
    idb: IdbStore;
}

export function store<T>({
    getKey = r => (r as { id: string }).id ?? "",
    ...options
}: {
    name: string;
    schema: s.Schema<unknown, T>;
    getKey?: (record: T) => IDBValidKey;
}): Store<T> {
    return {
        schema: options.schema,
        getKey: getKey,
        idb: createStore(options.name, "app-storage"),
    };
}

export type StoreRecord<S extends Store<any>> = S extends Store<infer T> ? T : never;

/**
 * Lightweight KV store backed by idb-keyval.
 * Records are keyed by the `key` function provided to `store()`.
 */
export class AppStorage {
    async has(store: Store<any>, key: IDBValidKey): Promise<boolean> {
        let allKeys = await keys(store.idb);
        return allKeys.includes(key);
    }

    async get<T>(store: Store<T>, key: IDBValidKey): Promise<T | undefined> {
        return (await idbGet(key, store.idb)) as T | undefined;
    }

    async getMany<T>(store: Store<T>): Promise<T[]> {
        let raw = await values(store.idb);
        return raw as T[];
    }

    async set<T>(store: Store<T>, value: Partial<T>): Promise<void> {
        let validated = s.parse(store.schema, value);
        await idbSet(store.getKey(validated), validated, store.idb);
    }

    async update<T>(
        store: Store<T>,
        key: IDBValidKey,
        updater: (current: T) => Partial<T>,
    ): Promise<void> {
        await idbUpdate<T>(
            key,
            current => {
                if (!current) throw new Error(`Record not found: ${String(key)}`);
                return s.parse(store.schema, { ...current, ...updater(current) });
            },
            store.idb,
        );
    }

    async delete(store: Store<any>, key: IDBValidKey): Promise<void> {
        await del(key, store.idb);
    }

    async deleteMany(store: Store<any>): Promise<void> {
        await clear(store.idb);
    }
}
