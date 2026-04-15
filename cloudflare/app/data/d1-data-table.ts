import type {
    AdapterCapabilities,
    DataManipulationOperation,
    DataManipulationRequest,
    DataManipulationResult,
    DataMigrationOperation,
    DataMigrationRequest,
    DataMigrationResult,
    DatabaseAdapter,
    SqlStatement,
    TableRef,
    TransactionOptions,
    TransactionToken,
} from "remix/data-table";

import { getTablePrimaryKey } from "remix/data-table";
import { SqliteDatabaseAdapter } from "remix/data-table-sqlite";

// The SQLite adapter's compileSql method is pure SQL generation —
// it never touches the database instance, so null is safe here.
let compiler = new SqliteDatabaseAdapter(null as never);

// D1 forbids SQL-level BEGIN/COMMIT/ROLLBACK/SAVEPOINT statements.
// It provides d1.batch() for atomic multi-statement execution instead,
// but that API is incompatible with the adapter's streaming transaction model.
const CAPABILITIES: AdapterCapabilities = {
    returning: true,
    savepoints: false,
    upsert: true,
    transactionalDdl: false,
    migrationLock: false,
};

/**
 * DatabaseAdapter implementation for Cloudflare D1.
 * Uses the built-in SQLite adapter for SQL compilation and D1's
 * async prepared-statement API for execution.
 */
export class D1DatabaseAdapter implements DatabaseAdapter {
    dialect = "sqlite";
    capabilities: AdapterCapabilities = { ...CAPABILITIES };
    #d1: D1Database;

    constructor(d1: D1Database) {
        this.#d1 = d1;
    }

    compileSql(operation: DataManipulationOperation | DataMigrationOperation): SqlStatement[] {
        return compiler.compileSql(operation);
    }

    async execute(request: DataManipulationRequest): Promise<DataManipulationResult> {
        // Short-circuit empty bulk inserts
        if (request.operation.kind === "insertMany" && request.operation.values.length === 0) {
            return {
                affectedRows: 0,
                insertId: undefined,
                rows: request.operation.returning ? [] : undefined,
            };
        }

        let statement = this.compileSql(request.operation)[0];
        let prepared = this.#d1.prepare(statement.text).bind(...statement.values);

        // Reader operations (SELECT, COUNT, EXISTS) and writes with RETURNING
        if (isReaderOperation(request.operation)) {
            let result = await prepared.all();
            let rows = normalizeRows(result.results as Record<string, unknown>[]);

            if (request.operation.kind === "count" || request.operation.kind === "exists") {
                rows = normalizeCountRows(rows);
            }

            return {
                rows,
                affectedRows: isWriteKind(request.operation.kind) ? rows.length : undefined,
                insertId: extractInsertIdFromRows(request.operation, rows),
            };
        }

        // Write operation without RETURNING clause
        let result = await prepared.run();

        return {
            affectedRows: isWriteKind(request.operation.kind) ? result.meta.changes : undefined,
            insertId: extractInsertIdFromMeta(request.operation, result.meta),
        };
    }

    async migrate(request: DataMigrationRequest): Promise<DataMigrationResult> {
        let statements = this.compileSql(request.operation);
        for (let statement of statements) {
            await this.#d1
                .prepare(statement.text)
                .bind(...statement.values)
                .run();
        }
        return { affectedOperations: statements.length };
    }

    async hasTable(table: TableRef, _transaction?: TransactionToken): Promise<boolean> {
        let masterTable = table.schema
            ? quoteIdentifier(table.schema) + ".sqlite_master"
            : "sqlite_master";
        let result = await this.#d1
            .prepare("select 1 from " + masterTable + " where type = ? and name = ? limit 1")
            .bind("table", table.name)
            .all();
        return result.results.length > 0;
    }

    async hasColumn(
        table: TableRef,
        column: string,
        _transaction?: TransactionToken,
    ): Promise<boolean> {
        let result = await this.#d1
            .prepare("select name from pragma_table_info(" + quoteIdentifier(table.name) + ")")
            .all();
        return (result.results as Record<string, unknown>[]).some(row => row.name === column);
    }

    async beginTransaction(_options?: TransactionOptions): Promise<TransactionToken> {
        throw new Error("D1 does not support SQL transactions — use d1.batch() for atomicity");
    }

    async commitTransaction(_token: TransactionToken): Promise<void> {
        throw new Error("D1 does not support SQL transactions — use d1.batch() for atomicity");
    }

    async rollbackTransaction(_token: TransactionToken): Promise<void> {
        throw new Error("D1 does not support SQL transactions — use d1.batch() for atomicity");
    }

    async createSavepoint(_token: TransactionToken, _name: string): Promise<void> {
        throw new Error("D1 does not support savepoints — use d1.batch() for atomicity");
    }

    async rollbackToSavepoint(_token: TransactionToken, _name: string): Promise<void> {
        throw new Error("D1 does not support savepoints — use d1.batch() for atomicity");
    }

    async releaseSavepoint(_token: TransactionToken, _name: string): Promise<void> {
        throw new Error("D1 does not support savepoints — use d1.batch() for atomicity");
    }
}

/**
 * Creates a D1 DatabaseAdapter.
 */
export function createD1DatabaseAdapter(d1: D1Database): D1DatabaseAdapter {
    return new D1DatabaseAdapter(d1);
}

// --- Helpers ---

function quoteIdentifier(value: string): string {
    return '"' + value.replace(/"/g, '""') + '"';
}

function isReaderOperation(operation: DataManipulationOperation): boolean {
    if (operation.kind === "select" || operation.kind === "count" || operation.kind === "exists") {
        return true;
    }
    // Raw SQL: inspect the statement text to determine read vs write
    if (operation.kind === "raw") {
        let text = operation.sql.text.trimStart().toLowerCase();
        return text.startsWith("select") || text.startsWith("pragma") || text.startsWith("explain");
    }
    // Write operations with a RETURNING clause produce rows
    if ("returning" in operation && operation.returning) {
        return true;
    }
    return false;
}

const WRITE_KINDS = new Set(["insert", "insertMany", "update", "delete", "upsert"]);
const INSERT_KINDS = new Set(["insert", "insertMany", "upsert"]);

function isWriteKind(kind: string): boolean {
    return WRITE_KINDS.has(kind);
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    return rows.map(row => {
        if (typeof row !== "object" || row === null) return {};
        return { ...row };
    });
}

function normalizeCountRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    return rows.map(row => {
        let count = row.count;
        if (typeof count === "string") {
            let numeric = Number(count);
            if (!Number.isNaN(numeric)) return { ...row, count: numeric };
        }
        if (typeof count === "bigint") return { ...row, count: Number(count) };
        return row;
    });
}

function extractInsertIdFromRows(
    operation: DataManipulationOperation,
    rows: Record<string, unknown>[],
): unknown {
    if (!INSERT_KINDS.has(operation.kind) || !("table" in operation)) return undefined;
    let primaryKey = getTablePrimaryKey(operation.table);
    if (primaryKey.length !== 1) return undefined;
    let row = rows[rows.length - 1];
    return row ? row[primaryKey[0]] : undefined;
}

function extractInsertIdFromMeta(
    operation: DataManipulationOperation,
    meta: { last_row_id: number },
): unknown {
    if (!INSERT_KINDS.has(operation.kind) || !("table" in operation)) return undefined;
    if (getTablePrimaryKey(operation.table).length !== 1) return undefined;
    return meta.last_row_id;
}
