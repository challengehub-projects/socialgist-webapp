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

export default function ProfilePage({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log(profile)

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const cached = sessionStorage.getItem("profile");

      if (cached) {
        setProfile(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();


      console.log(data)

      if (!error && data) {
        let updated = { ...data };

        if (!updated.username) {
          updated.username = "user_" + nanoid(6);

          await supabase
            .from("profiles")
            .update({ username: updated.username })
            .eq("id", userId);
        }

        setProfile(updated);
        sessionStorage.setItem("profile", JSON.stringify(updated));
      }

      setLoading(false);
    };

    fetchProfile();
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
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (!file || !userId) return;

    const compressed = await compressImage(file);

    const fileName = `${userId}/${Date.now()}.jpg`;

    await supabase.storage
      .from("profile-images")
      .upload(fileName, compressed, { upsert: true });

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    setProfile((p) => ({ ...p, avatar_url: url }));

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", userId);
  };

  const regenerateUsername = async () => {
    await updateField("username", "user_" + nanoid(6));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12081f] text-white p-6 animate-pulse">
        <div className="h-32 bg-purple-900/40 rounded-2xl" />
        <div className="h-24 w-24 bg-purple-800/40 rounded-full -mt-12 ml-6 border-4 border-[#12081f]" />
        <div className="h-4 w-40 bg-purple-800/40 mt-4 rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12081f] text-white">
        No profile found
      </div>
    );
  }

  const Field = ({ label, value, field }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/10">
      <div className="w-full">
        <p className="text-xs text-purple-300 uppercase">{label}</p>

        {editing[field] ? (
          <input
            defaultValue={value || ""}
            onBlur={(e) => {
              updateField(field, e.target.value);
              toggleEdit(field);
            }}
            className="w-full mt-1 bg-purple-900/30 text-white px-3 py-2 rounded-xl outline-none"
            autoFocus
          />
        ) : (
          <p className="text-white mt-1 text-sm">{value || "Not set"}</p>
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
    <div className="min-h-screen bg-[#0b0614] text-white px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/feed")}
            className="w-9 h-9 rounded-full bg-purple-900/40 flex items-center justify-center"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="font-bold">Profile</h1>
            <p className="text-xs text-purple-300">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* COVER */}
        <div className="h-32 rounded-3xl bg-gradient-to-r from-purple-900 via-purple-700 to-fuchsia-700" />

        {/* PROFILE HEADER (IMAGE POSITION KEPT SAME) */}
        <div className="flex items-end gap-4 -mt-12 px-4">

          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              className="w-24 h-24 rounded-full border-4 border-[#0b0614] object-cover"
            />

            <label className="absolute bottom-1 right-1 bg-purple-700 p-2 rounded-full cursor-pointer">
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
        <div className="mt-6 grid grid-cols-3 gap-2">
          {["Posts", "Followers", "Following"].map((t, i) => (
           
            <div
              key={t}
              className="bg-purple-900/30 rounded-2xl p-4 text-center border border-white/10"
            >
              <p className="font-bold text-lg">
                {[profile.posts_count, profile.followers_count, profile.following_count][i] || 0}
              </p>
              <p className="text-xs text-purple-300">{t}</p>
            </div>
          ))}
        </div>

        {/* FIELDS */}
        <div className="mt-6 bg-purple-900/20 border border-white/10 rounded-3xl p-4">
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