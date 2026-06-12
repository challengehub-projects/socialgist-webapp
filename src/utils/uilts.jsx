import { supabase } from "../configs/supbase";

import {
  isOnline,
  saveConversation,
  getOfflineConversation,
} from "./chatStorage";

/* export const getOrCreateConversation =
  async (
    meId,
    otherUserId
  ) => {
    if (
      !meId ||
      !otherUserId
    ) {
      return null;
    }

    const [a, b] =
      meId < otherUserId
        ? [meId, otherUserId]
        : [otherUserId, meId];

    const chatKey =
      `${a}_${b}`;

    const online =
      await isOnline();

    // OFFLINE MODE

    if (!online) {
      console.log(
        "OFFLINE CHAT"
      );

      const local =
        await getOfflineConversation(
          chatKey
        );

      if (!local)
        return null;

      return {
        conversationId:
          local.id,
        chatKey:
          local.chat_key,
        offline: true,
      };
    }

    // ONLINE MODE

    const {
      data: existing,
      error,
    } = await supabase
      .from(
        "conversations"
      )
      .select("*")
      .eq(
        "chat_key",
        chatKey
      )
      .maybeSingle();

    if (error) {
      console.log(error);
      return null;
    }

    let conversation =
      existing;

    if (!conversation) {
      const {
        data: created,
        error:
          createError,
      } = await supabase
        .from(
          "conversations"
        )
        .insert({
          chat_key:
            chatKey,
        })
        .select()
        .single();

      if (
        createError
      ) {
        console.log(
          createError
        );
        return null;
      }

      conversation =
        created;
    }

    await saveConversation(
      conversation
    );

    return {
      conversationId:
        conversation.id,
      chatKey,
      offline: false,
    };
  }; */

export const getOrCreateConversation =
  async (
    meId,
    otherUserId,
    otherFullName = "Unknown User"
  ) => {

    if (
      !meId ||
      !otherUserId
    ) {
      return null;
    }

    const [a, b] =
      meId < otherUserId
        ? [meId, otherUserId]
        : [otherUserId, meId];

    const chatKey =
      `${a}_${b}`;

    const online =
      await isOnline();

    // OFFLINE MODE

    if (!online) {

      console.log(
        "OFFLINE CHAT"
      );

      const local =
        await getOfflineConversation(
          chatKey
        );

      if (!local)
        return null;

      return {

        conversationId:
          local.id,

        chatKey:
          local.chat_key,

        offline: true,

      };

    }

    // ONLINE MODE

    const {
      data: existing,
      error,
    } = await supabase
      .from(
        "conversations"
      )
      .select("*")
      .eq(
        "chat_key",
        chatKey
      )
      .maybeSingle();

    if (error) {

      console.log(error);

      return null;

    }

    let conversation =
      existing;

    if (!conversation) {

      const {
        data: created,
        error:
        createError,
      } = await supabase
        .from(
          "conversations"
        )
        .insert({
          chat_key:
            chatKey,
        })
        .select()
        .single();

      if (
        createError
      ) {

        console.log(
          createError
        );

        return null;

      }

      conversation =
        created;

    }

    // GET MY FULL NAME FROM AUTH

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const myFullName =
      user?.user_metadata
        ?.full_name ||
      "Unknown User";

    // ENSURE MEMBERS EXIST

    const {
      error:
      memberError,
    } = await supabase
      .from(
        "conversation_members"
      )
      .upsert(
        [
          {
            conversation_id:
              conversation.id,
            user_id: meId,
            full_name:
              myFullName,
          },
          {
            conversation_id:
              conversation.id,
            user_id:
              otherUserId,
            full_name:
              otherFullName,
          },
        ],
        {
          onConflict:
            "conversation_id,user_id",
        }
      );

    if (
      memberError
    ) {

      console.log(
        memberError
      );

    }

    await saveConversation(
      conversation
    );

    return {

      conversationId:
        conversation.id,

      chatKey,

      offline: false,

    };

  };