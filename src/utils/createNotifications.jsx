import { supabase } from "../configs/supbase";

export const createNotification = async ({
  receiver_id,
  sender,
  type,
  message,
  post_id = null,
}) => {
  try {
    if (!receiver_id || !sender?.id) return;
    if (receiver_id === sender.id) return;

    const { error } = await supabase.from("notifications").insert({
      receiver_id,
      sender_id: sender.id,
      sender_name: sender.full_name || "Someone",
      type,
      message,
      post_id,
      read: false,
    });

    if (error) {
      console.error("Notification error:", error);
    }
  } catch (err) {
    console.error("Notification exception:", err);
  }
};