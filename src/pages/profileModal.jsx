import React, { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({
  open,
  onClose,
  profile,
  isFollowing,
  onFollowToggle,
  currentUserProfileId,
}) {
  const [imageOpen, setImageOpen] = useState(false);
  const [zoom, setZoom] = useState(1);


  // ✅ LOCAL UI STATE (IMPORTANT FIX)
  const [followersCount, setFollowersCount] = useState(0);

  const navigate = useNavigate();

  const username =
    profile?.full_name?.replace(/\s+/g, "").toLowerCase() || "user";

  const isOwnProfile =
    currentUserProfileId && profile?.id === currentUserProfileId;

  console.log(currentUserProfileId, profile?.id)
  console.log(profile)

  // ================= ESC CLOSE =================
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ================= SYNC PROFILE CHANGES =================
  useEffect(() => {
    if (profile?.followers_count !== undefined) {
      setFollowersCount(profile.followers_count);
    }
  }, [profile?.followers_count]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">

      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* SHEET */}
      <div className="relative w-full h-[88vh] rounded-t-[40px] overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#1b002f] via-[#4a0ea3] to-[#7a2cf5] flex flex-col">

        {/* HANDLE */}
        <div className="relative z-20 flex justify-center pt-3">
          <div className="w-20 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* CLOSE */}
        <div className="absolute top-6 right-5 z-[99999]">
          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full bg-purple-600 text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="relative flex-1 overflow-y-auto bg-white rounded-t-[40px] px-6 pt-8 pb-10">

          {/* AVATAR */}
          <div className="flex justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                onClick={() => {
                  setZoom(1);
                  setImageOpen(true);
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
          <p className="text-center text-gray-600 mt-5 max-w-md mx-auto">
            {profile?.bio || "No bio yet."}
          </p>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mt-8">

            <div className="bg-purple-50 rounded-3xl p-4 text-center">
              <div className="font-bold text-2xl text-purple-700">
                {profile?.posts_count || 0}
              </div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>

            <div className="bg-purple-50 rounded-3xl p-4 text-center">
              <div className="font-bold text-2xl text-purple-700">
                {profile?.followers_count}
              </div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>

            <div className="bg-purple-50 rounded-3xl p-4 text-center">
              <div className="font-bold text-2xl text-purple-700">
                {profile?.following_count || 0}
              </div>
              <div className="text-sm text-gray-500">Following</div>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-8">

            {isOwnProfile ? (
              <button
                onClick={() => navigate(`/profile/${profile.id}`)}
                className="flex-1 h-14 rounded-2xl bg-purple-600 text-white font-semibold"
              >
                View Profile
              </button>
            ) : (
              <>
                {/* FOLLOW BUTTON */}
                <button
                  onClick={() => {
                    const willFollow = !isFollowing;

                    // ✅ instant UI update (NO refresh)
                    setFollowersCount((prev) =>
                      willFollow
                        ? prev + 1
                        : Math.max(prev - 1, 0)
                    );

                     onFollowToggle?.(profile);

                  }}
                  className={`flex-1 h-14 rounded-2xl font-semibold ${isFollowing
                      ? "bg-gray-200 text-gray-800"
                      : "bg-purple-600 text-white"
                    }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  className="flex-1 h-14 rounded-2xl border-2 border-purple-200 text-purple-700 font-semibold"
                >
                  View Profile
                </button>
              </>
            )}

          </div>

          {/* IMAGE ZOOM MODAL */}
          {imageOpen && (
            <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center">

              {/* BACKDROP (tap to close) */}
              <div
                className="absolute inset-0"
                onClick={() => setImageOpen(false)}
              />

              {/* TOP BAR (WhatsApp style) */}
              <div className="absolute top-0 left-0 right-0 flex items-center gap-3 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">

                <button
                  onClick={() => setImageOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="text-white">
                  <p className="font-semibold text-sm">
                    {profile?.full_name || "User"}
                  </p>

                  <p className="text-xs text-white/70">
                    @{username}
                  </p>
                </div>

              </div>
              {/* IMAGE */}
              <img
                src={profile?.avatar_url}
                style={{ transform: `scale(${zoom})` }}
                onClick={() => setZoom((z) => Math.min(z + 0.3, 3))}
                className="max-w-full max-h-full object-contain cursor-zoom-in transition-transform duration-150"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
/* 
{profile?.isOwnProfile ? (
  <button
    onClick={() => navigate(`/profile/${profile.id}`)}
    className="flex-1 h-14 rounded-2xl bg-purple-600 text-white font-semibold"
  >
    View Profile
  </button>
) : (
  <>
    <button
      onClick={async () => {
        const willFollow = !isFollowing;

        setIsFollowing(willFollow);

        setFollowersCount((prev) =>
          willFollow
            ? prev + 1
            : Math.max(prev - 1, 0)
        );

        await onFollowToggle?.(profile);
      }}
      className={`flex-1 h-14 rounded-2xl font-semibold ${
        isFollowing
          ? "bg-gray-200 text-gray-800"
          : "bg-purple-600 text-white"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>

    <button
      onClick={() => navigate(`/profile/${profile.id}`)}
      className="flex-1 h-14 rounded-2xl border-2 border-purple-200 text-purple-700 font-semibold"
    >
      View Profile
    </button>
  </>
)} */