import React from 'react';
import { MessageSquare, Flame, Sparkles, GraduationCap, Heart, ArrowRight } from 'lucide-react';

export default function WelcomePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-purple-50 text-purple-950 font-sans antialiased flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <img src="/icon.png" alt="Logo"/>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-purple-950 to-purple-800">
            SocialGist
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')} 
            className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
          >
            Sign in
          </button>
          <button 
            onClick={() => onNavigate('signup')} 
            className="text-sm font-medium px-4 py-2 rounded-xl bg-purple-900 text-white hover:bg-purple-800 transition-all shadow-sm shadow-purple-200"
          >
            Join now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-grow flex flex-col justify-center items-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100/70 text-purple-800 mb-6 border border-purple-200Skin">
          The ultimate campus playground
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-purple-950 max-w-2xl leading-[1.1] mb-6">
          Where your campus <br />
          <span className="bg-gradient-to-r bg-clip-text text-transparent from-purple-600 via-fuchsia-600 to-indigo-600">
            comes to spill the tea.
          </span>
        </h1>
        <p className="text-lg text-purple-600/80 max-w-xl mb-10 leading-relaxed">
          From late-night assignment help to the juiciest anonymous gists, daily memes, and campus crushes. It's all happening here.
        </p>
        
        {/* Call to Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <button 
            onClick={() => onNavigate('signup')}
            className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 text-white font-medium hover:bg-purple-500 active:scale-[0.99] transition-all shadow-lg shadow-purple-200"
          >
            Get started
            <ArrowRight className="h-4 w-4 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-4 gap-6 mt-24 max-w-5xl text-left">
          
          {/* Card 1: Gist & Memes */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm shadow-purple-100/40">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-purple-950 mb-1">Gist & Memes</h3>
            <p className="text-xs text-purple-600/70 leading-relaxed">
              Share the funniest campus struggles, viral memes, and local banter anonymously.
            </p>
          </div>
          
          {/* Card 2: Academic Help */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm shadow-purple-100/40">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-purple-950 mb-1">Academic Help</h3>
            <p className="text-xs text-purple-600/70 leading-relaxed">
              Find study partners, trade past questions, or look for homework lifelines.
            </p>
          </div>
          
          {/* Card 3: Relationships */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm shadow-purple-100/40">
            <div className="h-10 w-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-purple-950 mb-1">Crushes & Dates</h3>
            <p className="text-xs text-purple-600/70 leading-relaxed">
              Shoot your shot safely, match up for campus prom, or talk relationship advice.
            </p>
          </div>

          {/* Card 4: Confessions */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm shadow-purple-100/40">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-purple-950 mb-1">Hot Takes</h3>
            <p className="text-xs text-purple-600/70 leading-relaxed">
              Drop unfiltered confessions and campus reviews without revealing your profile.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-100/80 text-center text-xs text-purple-400">
        &copy; {new Date().getFullYear()} SocialGist Inc. All rights reserved.
      </footer>
    </div>
  );
}
