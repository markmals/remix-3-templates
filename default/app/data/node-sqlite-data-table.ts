import type { DatabaseSync, SQLInputValue } from "node:sqlite";
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

// Reuse the SQLite SQL compiler without a real better-sqlite3 instance.
let compiler = new SqliteDatabaseAdapter(null as never);

const READER_PREFIXES = ["select", "pragma", "with", "explain"];
const WRITE_KINDS = new Set(["insert", "insertMany", "update", "delete", "upsert"]);
const INSERT_KINDS = new Set(["insert", "insertMany", "upsert"]);

/**
 * `DatabaseAdapter` implementation for the built-in `node:sqlite` module.
 */
export class NodeSqliteDatabaseAdapter implements DatabaseAdapter {
    dialect = "sqlite";
    capabilities: AdapterCapabilities;
    #db: DatabaseSync;
    #transactions = new Set<string>();
    #transactionCounter = 0;

    constructor(db: DatabaseSync) {
        this.#db = db;
        this.capabilities = {
            returning: true,
            savepoints: true,
            upsert: true,
            transactionalDdl: true,
            migrationLock: false,
        };
    }

    compileSql(operation: DataManipulationOperation | DataMigrationOperation): SqlStatement[] {
        return compiler.compileSql(operation);
    }

    async execute(request: DataManipulationRequest): Promise<DataManipulationResult> {
        if (request.operation.kind === "insertMany" && request.operation.values.length === 0) {
            return {
                affectedRows: 0,
                insertId: undefined,
                rows: request.operation.returning ? [] : undefined,
            };
        }

        let statement = this.compileSql(request.operation)[0];

        try {
            let prepared = this.#db.prepare(statement.text);

            if (isReaderOperation(request.operation)) {
                let rows = normalizeRows(
                    prepared.all(...toSqliteValues(statement.values)) as Record<string, unknown>[],
                );

                if (request.operation.kind === "count" || request.operation.kind === "exists") {
                    rows = normalizeCountRows(rows);
                }

                return {
                    rows,
                    affectedRows: WRITE_KINDS.has(request.operation.kind) ? rows.length : undefined,
                    insertId: extractInsertIdFromRows(request.operation, rows),
                };
            }

            let result = prepared.run(...toSqliteValues(statement.values));

            return {
                affectedRows: WRITE_KINDS.has(request.operation.kind)
                    ? (result.changes as number)
                    : undefined,
                insertId: extractInsertIdFromRun(request.operation, result),
            };
        } catch (error) {
            console.error(
                `[node-sqlite] SQL: ${statement.text}\n  Values:`,
                statement.values,
                "\n  Error:",
                error,
            );
            throw error;
        }
    }

    async migrate(request: DataMigrationRequest): Promise<DataMigrationResult> {
        let statements = this.compileSql(request.operation);
        for (let statement of statements) {
            if (statement.values.length === 0) {
                this.#db.exec(statement.text);
            } else {
                this.#db.prepare(statement.text).run(...toSqliteValues(statement.values));
            }
        }
        return { affectedOperations: statements.length };
    }

    async hasTable(table: TableRef, transaction?: TransactionToken): Promise<boolean> {
        if (transaction) this.#assertTransaction(transaction);
        let masterTable = table.schema
            ? quoteIdentifier(table.schema) + ".sqlite_master"
            : "sqlite_master";
        let rows = this.#db
            .prepare("select 1 from " + masterTable + " where type = ? and name = ? limit 1")
            .all("table", table.name) as unknown[];
        return rows.length > 0;
    }

    async hasColumn(
        table: TableRef,
        column: string,
        transaction?: TransactionToken,
    ): Promise<boolean> {
        if (transaction) this.#assertTransaction(transaction);
        let rows = this.#db
            .prepare("select name from pragma_table_info('" + table.name.replace(/'/g, "''") + "')")
            .all() as Record<string, unknown>[];
        return rows.some(row => row.name === column);
    }

    async beginTransaction(options?: TransactionOptions): Promise<TransactionToken> {
        if (options?.isolationLevel === "read uncommitted") {
            this.#db.exec("pragma read_uncommitted = true");
        }
        this.#db.exec("begin");
        this.#transactionCounter += 1;
        let token = { id: "tx_" + String(this.#transactionCounter) };
        this.#transactions.add(token.id);
        return token;
    }

    async commitTransaction(token: TransactionToken): Promise<void> {
        this.#assertTransaction(token);
        this.#db.exec("commit");
        this.#transactions.delete(token.id);
    }

    async rollbackTransaction(token: TransactionToken): Promise<void> {
        this.#assertTransaction(token);
        this.#db.exec("rollback");
        this.#transactions.delete(token.id);
    }

    async createSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        this.#db.exec("savepoint " + quoteIdentifier(name));
    }

    async rollbackToSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        this.#db.exec("rollback to savepoint " + quoteIdentifier(name));
    }

    async releaseSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        this.#db.exec("release savepoint " + quoteIdentifier(name));
    }

    #assertTransaction(token: TransactionToken): void {
        if (!this.#transactions.has(token.id)) {
            throw new Error("Unknown transaction token: " + token.id);
        }
    }
}

function isReaderOperation(operation: DataManipulationOperation): boolean {
    if (operation.kind === "select" || operation.kind === "count" || operation.kind === "exists") {
        return true;
    }

    if (operation.kind === "raw") {
        let text = operation.sql.text.trimStart().toLowerCase();
        return READER_PREFIXES.some(prefix => text.startsWith(prefix));
    }

    if ("returning" in operation && operation.returning) {
        return true;
    }

    return false;
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    return rows.map(row => (typeof row === "object" && row !== null ? { ...row } : {}));
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

function extractInsertIdFromRun(
    operation: DataManipulationOperation,
    result: { changes: number | bigint; lastInsertRowid: number | bigint },
): unknown {
    if (!INSERT_KINDS.has(operation.kind) || !("table" in operation)) return undefined;
    if (getTablePrimaryKey(operation.table).length !== 1) return undefined;
    return typeof result.lastInsertRowid === "bigint"
        ? Number(result.lastInsertRowid)
        : result.lastInsertRowid;
}

function quoteIdentifier(value: string): string {
    return '"' + value.replace(/"/g, '""') + '"';
}

/** Convert values to types accepted by node:sqlite (booleans → 0/1). */
function toSqliteValues(values: unknown[]): SQLInputValue[] {
    return values.map(v => {
        if (typeof v === "boolean") return v ? 1 : 0;
        return v as SQLInputValue;
    });
}
