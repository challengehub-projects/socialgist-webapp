import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  School,
  Sparkles,
} from "lucide-react";
import { supabase } from "../configs/supbase";

export default function LoginPage({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      onNavigate("feed");
    } catch (err) {
      setError("Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 relative overflow-hidden">

      {/* SOFT BACKGROUND GLOW */}
      <div className="absolute top-[-120px] right-[-120px] w-[300px] h-[300px] bg-purple-200 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[300px] h-[300px] bg-indigo-200 blur-[120px] rounded-full" />

      {/* CARD */}
      <div className="relative w-full max-w-md">

        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-7">

          {/* HEADER */}
          <div className="text-center mb-7">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <School />
            </div>

            <h1 className="text-2xl font-bold mt-4 text-gray-900">
              Welcome back
            </h1>

            <p className="text-sm text-gray-500 mt-2 leading-6">
              Continue your campus journey — see posts, chat with friends, and stay connected.
            </p>

            <div className="flex justify-center mt-3 text-purple-400">
              <Sparkles size={16} />
            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Email
              </label>

              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Password
              </label>

              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* FOOTER */}
          <div className="text-center mt-6 text-sm text-gray-500">
            Don’t have an account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-purple-600 font-semibold"
            >
              Create one
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}