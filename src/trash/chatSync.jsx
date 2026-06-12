/* import { supabase } from "../configs/supbase";
import { Network } from "@capacitor/network";
import { getDB } from "./chatDatabase"; */

export const isOnline = async () => {
    const status =
        await Network.getStatus();

    return status.connected;
};

export const saveMessage =
    async (message) => {

        const db =
            await getDB();

        if (!db) {
            return;
        }

        await db.run(
            `
      INSERT OR REPLACE INTO messages
      (
        id,
        conversation_id,
        sender_id,
        text,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
      `,
            [
                message.id,
                message.conversation_id,
                message.sender_id,
                message.text,
                message.created_at,
            ]
        );
    };

export const saveMessages =
    async (messages) => {

        const db =
            await getDB();

        if (!db) {
            return;
        }

        for (const msg of messages) {

            await db.run(
                `
        INSERT OR REPLACE INTO messages
        (
          id,
          conversation_id,
          sender_id,
          text,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
        `,
                [
                    msg.id,
                    msg.conversation_id,
                    msg.sender_id,
                    msg.text,
                    msg.created_at,
                ]
            );
        }
    };

export const getLocalMessages =
    async (
        conversationId
    ) => {

        const db =
            await getDB();

        if (!db) {
            return [];
        }

        const result =
            await db.query(
                `
        SELECT *
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        `,
                [conversationId]
            );

        return (
            result.values || []
        );
    };

export const getLastLocalMessage =
    async (
        conversationId
    ) => {

        const db =
            await getDB();

        if (!db) {
            return null;
        }

        const result =
            await db.query(
                `
        SELECT *
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
                [conversationId]
            );

        return (
            result.values?.[0] ||
            null
        );
    };

export const syncConversation =
    async (
        conversationId
    ) => {

        const online =
            await isOnline();

        if (!online) {
            return false;
        }

        const lastLocal =
            await getLastLocalMessage(
                conversationId
            );

        let query =
            supabase
                .from("messages")
                .select("*")
                .eq(
                    "conversation_id",
                    conversationId
                )
                .order(
                    "created_at",
                    {
                        ascending: true,
                    }
                );

        if (
            lastLocal?.created_at
        ) {
            query = query.gt(
                "created_at",
                lastLocal.created_at
            );
        }

        const {
            data,
            error,
        } = await query;

        if (error) {
            console.log(error);
            return false;
        }

        if (
            data?.length
        ) {
            await saveMessages(
                data
            );
        }

        return true;
    };

export const subscribeToMessages =
    (
        conversationId
    ) => {
        return supabase
            .channel(
                `chat-${conversationId}`
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema:
                        "public",
                    table:
                        "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (
                    payload
                ) => {
                    await saveMessage(
                        payload.new
                    );
                }
            )
            .subscribe();
    };