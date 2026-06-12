import React, { useState } from "react";
import {
  Mail,
  User,
  Lock,
  ArrowRight,
  School,
  AtSign,
} from "lucide-react";
import { supabase } from "../configs/supbase";

export default function SignupPage({ onNavigate }) {
  const [form, setForm] = useState({
    displayName: "",
    identifier: "", // email OR username
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = form.identifier.includes("@");

      const { error } = await supabase.auth.signUp({
        email: isEmail ? form.identifier : undefined,
        password: form.password,
        options: {
          data: {
            full_name: form.displayName,
            username: isEmail ? null : form.identifier,
          },
        },
      });

      if (error) throw error;

      onNavigate("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">

      {/* soft glow background */}
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-200 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-indigo-200 blur-[120px] rounded-full" />

      {/* CARD */}
      <div className="relative w-full max-w-md">

        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-7">

          {/* HEADER */}
          <div className="text-center mb-6">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <School />
            </div>

            <h1 className="text-2xl font-bold mt-4">
              Join your campus network
            </h1>

            <p className="text-sm text-gray-500 mt-2 leading-6">
              Connect with students across departments, share posts, make friends, and build real relationships.
            </p>

          </div>

          {/* FORM */}
          <form onSubmit={handleSignup} className="space-y-4">

            {/* NAME */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="displayName"
                placeholder="Full name or nickname"
                onChange={handleChange}
                className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* EMAIL OR USERNAME */}
            <div className="relative">
              <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="identifier"
                placeholder="Email or username"
                onChange={handleChange}
                className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use email for email login or username for campus handle
              </p>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              {loading ? "Creating your space..." : "Create account"}
              <ArrowRight size={18} />
            </button>

          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-purple-600 font-semibold"
            >
              Sign in
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}