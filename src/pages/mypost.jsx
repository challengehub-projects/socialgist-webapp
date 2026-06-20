import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import {
  ArrowLeft,
  MoreVertical,
  Heart,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { BiShare } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

export default function MyPosts({
  user,
  profileImages,
  formatTimeAgo,
  openUserProfile,
  likePost,
  likedPosts,
  animatingLike,
  openComments,
  setActivePost,
  setComments,
  setOpen,
  sharePost,
  deletePost,
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMyPosts = async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-3">

      {/* ================= HEADER (BACK BUTTON) ================= */}
      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white dark:bg-[#18191A] py-3 z-50">
        
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-bold">My Posts</h1>

      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading your posts...
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          You haven’t posted anything yet.
        </div>
      )}

      {/* ================= POSTS ================= */}
      {posts.map((post) => {
        const parsed = post.content || {};

        return (
          <div
            id={`post-${post.id}`}
            key={post.id}
            className="bg-white dark:bg-[#18191A] mb-4 sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition"
          >

            {/* ================= HEADER ================= */}
            <div className="flex items-center gap-3 px-4 py-4 relative">

              <div
                onClick={() => openUserProfile(post.user_id)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >

                {profileImages?.[post.user_id] ? (
                  <img
                    src={profileImages[post.user_id]}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                    {(post.profile_name || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {post.profile_name || "You"}
                  </h3>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {post.created_at
                      ? formatTimeAgo(post.created_at)
                      : "Just now"}
                  </div>
                </div>

              </div>

              {/* MENU */}
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <MoreVertical size={18} />
              </button>

            </div>

            {/* ================= DESCRIPTION ================= */}
            {post.description && (
              <div className="px-4 pb-3 text-[15px]">
                {post.description}
              </div>
            )}

            {/* ================= IMAGE ================= */}
            {post.image && (
              <div className="bg-black">
                <img
                  src={post.cached_image || post.image}
                  className="w-full max-h-[420px] object-contain"
                />
              </div>
            )}

            {/* ================= ACTION BAR ================= */}
            <div className="px-4 py-3">

              <div className="flex items-center justify-between mb-3">

                <div className="flex items-center gap-5">

                  <div className="flex items-center gap-1">
                    <Heart size={18} className="text-red-500" />
                    {post.likes_count || 0}
                  </div>

                  <div className="text-sm">
                    {post.comments_count || 0} comments
                  </div>

                  <div className="text-sm">
                    {post.shares_count || 0} shares
                  </div>

                </div>

                <div className="text-xs text-purple-600 font-semibold">
                  My Posts
                </div>

              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-3">

                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <ThumbsUp size={18} />
                  Like
                </button>

                <button
                  onClick={() => {
                    setActivePost(post);
                    setComments(post.comments || []);
                    setOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <MessageCircle size={18} />
                  Comment
                </button>

                <button
                  onClick={() => sharePost(post, post.id)}
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-purple-500/10 text-purple-600"
                >
                  <BiShare size={18} />
                  Share
                </button>

              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}