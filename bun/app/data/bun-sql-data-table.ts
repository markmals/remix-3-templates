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

import { SQL } from "bun";
import { getTablePrimaryKey } from "remix/data-table";
import { MysqlDatabaseAdapter } from "remix/data-table-mysql";
import { PostgresDatabaseAdapter } from "remix/data-table-postgres";
import { SqliteDatabaseAdapter } from "remix/data-table-sqlite";

export type BunSqlDialect = "sqlite" | "postgres" | "mysql";

// Each adapter's compileSql method performs pure SQL generation and never
// touches the database instance, so passing null is safe for compilation.
let compilerCache: Partial<Record<BunSqlDialect, DatabaseAdapter>> = {};

function getCompiler(dialect: BunSqlDialect): DatabaseAdapter {
    return (compilerCache[dialect] ??= createCompiler(dialect));
}

function createCompiler(dialect: BunSqlDialect): DatabaseAdapter {
    switch (dialect) {
        case "sqlite":
            return new SqliteDatabaseAdapter(null as never);
        case "postgres":
            return new PostgresDatabaseAdapter(null as never);
        case "mysql":
            return new MysqlDatabaseAdapter(null as never);
    }
}

const CAPABILITIES: Record<BunSqlDialect, AdapterCapabilities> = {
    sqlite: {
        returning: true,
        savepoints: true,
        upsert: true,
        transactionalDdl: true,
        migrationLock: false,
    },
    postgres: {
        returning: true,
        savepoints: true,
        upsert: true,
        transactionalDdl: true,
        migrationLock: true,
    },
    mysql: {
        returning: false,
        savepoints: true,
        upsert: true,
        transactionalDdl: false,
        migrationLock: true,
    },
};

/**
 * DatabaseAdapter implementation backed by Bun.SQL.
 * Supports SQLite, PostgreSQL, and MySQL through Bun's unified SQL API.
 */
export class BunSqlDatabaseAdapter implements DatabaseAdapter {
    dialect: string;
    capabilities: AdapterCapabilities;
    #sql: SQL;
    #compiler: DatabaseAdapter;
    #transactions = new Set<string>();
    #transactionCounter = 0;

    constructor(sql: SQL, options: { dialect: BunSqlDialect }) {
        this.#sql = sql;
        this.dialect = options.dialect;
        this.#compiler = getCompiler(options.dialect);
        this.capabilities = { ...CAPABILITIES[options.dialect] };
    }

    compileSql(operation: DataManipulationOperation | DataMigrationOperation): SqlStatement[] {
        return this.#compiler.compileSql(operation);
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

        // Reader operations (SELECT, COUNT, EXISTS) and writers with RETURNING
        if (isReaderOperation(request.operation)) {
            let rows = normalizeRows(
                await this.#sql.unsafe(statement.text, statement.values as unknown[]),
            );
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
        await this.#sql.unsafe(statement.text, statement.values as unknown[]);
        let meta = await this.#getWriteMetadata();

        return {
            affectedRows: isWriteKind(request.operation.kind) ? meta.changes : undefined,
            insertId: extractInsertIdFromMeta(request.operation, meta),
        };
    }

    async migrate(request: DataMigrationRequest): Promise<DataMigrationResult> {
        let statements = this.compileSql(request.operation);
        for (let statement of statements) {
            await this.#sql.unsafe(statement.text, statement.values as unknown[]);
        }
        return { affectedOperations: statements.length };
    }

    async hasTable(table: TableRef, transaction?: TransactionToken): Promise<boolean> {
        if (transaction) this.#assertTransaction(transaction);

        if (this.dialect === "sqlite") {
            let masterTable = table.schema
                ? quoteIdentifier(table.schema) + ".sqlite_master"
                : "sqlite_master";
            let rows = await this.#sql.unsafe(
                "select 1 from " + masterTable + " where type = ? and name = ? limit 1",
                ["table", table.name],
            );
            return rows.length > 0;
        }

        if (this.dialect === "postgres") {
            let rows = await this.#sql.unsafe(
                "select 1 from information_schema.tables where table_schema = $1 and table_name = $2 limit 1",
                [table.schema ?? "public", table.name],
            );
            return rows.length > 0;
        }

