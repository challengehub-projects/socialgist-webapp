import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Repeat,
  Bell,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { supabase } from "../configs/supbase";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();


useEffect(() => {
  const fetchNotifications = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    setUserId(userId);
    
  console.log(userId)

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

      console.log(data)

    if (error) {
      console.log("Fetch notifications error:", error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  };

  fetchNotifications();
}, []);

  useEffect(() => {
  if (!userId) return;

  const channel = supabase
    .channel(`notifications-${userId}`) // unique channel per user
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        console.log("New notification:", payload.new);

        setNotifications((prev) => {
          // prevent duplicates
          const exists = prev.some((n) => n.id === payload.new.id);
          if (exists) return prev;

          return [payload.new, ...prev];
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="text-pink-500" size={18} />;
      case "comment":
        return <MessageCircle className="text-purple-500" size={18} />;
      case "follow":
        return <UserPlus className="text-blue-500" size={18} />;
      case "repost":
        return <Repeat className="text-green-500" size={18} />;
      default:
        return <Bell className="text-gray-400" size={18} />;
    }
  };

  const formatTime = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="text-purple-500 mt-3 text-sm">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-purple-200/40 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-fuchsia-200/30 blur-[130px] rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">

        <button
          onClick={() => navigate("/feed")}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-purple-50 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            Notifications
            <Sparkles size={16} className="text-purple-500" />
          </h1>
          <p className="text-xs text-gray-500">
            All your social updates in one place
          </p>
        </div>

      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6 relative z-10">

          <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200">
            <Bell size={30} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">
            All caught up
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-xs leading-6">
            When someone likes, follows, or comments on your posts,
            you’ll see it here instantly.
          </p>

          <button
            onClick={() => navigate("/feed")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow-md active:scale-95 transition"
          >
            Go to Feed
          </button>

        </div>
      ) : (

        /* LIST */
        <div className="relative z-10 px-4 py-4 space-y-3">

          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition"
            >

              {/* ICON */}
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center">
                {getIcon(n.type)}
              </div>

              {/* CONTENT */}
              <div className="flex-1">

                <p className="text-sm text-gray-800 leading-5">
                  <span className="font-semibold text-gray-900">
                    {n.sender_name || "Someone"}
                  </span>{" "}
                  <span className="text-gray-600">
                    {n.message}
                  </span>
                </p>

                <div className="flex items-center justify-between mt-2">

                  <p className="text-xs text-gray-400">
                    {formatTime(n.created_at)}
                  </p>

                  {n.type === "follow" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
                      New follower
                    </span>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}