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



  const navigate = useNavigate();

  const username =
    profile?.full_name?.replace(/\s+/g, "").toLowerCase() || "user";

  const isOwnProfile =
    currentUserProfileId && profile?.id === currentUserProfileId;

  /*   console.log(currentUserProfileId, profile?.id) */

  // ================= ESC CLOSE =================
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);



  if (!open) return null;

  console.log(profile)

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center pb-6">

      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* SHEET */}
      <div className="
    relative w-full
    h-[78vh] max-h-[78vh]
    mt-10
    rounded-t-[40px]
    overflow-hidden
    shadow-[0_-15px_70px_rgba(0,0,0,0.6)]
    bg-gradient-to-b from-[#1b002f] via-[#4a0ea3] to-[#7a2cf5]
    flex flex-col
  ">

        {/* HANDLE */}
        <div className="flex justify-center pt-3">
          <div className="w-14 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* CLOSE BUTTON */}
        <div className="absolute top-6 right-3 z-50">
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="
      flex-1 overflow-y-auto
      bg-white
      rounded-t-[40px]
      px-6 pt-10 pb-10
    ">

          {/* AVATAR */}
          <div className="flex justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                onClick={() => {
                  setZoom(1);
                  setImageOpen(true);
                }}
                className="
              w-28 h-28 rounded-full
              object-cover
              border-4 border-purple-100
              shadow-lg
              cursor-pointer
            "
              />
            ) : (
              <div className="
            w-28 h-28 rounded-full
            bg-purple-600
            flex items-center justify-center
            text-white text-4xl font-bold
            shadow-lg
          ">
                {(profile?.full_name || "U")[0]}
              </div>
            )}
          </div>

          {/* NAME */}
          <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">
            {profile?.full_name || "Anonymous User"}
          </h1>

          {/* USERNAME */}
          <p className="text-center text-gray-500 text-sm mt-1">
            @{username}
          </p>

          {/* BIO */}
          <p className="text-center text-gray-600 mt-4 max-w-md mx-auto text-sm">
            {profile?.bio || "No bio yet."}
          </p>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mt-7">

            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <div className="font-bold text-xl text-purple-700">
                {profile?.posts_count || 0}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <div className="font-bold text-xl text-purple-700">
                {profile?.followers_count || 0}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <div className="font-bold text-xl text-purple-700">
                {profile?.following_count || 0}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-8">

            {isOwnProfile ? (
              <button
                onClick={() => navigate(`/profile/${profile.id}`)}
                className="
              flex-1 h-12 rounded-2xl
              bg-purple-600 text-white font-semibold
              shadow-md active:scale-95
              transition
            "
              >
                View Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const willFollow = !isFollowing;
                    onFollowToggle?.(profile, willFollow);
                  }}
                  className={`
    flex-1 h-12 rounded-2xl font-semibold shadow-md
    transition active:scale-95
    ${isFollowing
                      ? "bg-gray-200 text-gray-800"
                      : "bg-purple-600 text-white"
                    }
  `}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  className="
                flex-1 h-12 rounded-2xl
                border border-purple-200
                text-purple-700 font-semibold
                bg-white
                active:scale-95
                transition
              "
                >
                  View profile
                </button>
              </>
            )}

          </div>

        </div>
      </div>

      {/* IMAGE ZOOM MODAL */}
      {imageOpen && (
        <div className="fixed inset-0 z-[100000] bg-black flex items-center justify-center">

          {/* BACKGROUND */}
          <div
            className="absolute inset-0"
            onClick={() => {
              setImageOpen(false);
              setZoom(1);
            }}
          />


          {/* HEADER */}
          <div className="
      absolute
      top-0
      left-0
      right-0
      z-20
      flex
      items-center
      gap-3
      px-4
      py-4
      bg-gradient-to-b
      from-black/80
      to-transparent
    ">

            <button
              onClick={() => {
                setImageOpen(false);
                setZoom(1);
              }}
              className="
          w-10
          h-10
          rounded-full
          bg-white/10
          text-white
          flex
          items-center
          justify-center
        "
            >
              <ArrowLeft size={20} />
            </button>


            <div className="text-white">

              <p className="font-semibold text-sm">
                {profile?.full_name || "User"}
              </p>

              <p className="text-xs text-white/70">
                @{username || profile?.username}
              </p>

            </div>

          </div>



          {/* IMAGE */}
          <img
            src={profile?.avatar_url}
            draggable="false"

            onClick={(e) => {
              e.stopPropagation();

              setZoom((z) =>
                z === 1 ? 2.5 : 1
              );
            }}

            style={{
              transform: `scale(${zoom})`,
              maxHeight: "100vh",
              maxWidth: "100vw"
            }}

            className="
        relative
        z-10
        select-none
        object-contain
        transition-transform
        duration-300
      "
          />

        </div>
      )}
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