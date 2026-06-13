import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const body = await req.json();

    const { playerId, title, message } = body;

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic YOUR_REST_API_KEY"
      },
      body: JSON.stringify({
        app_id: "YOUR_ONESIGNAL_APP_ID",
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message }
      })
    });

    const data = await response.json();

    return Response.json({
      success: true,
      onesignal: data
    });
  }),
};
