import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./configs/supbase";

// Pages
import WelcomePage from "./pages/welcome";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import HomeFeedPage from "./pages/feed";
import TopNavbar from "./pages/navbar";
import Messages from "./pages/messages";
import ProfilePage from "./pages/profile";
import ProfileModal from "./pages/profileModal";
import NotificationsPage from "./pages/notifications";
import PublicProfilePage from "./pages/publicProfile";
import SettingsPage from "./pages/settings";

// 🔥 NEW PAGES
import PostGate from "./pages/postGate";
import PostPage from "./pages/post";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // ================= SPLASH =================
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ================= AUTH =================
  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoading(false);
  };

  // ================= SPLASH UI =================
  if (showSplash || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img src="/icon.png" className="w-24 h-24 animate-pulse" />
          <h1 className="mt-4 text-2xl font-black text-purple-700">
            SocialGist
          </h1>
        </div>
      </div>
    );
  }

  // ================= POST WRAPPER =================
  function PostPageWrapper() {
    return (
      <>
        {session && <TopNavbar />}
        <PostPage />
      </>
    );
  }

  // ================= ROUTES =================
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROOT */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/feed" /> : <WelcomePage />
          }
        />

        {/* AUTH */}
        <Route
          path="/login"
          element={
            session ? <Navigate to="/feed" /> : <LoginPage />
          }
        />

        <Route
          path="/signup"
          element={
            session ? <Navigate to="/feed" /> : <SignupPage />
          }
        />

        {/* MAIN FEED */}
        <Route
          path="/feed"
          element={
            session ? (
              <>
                <TopNavbar />
                <HomeFeedPage />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            session ? <Messages /> : <Navigate to="/" />
          }
        />

        {/* PROFILES */}
        <Route path="/profile/:id" element={<PublicProfilePage />} />

        <Route
          path="/profile"
          element={
            session ? <ProfilePage /> : <Navigate to="/" />
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            session ? <SettingsPage /> : <Navigate to="/" />
          }
        />

        

        {/* OLD SINGLE POST (keep if needed) */}
        <Route path="/post/:id" element={<PostPage />} />

        {/* 🔥 NEW: SHARE GATE PAGE */}
        <Route path="/p/:id" element={<PostGate />} />


        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            session ? <NotificationsPage /> : <Navigate to="/" />
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate to={session ? "/feed" : "/"} />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}