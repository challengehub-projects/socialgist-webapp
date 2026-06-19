import React from "react";
import {
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Users,
  Send,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-purple-200/40 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-fuchsia-200/30 blur-[130px] rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6">

        <button
          onClick={() => navigate("/feed")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={18} />
       </button>

        <h1 className="font-bold text-lg text-gray-900">
          Messages
        </h1>

        <div className="w-10" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-16">

        {/* ICON CARD */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-200">
            <MessageCircle size={34} />
          </div>

          {/* small badge */}
          <div className="absolute -bottom-2 -right-2 bg-white border border-gray-100 rounded-full p-1 shadow">
            <Sparkles size={14} className="text-purple-500" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-black text-gray-900 mt-6">
          Messaging is Coming Soon
        </h2>

        {/* DESCRIPTION CARD */}
        <div className="mt-5 max-w-md bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <p className="text-gray-600 text-sm leading-6">
            We’re building a real-time campus chat system so you can connect,
            message, and build relationships with students across departments.
          </p>
        </div>

        {/* FEATURES PREVIEW */}
        <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md">

          <div className="bg-gray-50 border rounded-2xl p-3 text-center">
            <Users className="mx-auto text-purple-600" size={18} />
            <p className="text-xs mt-2 text-gray-600">Groups</p>
          </div>

          <div className="bg-gray-50 border rounded-2xl p-3 text-center">
            <Send className="mx-auto text-purple-600" size={18} />
            <p className="text-xs mt-2 text-gray-600">Chat</p>
          </div>

          <div className="bg-gray-50 border rounded-2xl p-3 text-center">
            <Lock className="mx-auto text-purple-600" size={18} />
            <p className="text-xs mt-2 text-gray-600">Secure</p>
          </div>

        </div>

        {/* BADGE */}
        <div className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold">
          <Sparkles size={14} />
          Version 2 Feature
        </div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-10 w-full text-center text-xs text-gray-400">
        SocialGist is evolving into a full campus ecosystem 🚀
      </div>

    </div>
  );
}