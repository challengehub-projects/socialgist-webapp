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
"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600",
"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600",
"https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1600",
];

const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
const timer = setInterval(() => {
setCurrentSlide((prev) => (prev + 1) % slides.length);
}, 5000);

return () => clearInterval(timer);


}, []);

return ( <div className="relative min-h-screen overflow-hidden bg-white">

```
  {/* BACKGROUND */}
  <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
    <div className="grid grid-cols-12 gap-6 p-10">
      {Array.from({ length: 120 }).map((_, i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-black" />
      ))}
    </div>
  </div>

  {/* BLUR GLOWS */}
  <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-purple-300 blur-[120px] opacity-20 pointer-events-none" />
  <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-300 blur-[120px] opacity-20 pointer-events-none" />

  {/* FLOATING ICONS */}
  <div className="absolute top-20 left-8 text-purple-200 pointer-events-none">
    <Users size={28} />
  </div>

  <div className="absolute top-36 right-8 text-purple-200 pointer-events-none">
    <MessageCircle size={26} />
  </div>

  <div className="absolute bottom-40 left-8 text-purple-200 pointer-events-none">
    <Share2 size={28} />
  </div>

  <div className="absolute bottom-24 right-8 text-pink-200 pointer-events-none">
    <Heart size={28} />
  </div>

  {/* MAIN CONTENT */}
  <div className="relative z-20">

    {/* HEADER */}
    <div className="flex items-center justify-between px-5 pt-6">

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 shadow-lg">
          <img
            src="/icon.png"
            alt="SocialGist"
            className="h-7 w-7 object-contain"
          />
        </div>

        <div>
          <h1 className="font-black text-lg text-gray-900">
            SocialGist
          </h1>
          <p className="text-xs text-gray-500">
            Campus vibes • real people
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/login")}
        className="font-semibold text-purple-600 transition hover:text-purple-700"
      >
        Sign In
      </button>

    </div>

    {/* HERO */}
    <div className="relative mx-5 mt-6 h-[360px] overflow-hidden rounded-3xl shadow-2xl">

      {slides.map((slide, index) => (
        <img
          key={slide}
          src={slide}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
            currentSlide === index
              ? "scale-100 opacity-100"
              : "scale-110 opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 p-6 text-white">
        <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
          🔥 Join thousands of students
        </div>

        <h1 className="text-3xl font-black leading-tight">
          Meet students beyond your department
        </h1>

        <p className="mt-3 text-sm text-white/80">
          Connect, share stories, discover trends, and build real
          friendships across campus.
        </p>
      </div>

    </div>

    {/* CTA */}
    <div className="px-5 mt-6 space-y-3">

      <button
        onClick={() => navigate("/signup")}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 font-bold text-white shadow-lg transition-all hover:bg-purple-700 active:scale-95"
      >
        Get Started
        <ArrowRight size={18} />
      </button>

      <button
        onClick={() => navigate("/login")}
        className="h-14 w-full rounded-2xl border border-gray-200 bg-white font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
      >
        I already have an account
      </button>

    </div>

    {/* FEATURES */}
    <div className="mt-8 grid grid-cols-2 gap-4 px-5">

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <MessageSquare className="mb-2 text-purple-500" />
        <h3 className="text-sm font-bold">Campus Gists</h3>
        <p className="mt-1 text-xs text-gray-500">
          Real conversations, trends and campus discussions.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <GraduationCap className="mb-2 text-purple-500" />
        <h3 className="text-sm font-bold">Across Faculties</h3>
        <p className="mt-1 text-xs text-gray-500">
          Meet students from every department.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <Heart className="mb-2 text-pink-500" />
        <h3 className="text-sm font-bold">Build Connections</h3>
        <p className="mt-1 text-xs text-gray-500">
          Make friends and grow your network.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <Flame className="mb-2 text-orange-500" />
        <h3 className="text-sm font-bold">Trending Posts</h3>
        <p className="mt-1 text-xs text-gray-500">
          Like, comment and share moments.
        </p>
      </div>

    </div>

    {/* SLIDER DOTS */}
    <div className="flex justify-center gap-2 py-8">
      {slides.map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            currentSlide === index
              ? "w-8 bg-purple-600"
              : "w-2 bg-gray-300"
          }`}
        />
      ))}
    </div>

  </div>
</div>

);
}
