import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      setPost(data);
    };

    fetchPost();
  }, [postId]);

  if (!post) return <p>Loading...</p>;

  const handleLogin = () => {
    navigate(`/login?redirect=/post/${postId}`);
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔥 GATE SECTION (only if not logged in) */}
      {!user && (
        <div className="gate-box">
          <h2>Join SocialGist</h2>

          <p>
            Join to unlock full experience and engage with this post.
          </p>

          <button onClick={handleLogin}>
            Join to unlock full experience
          </button>
        </div>
      )}

      {/* 🔥 POST CONTENT (blur if not logged in) */}
      <div style={{ opacity: user ? 1 : 0.4 }}>
        <h2>{post.title}</h2>
        <p>{post.description}</p>
      </div>

      {/* 🔥 ACTIONS */}
      <div style={{ marginTop: "20px" }}>

        <button onClick={() => navigate("/feed")}>
          Continue to Feed
        </button>

        {user && (
          <button onClick={() => alert("engage actions here")}>
            Like / Comment
          </button>
        )}

      </div>
    </div>
  );
}