import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import {
  FiCamera,
  FiArrowLeft,
} from "react-icons/fi";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ================= FETCH PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile(null);
          return;
        }

        const cacheKey = `profile-${user.id}`;

        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          setProfile(JSON.parse(cached));
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        let updatedProfile = { ...data };

        if (!updatedProfile.username) {
          const username = `user_${nanoid(6)}`;

          await supabase
            .from("profiles")
            .update({ username })
            .eq("id", user.id);

          updatedProfile.username = username;
        }

        setProfile(updatedProfile);

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify(updatedProfile)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchProfile();
      }

      if (event === "SIGNED_OUT") {
        sessionStorage.clear();
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================= IMAGE COMPRESSION =================
  const compressImage = (
    file,
    maxWidth = 700,
    quality = 0.75
  ) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          quality
        );
      };
    });
  };

  // ================= UPLOAD AVATAR =================
  const uploadAvatar = async (file) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!file || !user) return;

      const compressed = await compressImage(file);

      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, compressed);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const updatedProfile = {
        ...profile,
        avatar_url: avatarUrl,
      };

      setProfile(updatedProfile);

      sessionStorage.setItem(
        `profile-${user.id}`,
        JSON.stringify(updatedProfile)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FIELD COMPONENT =================
  const Field = ({ label, value }) => (
    <div className="py-4 border-b border-white/10">
      <p className="text-[11px] uppercase tracking-wider text-purple-300">
        {label}
      </p>

      <p className="text-white text-sm mt-2">
        {value || "Not provided"}
      </p>
    </div>
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 animate-pulse">
        <div className="h-56 rounded-3xl bg-purple-900/30" />

        <div className="w-28 h-28 rounded-full bg-purple-900/30 border-4 border-black -mt-14 ml-6" />

        <div className="mt-6 h-5 w-48 bg-purple-900/30 rounded" />

        <div className="mt-3 h-4 w-32 bg-purple-900/20 rounded" />
      </div>
    );
  }

  // ================= NO PROFILE =================
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        No profile found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto pb-10">

        {/* HEADER */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => navigate("/feed")}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
            >
              <FiArrowLeft />
            </button>

            <div>
              <h1 className="font-bold text-lg">
                My Profile
              </h1>

              <p className="text-xs text-purple-300">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>

        {/* COVER */}
        <div className="relative h-60 mx-4 mt-4 rounded-[32px] overflow-hidden">
          <img
            src={
              profile.avatar_url ||
              `https://ui-avatars.com/api/?name=${profile.full_name}`
            }
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* PROFILE */}
        <div className="flex items-end gap-4 px-6 -mt-16 relative z-10">

          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              alt=""
              className="w-32 h-32 rounded-full object-cover border-4 border-black shadow-2xl"
            />

            {/* ONLY EDITABLE THING */}
            <label className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition">
              <FiCamera size={16} />

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  uploadAvatar(e.target.files?.[0])
                }
              />
            </label>
          </div>

          <div className="pb-3">
            <h2 className="text-2xl font-bold">
              {profile.full_name || "Anonymous User"}
            </h2>

            <p className="text-purple-300 text-sm">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* BIO */}
        <div className="px-6 mt-5">
          <p className="text-gray-300 leading-relaxed">
            {profile.bio || "No bio added yet."}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 px-4 mt-8">
          {[
            {
              title: "Posts",
              value: profile.posts_count || 0,
            },
            {
              title: "Followers",
              value: profile.followers_count || 0,
            },
            {
              title: "Following",
              value: profile.following_count || 0,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-5 text-center"
            >
              <p className="text-2xl font-bold">
                {item.value}
              </p>

              <p className="text-xs text-purple-300 mt-1">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* INFO CARD */}
        <div className="mx-4 mt-8 rounded-[32px] bg-white/5 border border-white/10 p-5">

          <h3 className="font-semibold text-lg mb-4">
            Personal Information
          </h3>

          <Field label="Full Name" value={profile.full_name} />

          <Field label="Username" value={profile.username} />

          <Field label="Bio" value={profile.bio} />

          <Field label="Website" value={profile.website} />

          <Field label="Location" value={profile.location} />

          <Field label="School" value={profile.school} />

          <Field
            label="Department"
            value={profile.department}
          />

          <Field label="Hobby" value={profile.hobby} />

          <Field
            label="Relationship Status"
            value={profile.relationship_status}
          />
        </div>
      </div>
    </div>
  );
}