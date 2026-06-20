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
  const [me, setme] = useState(null)

  const navigate = useNavigate();

  // ================= FETCH PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        setme(user);

        console.log(user)

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
          .maybeSingle();



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

  console.log(profile)

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

  const handleInvite = async () => {
    const userId = me?.id;

    const inviteLink = `${window.location.origin}/signup?ref=${userId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Join me on Sociagist",
        text: "Join me on this app!",
        url: inviteLink,
      });
    } else {
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied!");
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/feed")}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <FiArrowLeft />
            </button>

            <h1 className="font-semibold text-gray-900">
              Profile
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 animate-pulse">
          <div className="h-48 rounded-3xl bg-gray-200" />

          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white -mt-14 ml-6 relative z-10" />

          <div className="mt-6 h-6 w-56 bg-gray-200 rounded" />

          <div className="mt-3 h-4 w-40 bg-gray-100 rounded" />

          <div className="mt-8 space-y-3">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-20 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ================= NO PROFILE =================
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/feed")}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <FiArrowLeft />
            </button>

            <h1 className="font-semibold text-gray-900">
              Profile
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <span className="text-4xl">👤</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            No Profile Yet
          </h2>

          <p className="text-gray-500 mt-2 max-w-sm">
            Your profile information hasn't been set up yet.
          </p>

          <button
            onClick={() => navigate("/feed")}
            className="mt-6 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  // ================= PROFILE PAGE =================
  return (
    <div className="min-h-screen bg-white text-gray-900">

      <div className="max-w-2xl mx-auto pb-10">

        {/* HEADER */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">

          <div className="flex items-center gap-4 px-5 py-4">

            <button
              onClick={() => navigate("/feed")}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <FiArrowLeft />
            </button>


            <div>

              <h1 className="font-bold text-xl">
                Profile
              </h1>

              <p className="text-sm text-gray-500">
                @{profile?.username}
              </p>

            </div>

          </div>

        </div>



        {/* COVER */}
        <div className="h-52 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />



        {/* PROFILE CARD */}
        <div className="px-6 -mt-16 relative">

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">


            <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">


              {/* AVATAR */}
              <div className="relative">


                <img
                  src={
                    profile?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${me?.user_metadata?.full_name}`
                  }
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />


                <label className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full cursor-pointer">

                  <FiCamera size={16} />


                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      uploadAvatar(e.target.files?.[0])
                    }
                  />

                </label>

              </div>




              {/* NAME */}
              <div className="flex-1 text-center md:text-left">


                <h2 className="text-3xl font-bold">

                  {profile.full_name ||
                    "Anonymous User"}

                </h2>


                <p className="text-gray-500">
                  @{profile?.username}
                </p>


                <p className="mt-4 text-gray-700">

                  {profile?.bio ||
                    "No bio added yet."}

                </p>

                <div className="mt-5 flex gap-3">

                  {/* Update Profile */}
                  <button
                    onClick={() => navigate("/settings")}
                    className="px-5 py-2 rounded-xl bg-black text-white"
                  >
                    Update Profile
                  </button>

                  {/* Invite Friends */}
                  <button
                    onClick={handleInvite}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white"
                  >
                    Invite Friends
                  </button>

                </div>

              </div>


            </div>





            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-8">


              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <b>{profile?.posts_count || 0}</b>
                <p className="text-sm text-gray-500">Posts</p>
              </div>


              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <b>{profile?.followers_count || 0}</b>
                <p className="text-sm text-gray-500">Followers</p>
              </div>


              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <b>{profile?.following_count || 0}</b>
                <p className="text-sm text-gray-500">Following</p>
              </div>


            </div>


          </div>

        </div>





        {/* INFO */}
        <div className="px-6 mt-8">


          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">


            <h3 className="p-5 font-bold text-lg border-b">
              Personal Information
            </h3>



            {[
              ["Full Name", me?.user_metadata?.full_name],
              ["Username", profile?.username],
              ["Bio", profile?.bio],
              ["Website", profile?.website],
              ["Location", profile?.location],
              ["School", profile?.school],
              ["Department", profile?.department],
              ["Hobby", profile?.hobby],
            ].map(([label, value]) => (

              <div
                key={label}
                className="p-5 border-b last:border-0"
              >

                <p className="text-xs text-gray-400 uppercase">
                  {label}
                </p>


                <p className="mt-1">
                  {value || "Not provided"}
                </p>

              </div>

            ))}


          </div>


        </div>


      </div>


    </div>
  )

}