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

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(user)

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // ensure username exists
      let updated = { ...data };

      if (!updated.username) {
        updated.username = "user_" + nanoid(6);

        await supabase
          .from("profiles")
          .update({ username: updated.username })
          .eq("id", user.id);
      }

      setProfile(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🚀 NO auth refresh loops (IMPORTANT FIX)
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      // only refetch if real logout/login happens
      fetchProfile();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // ================= UPDATE FIELD =================
  const updateField = async (field, value) => {
    if (!profile) return;

    const userValue = value?.trim() || "Not set";

    // optimistic UI update
    const updated = {
      ...profile,
      [field]: userValue,
    };

    setProfile(updated);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          [field]: userValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ================= AVATAR =================
  const uploadAvatar = async (file) => {
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `${user.id}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) return console.error(error);

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    const avatar_url = data.publicUrl;

    await supabase
      .from("profiles")
      .update({
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setProfile((p) => ({ ...p, avatar_url }));
  };

  const regenerateUsername = () => {
    updateField("username", "user_" + nanoid(6));
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 animate-pulse">
        <div className="h-56 bg-gray-200 rounded-3xl" />
        <div className="h-24 w-24 bg-gray-300 rounded-full -mt-12 ml-6" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No profile found
      </div>
    );
  }

  // ================= FIELD =================
  const Field = ({ label, value, field }) => (
    <div className="py-4 border-b flex justify-between">
      <div className="w-full">
        <p className="text-xs text-purple-600 uppercase">{label}</p>

        {editing[field] ? (
          <input
            autoFocus
            defaultValue={value || ""}
            onBlur={(e) => {
              updateField(field, e.target.value);
              toggleEdit(field);
            }}
            className="w-full mt-2 bg-gray-100 rounded-xl px-3 py-2 outline-none"
          />
        ) : (
          <p className="mt-1 text-gray-700">
            {value?.trim() || "Not set"}
          </p>
        )}
      </div>

      <button onClick={() => toggleEdit(field)}>
        {editing[field] ? <FiCheck /> : <FiEdit2 />}
      </button>
    </div>
  );

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-xl mx-auto pb-10">

        {/* HEADER */}
        <div className="p-4 flex items-center gap-3 border-b">
          <button
            onClick={() => navigate("/feed")}
            className="bg-gray-100 p-3 rounded-full"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="font-bold">Profile Settings</h1>
            <p className="text-xs text-gray-500">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* AVATAR */}
        <div className="mx-4 mt-4 h-56 rounded-3xl overflow-hidden">
          <img
            src={
              profile.avatar_url ||
              `https://ui-avatars.com/api/?name=${profile.full_name}`
            }
            className="w-full h-full object-cover"
          />
        </div>

        {/* PROFILE INFO */}
        <div className="px-6 -mt-14 flex items-end gap-4">

          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              className="w-28 h-28 rounded-full border-4 border-white object-cover"
            />

            <label className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full">
              <FiCamera />
              <input
                hidden
                type="file"
                onChange={(e) => uploadAvatar(e.target.files[0])}
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {profile.full_name || "Your Name"}
            </h2>

            <div className="flex gap-2 text-purple-600">
              @{profile.username}
              <button onClick={regenerateUsername}>
                <FiRefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {["Posts", "Followers", "Following"].map((x, i) => (
            <div key={x} className="border rounded-2xl p-4 text-center">
              <b>
                {[
                  profile.posts_count,
                  profile.followers_count,
                  profile.following_count,
                ][i] || 0}
              </b>
              <p className="text-xs text-gray-500">{x}</p>
            </div>
          ))}
        </div>

        {/* FIELDS */}
        <div className="mx-4 border rounded-3xl p-4">
          <Field label="Full Name" field="full_name" value={profile.full_name} />
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