        // MySQL
        if (table.schema) {
            let rows = await this.#sql.unsafe(
                "select 1 from information_schema.tables where table_schema = ? and table_name = ? limit 1",
                [table.schema, table.name],
            );
            return rows.length > 0;
        }
        let rows = await this.#sql.unsafe(
            "select 1 from information_schema.tables where table_schema = DATABASE() and table_name = ? limit 1",
            [table.name],
        );
        return rows.length > 0;
    }

    async hasColumn(
        table: TableRef,
        column: string,
        transaction?: TransactionToken,
    ): Promise<boolean> {
        if (transaction) this.#assertTransaction(transaction);

        if (this.dialect === "sqlite") {
            let schemaPrefix = table.schema ? quoteIdentifier(table.schema) + "." : "";
            let rows = await this.#sql.unsafe(
                "pragma " + schemaPrefix + "table_info(" + quoteIdentifier(table.name) + ")",
            );
            return (rows as Record<string, unknown>[]).some(row => row.name === column);
        }

        if (this.dialect === "postgres") {
            let rows = await this.#sql.unsafe(
                "select 1 from information_schema.columns where table_schema = $1 and table_name = $2 and column_name = $3 limit 1",
                [table.schema ?? "public", table.name, column],
            );
            return rows.length > 0;
        }

        // MySQL
        if (table.schema) {
            let rows = await this.#sql.unsafe(
                "select 1 from information_schema.columns where table_schema = ? and table_name = ? and column_name = ? limit 1",
                [table.schema, table.name, column],
            );
            return rows.length > 0;
        }
        let rows = await this.#sql.unsafe(
            "select 1 from information_schema.columns where table_schema = DATABASE() and table_name = ? and column_name = ? limit 1",
            [table.name, column],
        );
        return rows.length > 0;
    }

    async beginTransaction(options?: TransactionOptions): Promise<TransactionToken> {
        if (this.dialect === "sqlite") {
            if (options?.isolationLevel === "read uncommitted") {
                await this.#sql.unsafe("PRAGMA read_uncommitted = 1");
            }
            await this.#sql.unsafe("BEGIN");
        } else if (this.dialect === "postgres") {
            let isolation = options?.isolationLevel
                ? " ISOLATION LEVEL " + options.isolationLevel.toUpperCase()
                : "";
            let readOnly = options?.readOnly ? " READ ONLY" : "";
            await this.#sql.unsafe("BEGIN" + isolation + readOnly);
        } else {
            // MySQL: SET TRANSACTION before START TRANSACTION
            if (options?.isolationLevel) {
                await this.#sql.unsafe(
                    "SET TRANSACTION ISOLATION LEVEL " + options.isolationLevel.toUpperCase(),
                );
            }
            let readOnly = options?.readOnly ? " READ ONLY" : "";
            await this.#sql.unsafe("START TRANSACTION" + readOnly);
        }

        this.#transactionCounter += 1;
        let token = { id: "tx_" + String(this.#transactionCounter) };
        this.#transactions.add(token.id);
        return token;
    }

    async commitTransaction(token: TransactionToken): Promise<void> {
        this.#assertTransaction(token);
        await this.#sql.unsafe("COMMIT");
        this.#transactions.delete(token.id);
    }

    async rollbackTransaction(token: TransactionToken): Promise<void> {
        this.#assertTransaction(token);
        await this.#sql.unsafe("ROLLBACK");
        this.#transactions.delete(token.id);
    }

    async createSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        await this.#sql.unsafe("SAVEPOINT " + quoteIdentifier(name));
    }

    async rollbackToSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        await this.#sql.unsafe("ROLLBACK TO SAVEPOINT " + quoteIdentifier(name));
    }

    async releaseSavepoint(token: TransactionToken, name: string): Promise<void> {
        this.#assertTransaction(token);
        await this.#sql.unsafe("RELEASE SAVEPOINT " + quoteIdentifier(name));
    }

    async acquireMigrationLock(): Promise<void> {
        if (this.dialect === "postgres") {
            await this.#sql.unsafe("SELECT pg_advisory_lock(72616461)");
        } else if (this.dialect === "mysql") {
            await this.#sql.unsafe("SELECT GET_LOCK('remix_data_table_migration', -1)");
        }
    }

    async releaseMigrationLock(): Promise<void> {
        if (this.dialect === "postgres") {
            await this.#sql.unsafe("SELECT pg_advisory_unlock(72616461)");
        } else if (this.dialect === "mysql") {
            await this.#sql.unsafe("SELECT RELEASE_LOCK('remix_data_table_migration')");
        }
    }

    async #getWriteMetadata(): Promise<{
        changes: number;
        lastInsertId: unknown;
    }> {
        if (this.dialect === "sqlite") {
            let [row] = await this.#sql.unsafe(
                'SELECT changes() as "changes", last_insert_rowid() as "lastInsertId"',
            );
            return {
                changes: Number(row.changes),
                lastInsertId: row.lastInsertId,
            };
        }
        if (this.dialect === "mysql") {
            let [row] = await this.#sql.unsafe(
                'SELECT ROW_COUNT() as "changes", LAST_INSERT_ID() as "lastInsertId"',
            );
            return {
                changes: Number(row.changes),
                lastInsertId: row.lastInsertId,
            };
        }
        // PostgreSQL: prefer RETURNING clause for inserts (capabilities.returning = true).
        // For UPDATE/DELETE without RETURNING, affected-row metadata is unavailable
        // through Bun.SQL's current API.
        return { changes: 0, lastInsertId: undefined };
    }

    #assertTransaction(token: TransactionToken) {
        if (!this.#transactions.has(token.id)) {
            throw new Error("Unknown transaction token: " + token.id);
        }
    }
}

export function createBunSqlDatabaseAdapter(
    sql: SQL,
    options: { dialect: BunSqlDialect },
): BunSqlDatabaseAdapter {
    return new BunSqlDatabaseAdapter(sql, options);
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

function normalizeRows(rows: Iterable<Record<string, unknown>>): Record<string, unknown>[] {
    return [...rows].map(row => {
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
    if (!INSERT_KINDS.has(operation.kind) || !("table" in operation)) {
        return undefined;
    }
    let primaryKey = getTablePrimaryKey(operation.table);
    if (primaryKey.length !== 1) return undefined;
    let row = rows[rows.length - 1];
    return row ? row[primaryKey[0]] : undefined;
}

function extractInsertIdFromMeta(
    operation: DataManipulationOperation,
    meta: { lastInsertId: unknown },
): unknown {
    if (!INSERT_KINDS.has(operation.kind) || !("table" in operation)) {
        return undefined;
    }
    if (getTablePrimaryKey(operation.table).length !== 1) return undefined;
    return meta.lastInsertId;
}
