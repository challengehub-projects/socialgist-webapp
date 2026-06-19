import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../configs/supbase";

export default function PostGate() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleContinue = () => {
    navigate(`/post/${postId}`);
  };

  const handleLogin = () => {
    navigate(`/login?redirect=/post/${postId}`);
  };

  return (
    <div className="gate-container">
      <h1>Join SocialGist</h1>

      <p>
        You’ve been invited to view a post. Join or log in to continue.
      </p>

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