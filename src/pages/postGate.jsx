import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../configs/supbase";

export default function PostGate() {
  const { id } = useParams();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b001a] via-[#1a0033] to-black px-4 text-white">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl text-center">

        {/* ICON */}
        <div className="text-5xl mb-3">🔗</div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold">
          You’ve been invited
        </h1>

        {/* SUBTEXT */}
        <p className="text-sm text-white/70 mt-2">
          Someone shared a post with you on{" "}
          <span className="font-semibold text-white">SocialGist</span>
        </p>

        {/* INFO BOX */}
        <div className="mt-5 p-3 rounded-xl bg-white/10 text-sm text-white/80">
          View the full post or join the community to interact and engage.
        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex flex-col gap-3">

          {!user ? (
            <>
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
              >
                Login / Join Community
              </button>

              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
              >
                Continue to Post
              </button>
            </>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              Continue to Post
            </button>
          )}

        </div>

        {/* FOOTER */}
        <p className="mt-6 text-xs text-white/40">
          SocialGist • Share • Discover • Connect
        </p>

      </div>
    </div>
  );
}