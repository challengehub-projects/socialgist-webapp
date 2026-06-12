// ProfileModal.jsx

import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  User2,
  ChevronRight,
  UserPlus,
  UserCheck,
  UserCircle,
} from "lucide-react";



export default function ProfileModal({
  open,
  onClose,
  profile,
  onNavigate,
  isFollowing = false,
  onFollowToggle,
}) {

  const [imageOpen, setImageOpen] = useState(false);
  const [zoom, setZoom] = useState(1);




  // ESC CLOSE
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  const username =
    profile?.full_name
      ?.replace(/\s+/g, "")
      .toLowerCase() || "user";

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">

      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md profile-backdrop"
      />

      {/* SHEET */}
      <div className="relative w-full h-[88vh] rounded-t-[40px] overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#1b002f] via-[#4a0ea3] to-[#7a2cf5] flex flex-col">

        {/* glow */}
        <div className="absolute top-0 left-0 w-full h-72 bg-white/10 blur-3xl opacity-40" />

        {/* HANDLE */}
        <div className="relative z-20 flex justify-center pt-3">
          <div className="w-20 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* CLOSE */}
        <div className="absolute top-6 right-5 z-[99999]">
          <button
            onClick={onClose}
            className="
      h-11
      w-11
      rounded-full
      bg-purple-600
      text-white
      shadow-lg
      flex
      items-center
      justify-center
      active:scale-95
      transition
    "
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="relative flex-1 overflow-y-auto bg-white rounded-t-[40px] px-6 pt-8 pb-10 profile-content">

          {!profile ? (
            <div className="animate-pulse">

              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-200" />
              </div>

              <div className="mt-6 h-8 w-48 mx-auto rounded bg-gray-200" />
              <div className="mt-3 h-4 w-28 mx-auto rounded bg-gray-100" />

              <div className="mt-6 space-y-3">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto" />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-gray-100"
                  />
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <div className="flex-1 h-14 rounded-2xl bg-gray-200" />
                <div className="flex-1 h-14 rounded-2xl bg-gray-100" />
              </div>

            </div>
          ) : (
            <>
              {/* AVATAR */}
              <div className="flex justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    onClick={() => {
                      setZoom(1);
                      setImageOpen(true)
                    }}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-100 shadow-xl cursor-pointer"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                    {(profile?.full_name || "U")[0]}
                  </div>
                )}
              </div>

              {/* NAME */}
              <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
                {profile?.full_name || "Anonymous User"}
              </h1>

              {/* USERNAME */}
              <p className="text-center text-gray-500 mt-2">
                @{username}
              </p>

              {/* BIO */}
              <p className="text-center text-gray-600 mt-5 leading-relaxed max-w-md mx-auto">
                {profile?.bio || "No bio yet."}
              </p>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-3 mt-8">

                <div className="bg-purple-50 rounded-3xl p-4 text-center">
                  <div className="font-bold text-2xl text-purple-700">
                    {profile?.posts || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Posts
                  </div>
                </div>

                <div className="bg-purple-50 rounded-3xl p-4 text-center">
                  <div className="font-bold text-2xl text-purple-700">
                    {profile?.followers_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Followers
                  </div>
                </div>

                <div className="bg-purple-50 rounded-3xl p-4 text-center">
                  <div className="font-bold text-2xl text-purple-700">
                    {profile?.following_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Following
                  </div>
                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-8">

                {/* 👇 ONLY SHOW VIEW PROFILE IF IT'S YOUR OWN PROFILE */}
                {profile?.id === profile?.viewer_id ? (
                  <button
                    onClick={() => onNavigate?.("profile")}
                    className="flex-1 h-14 rounded-2xl bg-purple-600 text-white font-semibold shadow-lg active:scale-95 transition"
                  >
                    View Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onFollowToggle?.(profile)}
                      className="flex-1 h-14 rounded-2xl bg-purple-600 text-white font-semibold shadow-lg active:scale-95 transition"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate?.("profile");
                      }}
                      className="flex-1 h-14 rounded-2xl border-2 border-purple-200 text-purple-700 font-semibold active:scale-95 transition"
                    >
                      View Profile
                    </button>
                  </>
                )}
              </div>

              {imageOpen && (
                <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center">

                  {/* BACKDROP CLOSE */}
                  <div
                    className="absolute inset-0"
                    onClick={() => setImageOpen(false)}
                  />

                  {/* IMAGE CONTAINER */}
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-4">

                    <img
                      src={profile?.avatar_url}
                      alt="profile"
                      onClick={() => setZoom((z) => Math.min(z + 0.3, 3))}
                      style={{
                        transform: `scale(${zoom})`,
                        transition: "transform 0.25s ease",
                      }}
                      className="
          max-w-full
          max-h-full
          object-contain
          rounded-xl
          shadow-2xl
          cursor-zoom-in
          select-none
        "
                    />

                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                    onClick={() => setImageOpen(false)}
                    className="
        absolute top-5 right-5
        bg-white text-black
        w-10 h-10
        rounded-full
        flex items-center justify-center
        font-bold shadow-lg z-20
      "
                  >
                    ✕
                  </button>

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}