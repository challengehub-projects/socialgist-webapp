import React from "react";
import { MessageCircle, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Messages({
    post,
}) {
    const navigate = useNavigate();


    return (
        <div className="min-h-screen bg-white relative overflow-hidden">

            {/* SOFT BACKGROUND GLOW */}
            <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-200/40 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-fuchsia-200/30 blur-[120px] rounded-full" />

            {/* HEADER */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-6">

                <button
                    onClick={() => navigate("/feed")}
                    className="flex items-center gap-2 text-gray-600 font-medium"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="font-bold text-lg text-gray-900">
                    Messages
                </h1>

                <div className="w-6" />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-20">

                {/* ICON */}
                <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                    <MessageCircle size={32} />
                </div>

                {/* TITLE */}
                <h2 className="text-2xl font-black text-gray-900 mt-6">
                    Messages Coming Soon
                </h2>

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-sm leading-6 mt-3 max-w-sm">
                    The campus messaging system is currently under development.
                    In v2, you’ll be able to chat, connect, and build real-time
                    relationships with students across departments.
                </p>

                {/* BADGE */}
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold">
                    <Sparkles size={14} />
                    Version 2 Feature
                </div>

            </div>

            {/* FOOTER NOTE */}
            <div className="absolute bottom-10 w-full text-center text-xs text-gray-400">
                Stay tuned — SocialGist is evolving 🚀
            </div>

        </div>
    );
}

