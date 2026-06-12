import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Search,
  Bell,
  MessageCircle,
  Home,
  Users,
  Tv,
  Store,
  Moon,
  Sun,
  Plus,
  Flame,
  X,
  Type,
  Trash2,
  Palette,
  Smile,
  Sparkles,
  Image as ImageIcon,
  Wifi,
  WifiOff,
  Loader2,
  Send,
} from "lucide-react";

import { Rnd } from "react-rnd";
import EmojiPicker from "emoji-picker-react";

import { supabase } from "../configs/supbase";

import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";

export default function TopNavbar({
  darkMode,
  toggleDarkMode,
  onNavigate,
  onPostCreated,
}) {
  const fileRef = useRef();

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [layers, setLayers] = useState([]);

  const [selected, setSelected] =
    useState(null);

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [syncing, setSyncing] =
    useState(false);

  const [image, setImage] =
    useState(null);

  const [imageFile, setImageFile] =
    useState(null);

  const [description, setDescription] =
    useState("");

  const [isOnline, setIsOnline] =
    useState(true);

  const [profileData, setProfileData] =
    useState({
      name: "Anonymous",
      username: "@user",
      bio: "Welcome to SocialGist",
      avatar:
        "https://i.pravatar.cc/300?img=12",
    });

  /* ================= COLORS ================= */

  const colors = [
    "#ffffff",
    "#ff3b30",
    "#34c759",
    "#0a84ff",
    "#ffd60a",
    "#bf5af2",
    "#ff9f0a",
    "#ff2d55",
    "#00ffd0",
  ];

  /* ================= BACKGROUNDS ================= */

  const backgrounds = [
    "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
    "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)",
    "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
    "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)",
    "linear-gradient(135deg,#fa709a 0%,#fee140 100%)",
    "linear-gradient(135deg,#30cfd0 0%,#330867 100%)",
    "linear-gradient(135deg,#5ee7df 0%,#b490ca 100%)",
    "linear-gradient(135deg,#ff758c 0%,#ff7eb3 100%)",
    "linear-gradient(135deg,#141e30 0%,#243b55 100%)",
  ];

  const [background, setBackground] =
    useState(
      backgrounds[
        Math.floor(
          Math.random() *
            backgrounds.length
        )
      ]
    );

  /* ================= USER PROFILE ================= */

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    const { data } =
      await supabase.auth.getUser();

    if (data?.user) {
      setProfileData({
        name:
          data.user.user_metadata
            ?.full_name ||
          "Anonymous",

        username:
          "@" +
          (
            data.user.email ||
            "user"
          ).split("@")[0],

        bio:
          data.user.user_metadata
            ?.bio ||
          "Frontend developer",

        avatar:
          data.user.user_metadata
            ?.avatar_url ||
          "https://i.pravatar.cc/300?img=12",
      });
    }
  };

  /* ================= NETWORK ================= */

  useEffect(() => {
    checkNetwork();

    let listener;

    const setupListener = async () => {
      listener =
        await Network.addListener(
          "networkStatusChange",
          (status) => {
            setIsOnline(
              status.connected
            );

            if (
              status.connected
            ) {
              syncOfflinePosts();
            }
          }
        );
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  const checkNetwork = async () => {
    const status =
      await Network.getStatus();

    setIsOnline(status.connected);
  };

  /* ================= SYNC OFFLINE ================= */

  const syncOfflinePosts = async () => {
    try {
      setSyncing(true);

      const { value } =
        await Preferences.get({
          key: "offline_posts",
        });

      let posts = value
        ? JSON.parse(value)
        : [];

      if (posts.length === 0) {
        setSyncing(false);
        return;
      }

      for (const post of posts) {
        await supabase
          .from("posts")
          .insert(post);
      }

      await Preferences.remove({
        key: "offline_posts",
      });

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.log(err);
    }

    setSyncing(false);
  };

  /* ================= SAVE OFFLINE ================= */

  const saveOfflinePost = async (
    payload
  ) => {
    const { value } =
      await Preferences.get({
        key: "offline_posts",
      });

    let posts = value
      ? JSON.parse(value)
      : [];

    posts.push(payload);

    await Preferences.set({
      key: "offline_posts",
      value: JSON.stringify(posts),
    });
  };

  /* ================= ICON BTN ================= */

  const iconBtn =
    "relative flex items-center justify-center h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] text-gray-700 dark:text-gray-200 transition shrink-0 active:scale-95";

  const badge =
    "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-purple-600 rounded-full";

  /* ================= IMAGE ================= */

  const uploadImage = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const preview =
      URL.createObjectURL(file);

    setImage(preview);
  };

  /* ================= ADD TEXT ================= */

  const addText = () => {
    const randomColor =
      colors[
        Math.floor(
          Math.random() *
            colors.length
        )
      ];

    const id = Date.now();

    setLayers((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: "Tap to edit",
        x: 90,
        y: 220,
        color: randomColor,
        fontSize: 34,
      },
    ]);

    setSelected(id);
  };

  /* ================= UPDATE LAYER ================= */

  const updateLayer = (
    id,
    changes
  ) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              ...changes,
            }
          : l
      )
    );
  };

  /* ================= DELETE ================= */

  const deleteLayer = () => {
    if (!selected) return;

    setLayers((prev) =>
      prev.filter(
        (l) => l.id !== selected
      )
    );

    setSelected(null);
  };

  /* ================= RANDOM BG ================= */

  const randomizeBackground = () => {
    const random =
      backgrounds[
        Math.floor(
          Math.random() *
            backgrounds.length
        )
      ];

    setBackground(random);
  };

  /* ================= RESET ================= */

  const resetEditor = () => {
    setLayers([]);
    setSelected(null);
    setImage(null);
    setImageFile(null);
    setDescription("");
    setShowCreateModal(false);
    setLoading(false);

    setBackground(
      backgrounds[
        Math.floor(
          Math.random() *
            backgrounds.length
        )
      ]
    );
  };

  /* ================= EMOJI ================= */

  const selectedLayer = layers.find(
    (l) => l.id === selected
  );

  const addEmoji = (emojiData) => {
    if (!selectedLayer) return;

    updateLayer(selectedLayer.id, {
      text:
        selectedLayer.text +
        emojiData.emoji,
    });
  };

  /* ================= CREATE POST ================= */

  const createPost = async () => {
    if (
      layers.length === 0 &&
      !image &&
      !description.trim()
    ) {
      alert(
        "Create something before posting"
      );

      return;
    }

    try {
      setLoading(true);

      const { data: userData } =
        await supabase.auth.getUser();

      if (!userData?.user) {
        alert("Please login first");

        setLoading(false);

        return;
      }

      let uploadedImage = null;

      if (
        imageFile &&
        isOnline
      ) {
        const fileExt =
          imageFile.name
            .split(".")
            .pop();

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("post-images")
          .upload(
            fileName,
            imageFile,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

        if (uploadError) {
          console.log(
            uploadError
          );

          alert(
            uploadError.message
          );

          setLoading(false);

          return;
        }

        const { data } =
          supabase.storage
            .from(
              "post-images"
            )
            .getPublicUrl(
              fileName
            );

        uploadedImage =
          data.publicUrl;
      }

      const payload = {
        user_id:
          userData.user.id,

        profile_name:
          userData.user
            .user_metadata
            ?.full_name ||
          "Anonymous",

        profile_image:
          userData.user
            .user_metadata
            ?.avatar_url ||
          "",

        type: image
          ? "image_post"
          : "text_post",

        description,

        image:
          uploadedImage,

        content: {
          background,
          layers,
        },
      };

      if (!isOnline) {
        await saveOfflinePost(
          payload
        );

        alert(
          "Post saved offline"
        );

        resetEditor();

        return;
      }

      const { error } =
        await supabase
          .from("posts")
          .insert(payload);

      if (error) {
        console.log(error);

        alert(error.message);

        setLoading(false);

        return;
      }

      if (onPostCreated) {
        onPostCreated();
      }

      resetEditor();
    } catch (err) {
      console.log(err);

      alert(
        "Something went wrong"
      );
    }

    setLoading(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#18191A]/95 backdrop-blur-xl border-b border-gray-200 dark:border-[#2d2f31]">

        <div className="h-16 px-3 sm:px-4 flex items-center justify-between gap-2">

          {/* LEFT */}

          <div className="flex items-center gap-3 min-w-0">

            <button
              onClick={() =>
                setShowProfileModal(true)
              }
              className="relative shrink-0 active:scale-95 transition"
            >

              <img
                src={
                  profileData.avatar
                }
                alt=""
                className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full object-cover ring-2 ring-purple-500"
              />

              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />

            </button>

            <div className="leading-tight min-w-0">

              <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent truncate">
                SocialGist
              </h1>

              <p className="hidden sm:block text-[11px] text-gray-500">
                connect • vibe • gist
              </p>

            </div>

          </div>

          {/* DESKTOP NAV */}

          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">

            <NavButton
              icon={
                <Home className="h-5 w-5" />
              }
              label="Home"
              active
            />

            <NavButton
              icon={
                <Users className="h-5 w-5" />
              }
              label="Friends"
            />

            <NavButton
              icon={
                <Tv className="h-5 w-5" />
              }
              label="Videos"
            />

            <NavButton
              icon={
                <Store className="h-5 w-5" />
              }
              label="Market"
            />

            <NavButton
              icon={
                <Flame className="h-5 w-5" />
              }
              label="Trending"
            />

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2 shrink-0">

            <div
              className={`hidden sm:flex items-center gap-2 px-3 h-10 rounded-full text-xs font-bold ${
                isOnline
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >

              {isOnline ? (
                <Wifi size={14} />
              ) : (
                <WifiOff size={14} />
              )}

              {isOnline
                ? syncing
                  ? "Syncing"
                  : "Online"
                : "Offline"}

            </div>

            <button
              className={`${iconBtn} md:hidden`}
            >
              <Search size={18} />
            </button>

            <button
              onClick={() =>
                setShowCreateModal(
                  true
                )
              }
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white h-11 px-4 rounded-full flex items-center gap-2 font-semibold shadow-xl active:scale-95 transition shrink-0"
            >

              <Plus size={18} />

              <span className="hidden sm:block">
                Create
              </span>

            </button>

            <button
              onClick={
                toggleDarkMode
              }
              className={`${iconBtn} hidden sm:flex`}
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button className={iconBtn}>

              <MessageCircle
                size={18}
              />

              <span className={badge}>
                4
              </span>

            </button>

            <button className={iconBtn}>

              <Bell size={18} />

              <span
                className={`${badge} bg-red-500`}
              >
                9
              </span>

            </button>

          </div>

        </div>

      </header>

      {/* ================= PROFILE MODAL ================= */}

      {showProfileModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end">

          <div className="w-full h-[60vh] bg-white dark:bg-[#18191A] rounded-t-[35px] animate-slideUp relative overflow-hidden">

            <div className="flex justify-center pt-3 pb-2">

              <div className="w-14 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />

            </div>

            <button
              onClick={() =>
                setShowProfileModal(
                  false
                )
              }
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 dark:bg-[#2a2b2d] flex items-center justify-center"
            >
              <X size={20} />
            </button>

            <div className="px-6 pt-4">

              <div className="flex flex-col items-center text-center">

                <img
                  src={
                    profileData.avatar
                  }
                  alt=""
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-purple-500"
                />

                <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">
                  {profileData.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  {
                    profileData.username
                  }
                </p>

                <p className="text-sm text-gray-500 mt-3 max-w-sm">
                  {profileData.bio}
                </p>

                <div className="flex gap-3 mt-6 w-full">

                  <button
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold flex items-center justify-center gap-2"
                  >

                    <Send size={18} />

                    Message

                  </button>

                  <button
                    onClick={() => {
                      setShowProfileModal(
                        false
                      );

                      onNavigate &&
                        onNavigate(
                          "profile"
                        );
                    }}
                    className="flex-1 h-12 rounded-2xl bg-gray-100 dark:bg-[#2a2b2d] text-gray-900 dark:text-white font-bold"
                  >
                    View Profile
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ================= CREATE MODAL ================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col overflow-hidden touch-none">

          {/* TOP */}

          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl">

            <button
              onClick={() =>
                setShowCreateModal(
                  false
                )
              }
              className="text-white"
            >
              <X size={28} />
            </button>

            <h1 className="text-white font-semibold text-lg">
              Create Post
            </h1>

            <button
              onClick={
                createPost
              }
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-2xl disabled:opacity-50"
            >

              <div className="flex items-center gap-2">

                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles
                    size={16}
                  />
                )}

                {loading
                  ? "Posting..."
                  : "Post"}

              </div>

            </button>

          </div>

          {/* DESCRIPTION */}

          <div className="px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="What's on your mind?"
              rows={2}
              className="w-full bg-transparent text-white placeholder:text-gray-400 outline-none resize-none text-base"
            />

          </div>

          {/* CANVAS */}

          <div className="flex-1 relative overflow-hidden">

            <div
              className="absolute inset-0"
              style={{
                background,
              }}
            />

            {image && (
              <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {image && (
              <div className="absolute inset-0 bg-black/20" />
            )}

            {!image &&
              layers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="text-center text-white/70 px-6">

                    <ImageIcon
                      size={60}
                      className="mx-auto mb-4"
                    />

                    <h2 className="text-2xl font-black mb-2">
                      Create something beautiful
                    </h2>

                    <p className="text-sm opacity-80">
                      Add photos, text, emojis and captions
                    </p>

                  </div>

                </div>
              )}

            {layers.map((layer) => (
              <Rnd
                key={layer.id}
                bounds="parent"
                enableResizing={false}
                position={{
                  x: layer.x,
                  y: layer.y,
                }}
                onDragStop={(e, d) => {
                  updateLayer(
                    layer.id,
                    {
                      x: d.x,
                      y: d.y,
                    }
                  );
                }}
                onClick={() =>
                  setSelected(
                    layer.id
                  )
                }
              >

                <div
                  className={`font-black select-none transition ${
                    selected ===
                    layer.id
                      ? "scale-105"
                      : ""
                  }`}
                  style={{
                    fontSize:
                      layer.fontSize,

                    color:
                      layer.color,

                    textShadow:
                      "0 4px 20px rgba(0,0,0,0.55)",
                  }}
                >
                  {layer.text}
                </div>

              </Rnd>
            ))}

          </div>

          {/* TOOLBAR */}

          <div className="h-24 bg-[#0f0f10]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 pb-3 overflow-x-auto">

            <button
              onClick={addText}
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">

                <Type size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Text
              </span>

            </button>

            <button
              onClick={() =>
                fileRef.current.click()
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">

                <ImageIcon
                  size={20}
                />

              </div>

              <span className="text-[11px] mt-1">
                Photo
              </span>

            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              capture="environment"
              onChange={uploadImage}
            />

            <button
              onClick={() =>
                setShowEmoji(
                  (p) => !p
                )
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">

                <Smile size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Emoji
              </span>

            </button>

            <button
              onClick={() => {
                if (
                  !selectedLayer
                )
                  return;

                const randomColor =
                  colors[
                    Math.floor(
                      Math.random() *
                        colors.length
                    )
                  ];

                updateLayer(
                  selectedLayer.id,
                  {
                    color:
                      randomColor,
                  }
                );
              }}
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">

                <Palette size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Color
              </span>

            </button>

            <button
              onClick={
                randomizeBackground
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">

                <Sparkles
                  size={20}
                />

              </div>

              <span className="text-[11px] mt-1">
                BG
              </span>

            </button>

            <button
              onClick={deleteLayer}
              className="flex flex-col items-center text-red-500 shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">

                <Trash2 size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Delete
              </span>

            </button>

          </div>

        </div>
      )}
    </>
  );
}

/* ================= NAV BUTTON ================= */

function NavButton({
  icon,
  label,
  active,
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center h-14 min-w-[90px] px-4 rounded-2xl transition ${
        active
          ? "text-purple-600"
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C]"
      }`}
    >

      <div className="h-6 w-6 flex items-center justify-center">
        {icon}
      </div>

      <span className="text-xs mt-1">
        {label}
      </span>

    </button>
  );
}

import React, {
  useEffect,
  useState,
} from "react";

import {
  MessageCircle,
  Wifi,
  WifiOff,
  RefreshCcw,
  ThumbsUp,
  Heart,
  Share2,
  Flame,
  Sparkles,
  Users,
} from "lucide-react";


import React, {
  useEffect,
  useState,
} from "react";

import {
  MessageCircle,
  Wifi,
  WifiOff,
  RefreshCcw,
  ThumbsUp,
  Heart,
  Share2,
  Flame,
  Sparkles,
  Users,
} from "lucide-react";

import { supabase } from "../configs/supbase";

import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";
import {
  Filesystem,
  Directory,
} from "@capacitor/filesystem";

import {
  CapacitorSQLite,
  SQLiteConnection,
} from "@capacitor-community/sqlite";

const sqlite =
  new SQLiteConnection(
    CapacitorSQLite
  );

export default function Feed({
  onOpenComments,
}) {
  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isOnline, setIsOnline] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [likedPosts, setLikedPosts] =
    useState({});

  const [animatingLike, setAnimatingLike] =
    useState(null);

  let db = null;

  // ================= DATABASE =================

  const initDB = async () => {
    try {
      db =
        await sqlite.createConnection(
          "socialgist",
          false,
          "no-encryption",
          1,
          false
        );

      await db.open();

      await db.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          data TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS likes (
          id TEXT PRIMARY KEY,
          liked INTEGER
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS pending_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          postId TEXT,
          likesCount INTEGER
        );
      `);
    } catch (err) {
      console.log(
        "DB ERROR:",
        err
      );
    }
  };

  // ================= TOAST =================

  const showToast = async (
    message
  ) => {
    await Toast.show({
      text: message,
      duration: "short",
      position: "bottom",
    });
  };

  // ================= IMAGE CACHE =================

  const cacheImageLocally = async (
    imageUrl,
    fileName
  ) => {
    try {
      if (!imageUrl)
        return imageUrl;

      const existing =
        await Preferences.get({
          key: `image_${fileName}`,
        });

      if (existing.value) {
        return existing.value;
      }

      const response =
        await fetch(imageUrl);

      const blob =
        await response.blob();

      const reader =
        new FileReader();

      return new Promise(
        (resolve) => {
          reader.onloadend =
            async () => {
              const base64 =
                reader.result.split(
                  ","
                )[1];

              const path = `socialgist/${fileName}`;

              await Filesystem.writeFile(
                {
                  path,
                  data: base64,
                  directory:
                    Directory.Data,
                }
              );

              const file =
                await Filesystem.getUri(
                  {
                    path,
                    directory:
                      Directory.Data,
                  }
                );

              await Preferences.set(
                {
                  key: `image_${fileName}`,
                  value:
                    file.uri,
                }
              );

              resolve(
                file.uri
              );
            };

          reader.readAsDataURL(
            blob
          );
        }
      );
    } catch (err) {
      console.log(
        "CACHE IMAGE ERROR:",
        err
      );

      return imageUrl;
    }
  };

  // ================= CACHE IMAGES =================

  const cachePostImages =
    async (postsData) => {
      try {
        const updated =
          await Promise.all(
            postsData.map(
              async (post) => {
                if (
                  !post.image
                )
                  return post;

                const fileName = `post_${post.id}.jpg`;

                const cachedImage =
                  await cacheImageLocally(
                    post.image,
                    fileName
                  );

                return {
                  ...post,
                  cached_image:
                    cachedImage,
                };
              }
            )
          );

        return updated;
      } catch (err) {
        console.log(err);

        return postsData;
      }
    };

  // ================= SQLITE SAVE POSTS =================

  const cachePosts = async (
    postsData
  ) => {
    try {
      if (!db) return;

      await db.execute(
        `DELETE FROM posts`
      );

      for (const post of postsData) {
        await db.run(
          `
          INSERT OR REPLACE INTO posts (id, data)
          VALUES (?, ?)
        `,
          [
            String(post.id),
            JSON.stringify(
              post
            ),
          ]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SQLITE LOAD POSTS =================

  const loadCachedPosts =
    async () => {
      try {
        if (!db) return;

        const result =
          await db.query(
            `SELECT * FROM posts`
          );

        if (
          result.values &&
          result.values.length > 0
        ) {
          const parsed =
            result.values.map(
              (item) =>
                JSON.parse(
                  item.data
                )
            );

          setPosts(parsed);
        }
      } catch (err) {
        console.log(err);
      }
    };

  // ================= SQLITE SAVE LIKES =================

  const cacheLikes = async (
    likesData
  ) => {
    try {
      if (!db) return;

      await db.execute(
        `DELETE FROM likes`
      );

      for (const key in likesData) {
        await db.run(
          `
          INSERT OR REPLACE INTO likes (id, liked)
          VALUES (?, ?)
        `,
          [
            key,
            likesData[key]
              ? 1
              : 0,
          ]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SQLITE LOAD LIKES =================

  const loadLikedPosts =
    async () => {
      try {
        if (!db) return;

        const result =
          await db.query(
            `SELECT * FROM likes`
          );

        const likes = {};

        result.values?.forEach(
          (item) => {
            likes[item.id] =
              item.liked === 1;
          }
        );

        setLikedPosts(
          likes
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= OFFLINE LIKE SAVE =================

  const savePendingLike =
    async (
      postId,
      likesCount
    ) => {
      try {
        if (!db) return;

        await db.run(
          `
          INSERT INTO pending_likes
          (postId, likesCount)
          VALUES (?, ?)
        `,
          [
            String(postId),
            likesCount,
          ]
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= SYNC OFFLINE LIKES =================

  const syncOfflineLikes =
    async () => {
      try {
        if (!db) return;

        const result =
          await db.query(
            `SELECT * FROM pending_likes`
          );

        const pending =
          result.values || [];

        for (const like of pending) {
          await supabase
            .from("posts")
            .update({
              likes_count:
                like.likesCount,
            })
            .eq(
              "id",
              like.postId
            );
        }

        await db.execute(
          `DELETE FROM pending_likes`
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= FETCH POSTS =================

  const fetchPosts = async (
    showLoader = false
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setRefreshing(true);

      const status =
        await Network.getStatus();

      if (!status.connected) {
        await loadCachedPosts();

        setRefreshing(false);
        setLoading(false);

        return;
      }

      const { data, error } =
        await supabase
          .from("posts")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.log(error);

        setRefreshing(false);
        setLoading(false);

        return;
      }

      if (data) {
        let formatted =
          data.map((post) => ({
            ...post,
            likes_count:
              post.likes_count ||
              0,
          }));

        formatted =
          await cachePostImages(
            formatted
          );

        setPosts(formatted);

        await cachePosts(
          formatted
        );
      }
    } catch (err) {
      console.log(err);
    }

    setRefreshing(false);
    setLoading(false);
  };

  // ================= START =================

  useEffect(() => {
    const startFeed =
      async () => {
        await initDB();

        await loadCachedPosts();

        await loadLikedPosts();

        await fetchPosts(true);
      };

    startFeed();
  }, []);

  // ================= NETWORK =================

  useEffect(() => {
    let firstRun = true;

    const setupNetwork =
      async () => {
        const status =
          await Network.getStatus();

        setIsOnline(
          status.connected
        );

        if (
          status.connected
        ) {
          await syncOfflineLikes();
        }

        Network.addListener(
          "networkStatusChange",
          async (status) => {
            setIsOnline(
              status.connected
            );

            if (firstRun) {
              firstRun = false;
              return;
            }

            if (
              status.connected
            ) {
              await showToast(
                "You're back online"
              );

              await syncOfflineLikes();

              fetchPosts();
            } else {
              await showToast(
                "You're offline"
              );
            }
          }
        );
      };

    setupNetwork();
  }, []);

  // ================= REALTIME =================

  useEffect(() => {
    const channel = supabase
      .channel(
        "realtime-posts"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        async (
          payload
        ) => {
          const updatedPost =
            payload.new;

          if (!updatedPost)
            return;

          setPosts((prev) => {
            const updated =
              prev.map((post) =>
                post.id ===
                  updatedPost.id
                  ? {
                    ...post,
                    ...updatedPost,
                  }
                  : post
              );

            cachePosts(
              updated
            );

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, []);

  // ================= LIKE =================

  const likePost = async (
    postId
  ) => {
    try {
      const alreadyLiked =
        likedPosts[postId];

      setAnimatingLike(
        postId
      );

      setTimeout(() => {
        setAnimatingLike(
          null
        );
      }, 400);

      const updatedPosts =
        posts.map((post) => {
          if (
            post.id === postId
          ) {
            return {
              ...post,
              likes_count:
                alreadyLiked
                  ? Math.max(
                    0,
                    (
                      post.likes_count ||
                      0
                    ) - 1
                  )
                  : (
                    post.likes_count ||
                    0
                  ) + 1,
            };
          }

          return post;
        });

      setPosts(updatedPosts);

      await cachePosts(
        updatedPosts
      );

      const updatedLikes = {
        ...likedPosts,
        [postId]:
          !alreadyLiked,
      };

      setLikedPosts(
        updatedLikes
      );

      await cacheLikes(
        updatedLikes
      );

      const targetPost =
        updatedPosts.find(
          (p) =>
            p.id === postId
        );

      const status =
        await Network.getStatus();

      if (!status.connected) {
        await savePendingLike(
          postId,
          targetPost.likes_count
        );

        return;
      }

      const { error } =
        await supabase
          .from("posts")
          .update({
            likes_count:
              targetPost.likes_count,
          })
          .eq("id", postId);

      if (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SHARE =================

  const sharePost = async (
    post
  ) => {
    try {
      const shareUrl =
        post.image ||
        `https://socialgist-app.vercel.app/post/${post.id}`;

      const caption = `${post.description ||
        "Check this post on SocialGist"
        }

${post.likes_count || 0} likes
@${(
          post.profile_name ||
          "user"
        )
          .replace(/\s+/g, "")
          .toLowerCase()}`;

      await Share.share({
        title: "SocialGist",
        text: caption,
        url: shareUrl,
        dialogTitle:
          "Share Post",
      });
    } catch (err) {
      console.log(
        "Share error:",
        err
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="h-screen bg-white dark:bg-[#0f0f10] flex flex-col items-center justify-center">
        <img
          src="/icon.png"
          className="w-24 h-24 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f0f10] pb-24">
      {/* EVERYTHING BELOW REMAINS EXACTLY SAME UI */}
    </div>
  );
}
