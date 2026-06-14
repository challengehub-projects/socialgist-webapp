import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../configs/supbase";
import { MessageCircle, ThumbsUp, Loader2 } from "lucide-react";
import { BiShare } from "react-icons/bi";

export default function SinglePost() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);

    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!postData) {
      setPost(null);
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", postData.user_id)
      .maybeSingle();

    setPost({
      ...postData,
      profile: profileData || null,
    });

    setLoading(false);
  };

  // SAFE PARSE
  let parsed = {};
  try {
    parsed =
      typeof post?.content === "string"
        ? JSON.parse(post.content)
        : post?.content || {};
  } catch {
    parsed = {};
  }

  // 🔥 CLEAN SHARE (WhatsApp + all apps)
  const sharePost = async () => {
    const url = `${window.location.origin}/post/${id}`;

    const text =
      post?.description ||
      post?.profile?.full_name ||
      "Check this post on SocialGist";

    if (navigator.share) {
      await navigator.share({
        title: "SocialGist",
        text,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b001a] via-[#1a0033] to-[#2a0066]">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-purple-200 text-sm">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-[#0b001a] via-[#120022] to-[#1a0033] text-white">

      {/* MAIN CARD */}
      <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <img
            src={
              post.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${post.profile?.full_name || "User"}`
            }
            className="w-11 h-11 rounded-full object-cover border border-purple-500"
          />

          <div>
            <h3 className="font-semibold text-sm">
              {post.profile?.full_name || "Unknown"}
            </h3>
            <p className="text-xs text-purple-300">
              @{post.profile?.username || "user"}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        {post.description && (
          <div className="px-4 py-3 text-sm text-white/90">
            {post.description}
          </div>
        )}

        {/* IMAGE + LAYERS */}
        {post.image && (
          <div className="relative w-full overflow-hidden bg-black">
            <img
              src={post.image}
              className="w-full max-h-[650px] object-cover"
              alt=""
            />

            {parsed?.layers?.map((layer) => (
              <div
                key={layer.id}
                className="absolute font-bold"
                style={{
                  left: `${layer.x}px`,
                  top: `${layer.y}px`,
                  color: layer.color || "#fff",
                  fontSize: layer.fontSize || "18px",
                  textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {layer.text}
              </div>
            ))}
          </div>
        )}

        {/* TEXT POST */}
        {!post.image && parsed?.text && (
          <div
            className="min-h-[420px] flex items-center justify-center px-6 text-center"
            style={{
              background:
                parsed.background ||
                "linear-gradient(135deg,#6a11cb,#1a0033,#0b001a)",
            }}
          >
            <div className="text-2xl md:text-3xl font-bold leading-snug">
              {parsed.text}
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="flex justify-between px-4 py-3 text-purple-200 border-t border-white/10 text-sm">
          <span>❤️ {post.likes_count || 0}</span>
          <span>💬 {post.comments_count || 0}</span>
          <span>🔁 {post.shares_count || 0}</span>
        </div>

        {/* ACTION BAR (clean + modern) */}
        <div className="flex justify-around items-center py-4 border-t border-white/10">

          <button
            onClick={() => setLiked(!liked)}
            className="flex flex-col items-center gap-1"
          >
            <ThumbsUp
              size={22}
              fill={liked ? "#a855f7" : "none"}
              className="text-purple-400"
            />
            <span className="text-xs text-purple-200">Like</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <MessageCircle size={22} className="text-purple-400" />
            <span className="text-xs text-purple-200">Comment</span>
          </button>

          <button
            onClick={sharePost}
            className="flex flex-col items-center gap-1"
          >
            <BiShare size={22} className="text-purple-400" />
            <span className="text-xs text-purple-200">Share</span>
          </button>

        </div>

      </div>
    </div>
  );
}