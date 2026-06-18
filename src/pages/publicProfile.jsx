import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import { FiArrowLeft, FiMessageCircle, FiUserPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

export default function PublicProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.log("Profile fetch error:", error);
      }

      setProfile(data || null);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 animate-pulse" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full">
          <h1 className="text-lg font-semibold">Profile not found</h1>
          <p className="text-sm text-gray-500 mt-2">
            This user does not exist or was removed.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 w-full h-11 bg-blue-600 text-white rounded-xl"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* ================= COVER BACKGROUND ================= */}
      <div className="relative h-72 w-full">
        <img
          src={
            profile.avatar_url ||
            "https://www.gravatar.com/avatar/?d=mp&s=200"
          }
          className="w-full h-full object-cover"
        />

        {/* dark overlay for depth */}
        <div className="absolute inset-0 bg-black/30" />

        {/* TOP ACTIONS */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">

          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center"
          >
            <FiArrowLeft />
          </button>

          <div className="flex gap-2">
            <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <FiUserPlus />
            </button>

            <button className="w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center">
              <FiMessageCircle />
            </button>
          </div>

        </div>
      </div>

      {/* ================= FLOATING PROFILE HEADER ================= */}
      <div className="relative max-w-4xl mx-auto px-4">

        <div className="bg-white rounded-3xl shadow-md p-6 -mt-16 relative z-10">

          <div className="flex items-end gap-4">

            {/* FLOATING AVATAR */}
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover -mt-12"
            />

            {/* NAME */}
            <div className="pb-2">
              <h1 className="text-2xl font-bold">
                {profile.full_name}
              </h1>

              <p className="text-gray-500">
                @{profile.username}
              </p>
            </div>

          </div>

          {/* BIO (STAYS AT BOTTOM OF HEADER CARD) */}
          <p className="text-sm text-gray-600 mt-4">
            {profile.bio || "No bio added yet."}
          </p>

        </div>

        {/* ================= STATS (SEPARATE FLOATING ROW) ================= */}
        <div className="grid grid-cols-3 gap-3 mt-4">

          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="font-bold text-lg">
              {profile.posts_count || 0}
            </p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="font-bold text-lg">
              {profile.followers_count || 0}
            </p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="font-bold text-lg">
              {profile.following_count || 0}
            </p>
            <p className="text-xs text-gray-500">Following</p>
          </div>

        </div>

        <div className="space-y-3 text-sm text-gray-700 mt-7">

          {!profile.location &&
            !profile.school &&
            !profile.department &&
            !profile.relationship_status &&
            !profile.website ? (
            <p className="text-center text-gray-400 italic py-4">
              No information added yet.
            </p>
          ) : (
            <>
              {profile.location && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">📍 Location</span>
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.school && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">🎓 School</span>
                  <span>{profile.school}</span>
                </div>
              )}

              {profile.department && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">🏫 Department</span>
                  <span>{profile.department}</span>
                </div>
              )}

              {profile.relationship_status && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">❤️ Relationship</span>
                  <span>{profile.relationship_status}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">🌐 Website</span>
                  <span className="text-blue-600">
                    {profile.website}
                  </span>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}