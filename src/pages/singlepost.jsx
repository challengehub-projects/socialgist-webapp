import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../configs/supbase";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { BiShare } from "react-icons/bi";
import { Loader2 } from "lucide-react";

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

    try {
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !postData) {
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
    } catch (err) {
      console.error(err);
      setPost(null);
    }

    setLoading(false);
  };

  // ✅ SAFE PARSE (fixes layers issue)
  let parsed = {};
  try {
    parsed =
      typeof post?.content === "string"
        ? JSON.parse(post.content)
        : post?.content || {};
  } catch {
    parsed = {};
  }

  const sharePost = async () => {
    const url = `${window.location.origin}/post/${id}`;

    const text = `${post?.profile?.full_name || "Someone"} posted on SocialGist`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SocialGist",
          text,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  // ================= LOADER =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b001a] via-[#1a0033] to-[#2a0066] text-white">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-sm text-purple-200">Loading post...</p>
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
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-[#0b001a] via-[#120022] to-[#2a0066] text-white">

      <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl min-h-screen">

        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <img
            src={
              post.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${
                post.profile?.full_name || "User"
              }`
            }
            className="w-10 h-10 rounded-full object-cover border border-purple-500"
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
          <div className="px-4 py-3">
            <p className="text-white whitespace-pre-wrap">
              {post.description}
            </p>
          </div>
        )}

        {/* IMAGE + LAYERS (FIXED OVERLAY SYSTEM) */}
        {post.image && (
          <div className="relative w-full">
            <img
              src={post.image}
              className="w-full object-cover max-h-[600px]"
              alt=""
            />

            {parsed?.layers?.map((layer) => (
              <div
                key={layer.id}
                className="absolute font-bold"
                style={{
                  left: `${layer.x}px`,
                  top: `${layer.y}px`,
                  color: layer.color || "white",
                  fontSize: layer.fontSize || "20px",
                  textShadow: "0 3px 10px rgba(0,0,0,0.8)",
                  whiteSpace: "pre-wrap",
                  zIndex: 10,
                }}
              >
                {layer.text}
              </div>
            ))}
          </div>
        )}

        {/* TEXT POST (SOCIALGIST STYLE STATUS) */}
        {!post.image && parsed?.text && (
          <div
            className="min-h-[450px] flex items-center justify-center px-6 text-center"
            style={{
              background:
                parsed.background ||
                "linear-gradient(135deg,#6a11cb,#2a0066,#0b001a)",
            }}
          >
            <div className="text-3xl font-bold whitespace-pre-wrap">
              {parsed.text}
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="flex justify-between px-4 py-3 text-purple-200 border-t border-white/10">
          <span>❤️ {post.likes_count || 0}</span>
          <span>💬 {post.comments_count || 0}</span>
          <span>🔁 {post.shares_count || 0}</span>
        </div>

        {/* ACTION BAR (TikTok + WhatsApp vibe) */}
        <div className="flex justify-around items-center py-4 border-t border-white/10">

          <button
            onClick={() => setLiked(!liked)}
            className="flex flex-col items-center gap-1"
          >
            <ThumbsUp size={22} fill={liked ? "white" : "none"} />
            <span className="text-xs">Like</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <MessageCircle size={22} />
            <span className="text-xs">Comment</span>
          </button>

          <button
            onClick={sharePost}
            className="flex flex-col items-center gap-1 text-purple-300"
          >
            <BiShare size={22} />
            <span className="text-xs">Share</span>
          </button>

        </div>

      </div>
    </div>
  );
}