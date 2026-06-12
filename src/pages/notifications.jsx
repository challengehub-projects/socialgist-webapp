import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Repeat,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../configs/supbase";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // FETCH NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (!error) {
        setNotifications(data || []);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, []);

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
          <p className="text-purple-500 mt-3 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 py-3 flex items-center gap-3">

        <button
          onClick={() => navigate("/feed")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-purple-100 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-bold text-lg text-purple-900">
            Notifications
          </h1>
          <p className="text-xs text-purple-400">
            Your social activity updates
          </p>
        </div>

      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">

          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
            <Bell className="text-purple-500" size={28} />
          </div>

          <h2 className="text-xl font-bold text-purple-900">
            No notifications yet
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            When people like, comment, or follow you, you'll see it here.
          </p>

        </div>
      ) : (

        /* LIST */
        <div className="px-4 py-4 space-y-3">

          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition"
            >

              {/* ICON */}
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                {getIcon(n.type)}
              </div>

              {/* CONTENT */}
              <div className="flex-1">

                <p className="text-sm text-gray-800 leading-5">
                  <span className="font-semibold text-purple-900">
                    {n.sender_name || "Someone"}
                  </span>{" "}
                  {n.message}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(n.created_at)}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}