import {
  CapacitorSQLite,
  SQLiteConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

import { Network } from "@capacitor/network";

const sqlite =
  new SQLiteConnection(
    CapacitorSQLite
  );

let db = null;

export const initChatDB =
  async () => {
    try {
      if (db) return db;

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
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          chat_key TEXT,
          updated_at TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT,
          sender_id TEXT,
          text TEXT,
          created_at TEXT
        );
      `);

      console.log(
        "Chat DB Ready"
      );

      return db;

    } catch (err) {
      console.log(
        "DB ERROR:",
        err
      );
    }
  };

export const getDB =
  async () => {
    if (db) return db;

    return await initChatDB();
  };

export const isOnline =
  async () => {
    const status =
      await Network.getStatus();

    return status.connected;
  };

export const saveConversation =
  async (
    conversation
  ) => {

    const db =
      await getDB();

    if (!db) {
      return;
    }

    await db.run(
      `
      INSERT OR REPLACE INTO conversations
      (
        id,
        chat_key,
        updated_at
      )
      VALUES (?, ?, ?)
      `,
      [
        conversation.id,
        conversation.chat_key,
        new Date().toISOString(),
      ]
    );
  };

export const getOfflineConversation =
  async (
    chatKey
  ) => {
    if (Capacitor.isNativePlatform) {
      const db =
        await getDB();

      const result =
        await db.query(
          `
        SELECT *
        FROM conversations
        WHERE chat_key = ?
        LIMIT 1
        `,
          [chatKey]
        );

      return (
        result.values?.[0] ||
        null
      );

    }
  };