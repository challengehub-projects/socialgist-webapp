/* import { CapacitorSQLite, SQLiteConnection }
    from "@capacitor-community/sqlite";

 */
/* const sqlite =
    new SQLiteConnection(
        CapacitorSQLite
    ); */

let db = null;

/* export const getDB =
    async () => {
        if (db)
            return db;

        db =
            await sqlite.createConnection(
                "chat_db",
                false,
                "no-encryption",
                1,
                false
            );

        await db.open();

        await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        sender_id TEXT,
        text TEXT,
        created_at TEXT
      );
    `);

        return db;
    }; */


export const getDB =
  async () => {

    // WEB
    if (
      !Capacitor.isNativePlatform()
    ) {
      return null;
    }

    // ALREADY OPEN
    if (db) {
      return db;
    }

    db =
      await sqlite.createConnection(
        "chat_db",
        false,
        "no-encryption",
        1,
        false
      );

    await db.open();

    return db;
  };