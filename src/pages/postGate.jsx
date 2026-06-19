import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../configs/supbase";

export default function PostGate() {
  const { id } = useParams(); // ✅ FIXED HERE
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleContinue = () => {
    navigate(`/post/${id}`);
  };

  const handleLogin = () => {
    navigate(`/login?redirect=/post/${id}`);
  };

  return (
    <div className="gate-container">
      <h1>Join SocialGist</h1>

      <p>You’ve been invited to view a post.</p>

      {!user ? (
        <>
          <button onClick={handleLogin}>
            Login / Join Community
          </button>

          <button onClick={handleContinue}>
            Continue to Feed
          </button>
        </>
      ) : (
        <button onClick={handleContinue}>
          Continue to Post
        </button>
      )}
    </div>
  );
}