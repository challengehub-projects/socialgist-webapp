import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  GraduationCap,
  Heart,
  Flame,
  Users,
  Share2,
  MessageCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  const slides = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1600",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="grid grid-cols-12 gap-6 p-10">
          {Array.from({ length: 120 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-black rounded-full" />
          ))}
        </div>
      </div>

      {/* FLOATING ICONS */}
      <div className="absolute top-20 left-10 text-purple-200">
        <Users size={28} />
      </div>
      <div className="absolute top-40 right-10 text-purple-200">
        <MessageCircle size={26} />
      </div>
      <div className="absolute bottom-40 left-10 text-purple-200">
        <Share2 size={28} />
      </div>
      <div className="absolute bottom-20 right-10 text-purple-200">
        <Heart size={28} />
      </div>

      {/* HEADER */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md">
            <img src="/icon.png" className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-black text-lg text-gray-900">SocialGist</h1>
            <p className="text-xs text-gray-500">Campus vibes • real people</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="text-purple-600 font-semibold"
        >
          Sign in
        </button>
      </div>

      {/* HERO */}
      <div className="relative mt-6 mx-5 h-[340px] rounded-3xl overflow-hidden shadow-xl">
        {slides.map((slide, index) => (
          <img
            key={slide}
            src={slide}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              currentSlide === index
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute bottom-0 p-5 text-white">
          <h1 className="text-2xl font-black leading-tight">
            Meet students beyond your department
          </h1>
          <p className="text-white/80 text-sm mt-2">
            Chat, vibe, connect, and discover real campus stories.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-6 space-y-3">
        <button
          onClick={() => onNavigate("signup")}
          className="w-full h-14 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
        >
          Get Started <ArrowRight size={18} />
        </button>

        <button
          onClick={() => onNavigate("login")}
          className="w-full h-14 rounded-2xl border border-gray-200 text-gray-700 font-semibold active:scale-95 transition"
        >
          I already have an account
        </button>
      </div>

      {/* FEATURES */}
      <div className="px-5 mt-8 grid grid-cols-2 gap-4">

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <MessageSquare className="text-purple-500 mb-2" />
          <h3 className="font-bold text-sm">Campus Gists</h3>
          <p className="text-xs text-gray-500 mt-1">
            Trends, gossip & real conversations.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <GraduationCap className="text-purple-500 mb-2" />
          <h3 className="font-bold text-sm">Across Faculties</h3>
          <p className="text-xs text-gray-500 mt-1">
            Connect beyond your department.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <Heart className="text-pink-500 mb-2" />
          <h3 className="font-bold text-sm">Social Connections</h3>
          <p className="text-xs text-gray-500 mt-1">
            Make friends and build relationships.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <Flame className="text-orange-500 mb-2" />
          <h3 className="font-bold text-sm">Trending Posts</h3>
          <p className="text-xs text-gray-500 mt-1">
            Like, comment, share moments.
          </p>
        </div>

      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-6 pb-10">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index
                ? "w-8 bg-purple-600"
                : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}