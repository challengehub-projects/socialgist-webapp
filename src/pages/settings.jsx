import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import {
  FiEdit2,
  FiCheck,
  FiCamera,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

export default function SeetingsPage({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const cacheKey = `profile-${user.id}`;

        // Try user-specific cache first
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);

          setProfile(parsed);
        }

        // Always fetch fresh data from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

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

        console.log("Loaded profile:", updatedProfile);
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

  const updateField = async (field, value) => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    const updated = { ...profile, [field]: value };
    setProfile(updated);

    await supabase
      .from("profiles")
      .update({ [field]: value, updated_at: new Date() })
      .eq("id", userId);
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const compressImage = (file, maxWidth = 600, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(
            new File([blob], file.name, {
              type: "image/jpeg",
            })
          );
        }, "image/jpeg", quality);
      };
    });
  };

  const uploadAvatar = async (file) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!file || !user) return;

    const compressed = await compressImage(file);

    const fileName = `${user.id}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, compressed);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

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

    if (updateError) {
      console.error(updateError);
      return;
    }

    const updatedProfile = {
      ...profile,
      avatar_url: avatarUrl,
    };

    setProfile(updatedProfile);

    sessionStorage.setItem(
      `profile-${user.id}`,
      JSON.stringify(updatedProfile)
    );
  };

  const regenerateUsername = async () => {
    await updateField("username", "user_" + nanoid(6));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white animate-pulse p-6">
        <div className="h-56 bg-purple-900/30 rounded-3xl" />
        <div className="h-24 w-24 bg-purple-800/30 rounded-full -mt-12 ml-6 border-4 border-black" />
      </div>
    );
  }


  console.log(profile)

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        No profile found
      </div>
    );
  }

  const Field = ({ label, value, field }) => (
    <div className="py-3 border-b border-white/10 flex justify-between items-start gap-4">
      <div className="w-full">
        <p className="text-[11px] text-purple-300 uppercase tracking-wider">
          {label}
        </p>

        {editing[field] ? (
          <input
            defaultValue={value || ""}
            onBlur={(e) => {
              updateField(field, e.target.value);
              toggleEdit(field);
            }}
            className="w-full mt-1 bg-white/5 text-white px-3 py-2 rounded-xl outline-none"
            autoFocus
          />
        ) : (
          <p className="text-sm text-white mt-1">
            {value || "Not set"}
          </p>
        )}
      </div>

      <button
        onClick={() => toggleEdit(field)}
        className="text-purple-300 hover:text-white"
      >
        {editing[field] ? <FiCheck /> : <FiEdit2 />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto pb-10">

        {/* HEADER */}
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate("/feed")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="font-bold text-lg">Profile</h1>
            <p className="text-xs text-purple-300">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* COVER IMAGE */}
        <div className="relative h-56 mx-4 rounded-3xl overflow-hidden">
          <img
            src={profile.avatar_url}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* PROFILE IMAGE FLOAT */}
        <div className="flex items-end gap-4 px-6 -mt-14 relative z-10">
          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              className="w-28 h-28 rounded-full border-4 border-black object-cover"
            />

            <label className="absolute bottom-2 right-2 bg-purple-600 p-2 rounded-full cursor-pointer">
              <FiCamera size={14} />
              <input
                type="file"
                hidden
                onChange={(e) => uploadAvatar(e.target.files[0])}
              />
            </label>
          </div>

          <div className="pb-2">
            <h2 className="text-xl font-bold">
              {profile.full_name}
            </h2>

            <div className="flex items-center gap-2 text-purple-300 text-sm">
              @{profile.username}

              <button onClick={regenerateUsername}>
                <FiRefreshCw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-6">
          {["Posts", "Followers", "Following"].map((t, i) => (
            <div
              key={t}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
            >
              <p className="text-lg font-bold">
                {[profile.posts_count, profile.followers_count, profile.following_count][i] || 0}
              </p>
              <p className="text-xs text-purple-300">{t}</p>
            </div>
          ))}
        </div>

        {/* FIELDS */}
        <div className="mt-6 mx-4 bg-white/5 border border-white/10 rounded-3xl p-4">
          <Field label="Bio" field="bio" value={profile.bio} />
          <Field label="Website" field="website" value={profile.website} />
          <Field label="Location" field="location" value={profile.location} />
          <Field label="School" field="school" value={profile.school} />
          <Field label="Department" field="department" value={profile.department} />
          <Field label="Hobby" field="hobby" value={profile.hobby} />
          <Field label="Relationship" field="relationship_status" value={profile.relationship_status} />
        </div>

      </div>
    </div>
  );
}