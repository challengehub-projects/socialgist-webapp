import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { BiShare } from "react-icons/bi";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  // ================= USER =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // ================= POST =================
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("POST ERROR:", error);
      }

      setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  // ================= LIKE =================
  const likePost = async () => {
    if (!user || !post) return;

    const newCount = liked
      ? Math.max(0, (post.likes_count || 0) - 1)
      : (post.likes_count || 0) + 1;

    setLiked(!liked);

    setPost((prev) => ({
      ...prev,
      likes_count: newCount,
    }));

    await supabase
      .from("posts")
      .update({ likes_count: newCount })
      .eq("id", post.id);
  };

  // ================= COMMENT =================
  const addComment = async () => {
    if (!user || !commentText.trim()) return;

    const newComment = {
      id: crypto.randomUUID(),
      user: user?.user_metadata?.full_name || "User",
      text: commentText,
      created_at: new Date().toISOString(),
    };

    const updated = [newComment, ...(post.comments || [])];

    setPost((prev) => ({
      ...prev,
      comments: updated,
      comments_count: updated.length,
    }));

    setCommentText("");

    await supabase
      .from("posts")
      .update({
        comments: updated,
        comments_count: updated.length,
      })
      .eq("id", post.id);
  };

  // ================= SHARE =================
  const sharePost = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      });
    } catch (err) {
      console.log("Share failed", err);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b001a] to-black text-white px-4 py-6 flex justify-center">

      <div className="w-full max-w-xl">

        {/* ================= GATE ================= */}
        {!user && (
          <div className="mb-4 p-4 rounded-xl bg-white/10 border border-white/10 text-center">
            <h2 className="font-bold text-lg">Join SocialGist</h2>
            <p className="text-sm text-white/70 mt-1">
              Login to like, comment and interact
            </p>

            <button
              onClick={() =>
                navigate(`/login?redirect=/post/${id}`)
              }
              className="mt-3 w-full py-2 rounded-lg bg-purple-600"
            >
              Login / Join
            </button>
          </div>
        )}

        {/* ================= CARD ================= */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">

          {/* USER */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              {post.profile_name?.charAt(0) || "U"}
            </div>

            <div>
              <p className="font-semibold">
                {post.profile_name || "User"}
              </p>
              <p className="text-xs text-white/50">
                Just now
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <h2 className="font-bold text-lg mb-2">
            {post.title}
          </h2>

          <p className="text-white/80 text-sm">
            {post.description}
          </p>

          {/* IMAGE */}
          {post.image && (
            <img
              src={post.image}
              className="mt-3 rounded-xl w-full"
            />
          )}

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">

            {/* LIKE */}
            <button
              onClick={likePost}
              className="flex items-center gap-2 text-sm"
            >
              <Heart
                size={18}
                fill={liked ? "red" : "none"}
                className="text-red-400"
              />
              {post.likes_count || 0}
            </button>

            {/* COMMENT */}
            <button className="flex items-center gap-2 text-sm">
              <MessageCircle size={18} />
              {post.comments_count || 0}
            </button>

            {/* SHARE */}
            <button
              onClick={sharePost}
              className="flex items-center gap-2 text-sm"
            >
              <BiShare />
              Share
            </button>
          </div>
        </div>

        {/* ================= COMMENT BOX ================= */}
        {user && (
          <div className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-full bg-white/10 outline-none"
            />

            <button
              onClick={addComment}
              className="px-4 py-2 bg-purple-600 rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        )}

        {/* ================= BACK ================= */}
        <button
          onClick={() => navigate("/feed")}
          className="mt-6 w-full py-2 border border-white/10 rounded-xl"
        >
          Back to Feed
        </button>

      </div>
    </div>
  );
}