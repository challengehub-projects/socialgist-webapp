// ================= APP.JSX =================

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
import SinglePost from "./pages/singlepost";
import SettingsPage from "./pages/settings";

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


  // ================= ONESIGNAL NOTIFICATIONS =================
  useEffect(() => {

    window.OneSignalDeferred =
      window.OneSignalDeferred || [];


    window.OneSignalDeferred.push(async (OneSignal) => {

      try {

        console.log("🔥 OneSignal ready");


        // Ask browser permission
        if (!OneSignal.Notifications.permission) {

          await OneSignal.Notifications.requestPermission();

        }


        console.log(
          "🔔 Permission:",
          OneSignal.Notifications.permission
        );


        if (!OneSignal.Notifications.permission) {
          console.log("❌ Notifications blocked");
          return;
        }


        // Get logged user
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();


        if (!user) {
          console.log("No user");
          return;
        }


        // connect OneSignal user
        await OneSignal.login(user.id);


        // make sure subscription exists
        await OneSignal.User.PushSubscription.optIn();


        const subscriptionId =
          OneSignal.User.PushSubscription.id;


        console.log(
          "🔥 Subscription ID:",
          subscriptionId
        );


        console.log(
          "🔥 OneSignal User:",
          OneSignal.User.onesignalId
        );


        // save subscription to supabase
        if (subscriptionId) {

          await supabase
            .from("profiles")
            .update({
              onesignal_subscription_id: subscriptionId
            })
            .eq(
              "id",
              user.id
            );


          console.log(
            "✅ Subscription saved"
          );
        }


      } catch (err) {

        console.error(
          "OneSignal setup error:",
          err
        );

      }

    });


  }, [session]);



  useEffect(() => {

window.OneSignalDeferred.push(async (OneSignal)=>{

console.log("OBJECT", OneSignal);

console.log(
"permission",
OneSignal.Notifications.permission
);

console.log(
"subscription",
OneSignal.User.PushSubscription
);

});

}, []);


  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoading(false);
  };




  // ================= SPLASH UI =================
  if (showSplash) {
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

  // ================= LOADING UI =================
  if (loading) {
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

  // ================= ROUTES =================
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/feed" /> : <WelcomePage />
          }
        />

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

        {/* PROTECTED ROUTES */}
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

        <Route
          path="/messages"
          element={
            session ? <Messages /> : <Navigate to="/" />
          }
        />

        <Route path="/profile/:id" element={<PublicProfilePage />} />

        <Route
          path="/profile"
          element={
            session ? <ProfilePage /> : <Navigate to="/" />
          }
        />


        <Route
          path="/settings"
          element={
            session ? <SettingsPage /> : <Navigate to="/" />
          }
        />

        <Route path="/post/:id" element={<SinglePost />} />

        <Route
          path="/profile-modal"
          element={
            session ? <ProfileModal /> : <Navigate to="/" />
          }
        />

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