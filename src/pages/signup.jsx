import React, { useState } from "react";
import { User, Lock, ArrowRight, School, AtSign } from "lucide-react";
import { supabase } from "../configs/supbase";

export default function SignupPage({ onNavigate }) {
  const [form, setForm] = useState({
    displayName: "",
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= ERROR HANDLER =================
  const getFriendlyError = (err) => {
    const msg = err?.message?.toLowerCase() || "";

    if (!navigator.onLine) {
      return "No internet connection. Please check your network.";
    }

    if (msg.includes("user already registered")) {
      return "This email is already registered. Please login instead.";
    }

    if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
      return "Invalid email or password.";
    }

    if (msg.includes("password")) {
      return "Password is too weak. Use at least 6 characters.";
    }

    if (msg.includes("email")) {
      return "Please enter a valid email address.";
    }

    if (msg.includes("rate limit")) {
      return "Too many attempts. Please wait and try again.";
    }

    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network error. Please try again.";
    }

    if (msg.includes("duplicate")) {
      return "Account already exists.";
    }

    return err?.message || "Something went wrong. Try again.";
  };

  // ================= SIGNUP =================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = form.identifier?.trim();
      const password = form.password?.trim();
      const full_name = form.displayName?.trim();

      // ================= VALIDATION =================
      if (!email || !password || !full_name) {
        throw new Error("All fields are required.");
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      // ================= CHECK IF USER EXISTS (SMART DETECTION) =================
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        throw new Error("This email is already registered. Please login.");
      }

      // ================= CREATE AUTH USER =================
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      });

      if (authError) throw authError;

      const user = data?.user;

      if (!user) {
        throw new Error("Account creation failed. Try again.");
      }

      // ================= CREATE PROFILE =================
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: form.displayName,
            username: email.split("@")[0],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error(profileError);
        throw new Error("Profile setup failed. Try again.");
      }

      // success
      onNavigate("login");

    } catch (err) {
      console.log(err);
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">

      {/* background glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-200 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-indigo-200 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-7">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center">
              <School />
            </div>

            <h1 className="text-2xl font-bold mt-4">
              Join your campus network
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Connect, share posts, and build your community.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignup} className="space-y-4">

            {/* NAME */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="displayName"
                placeholder="Full name"
                onChange={handleChange}
                className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="identifier"
                placeholder="Email"
                onChange={handleChange}
                className="w-full h-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
              />
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
              className="w-full h-12 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
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