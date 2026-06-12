import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import { FiArrowLeft, FiMessageCircle, FiUserPlus } from "react-icons/fi";
import { data, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";



export default function PublicProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  console.log(id)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("Profile fetch error:", error);
        setLoading(false);
        return;
      }

      console.log("PROFILE DATA:", data);

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black animate-pulse" />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Profile not found
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-black text-white">

      {/* COVER SECTION */}
      <div className="relative h-64 mx-4 mt-4 rounded-3xl overflow-hidden">
        <img
          src={
            profile.cover_url ||
            "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600"
          }
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* HEADER FLOATING CARD */}
      <div className="mx-4 -mt-16 relative z-10">

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-5">

          {/* TOP ACTIONS */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <FiArrowLeft />
            </button>

            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <FiUserPlus />
              </button>

              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FiMessageCircle />
              </button>
            </div>
          </div>

          {/* PROFILE IMAGE WITH RING */}
          <div className="flex flex-col items-center text-center -mt-10">

            <div className="relative">
              {/* glowing ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 blur-md opacity-70"></div>

              <img
                src={
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${profile.full_name}`
                }
                className="relative w-28 h-28 rounded-full border-4 border-black object-cover"
              />
            </div>

            <h1 className="mt-3 text-xl font-bold">
              {profile.full_name}
            </h1>

            <p className="text-sm text-purple-300">
              @{profile.username}
            </p>

            <p className="text-sm text-gray-300 mt-2 max-w-xs">
              {profile.bio || "No bio yet..."}
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-black/30 rounded-2xl p-3 text-center">
              <p className="font-bold text-lg">
                {profile.posts_count || 0}
              </p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-3 text-center">
              <p className="font-bold text-lg">
                {profile.followers_count || 0}
              </p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-3 text-center">
              <p className="font-bold text-lg">
                {profile.following_count || 0}
              </p>
              <p className="text-xs text-gray-400">Following</p>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="mt-5 space-y-2 text-sm">

            {profile.location && (
              <div className="bg-white/5 p-3 rounded-xl">
                📍 {profile.location}
              </div>
            )}

            {profile.school && (
              <div className="bg-white/5 p-3 rounded-xl">
                🎓 {profile.school}
              </div>
            )}

            {profile.department && (
              <div className="bg-white/5 p-3 rounded-xl">
                🏫 {profile.department}
              </div>
            )}

            {profile.relationship_status && (
              <div className="bg-white/5 p-3 rounded-xl">
                ❤️ {profile.relationship_status}
              </div>
            )}

            {profile.website && (
              <div className="bg-white/5 p-3 rounded-xl text-purple-300">
                🌐 {profile.website}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}