import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
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

      // go to feed
      onNavigate("feed");

    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-purple-100">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <img src="/icon.png" className="w-16 h-16 rounded-2xl mb-4" />

          <h1 className="text-3xl font-black text-purple-950">
            Welcome Back
          </h1>

          <p className="text-sm text-purple-400 mt-2">
            Continue to your feed
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-purple-500 uppercase">
              Email
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50 border border-purple-100"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-purple-500 uppercase">
              Password
            </label>

            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-purple-50 border border-purple-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* SWITCH */}
        <p className="text-sm text-center mt-6 text-purple-400">
          Don’t have an account?{" "}
          <button
            onClick={() => onNavigate("signup")}
            className="text-purple-600 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}