import React from 'react';
import { ShieldAlert, Scale, Flame, ArrowLeft, GraduationCap } from 'lucide-react';

export default function TermsOfServicePage({ onNavigate }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 text-purple-950 font-sans antialiased flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm shadow-purple-100/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('welcome')}
            className="p-2 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-purple-950">SocialGist Honor Code</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-purple-400 bg-purple-100/50 px-3 py-1 rounded-full border border-purple-200/50">
          Last Updated: May 2026
        </span>
      </header>

      {/* BODY LAYOUT */}
      <div className="max-w-6xl w-full mx-auto flex-grow flex flex-col lg:flex-row gap-8 px-4 sm:px-6 py-10 items-start">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 flex flex-col space-y-1 bg-white p-4 rounded-2xl border border-purple-100/80 shadow-sm lg:sticky lg:top-20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-4 mb-2">Outline</p>
          <button onClick={() => scrollToSection('eligibility')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all">
            1. Student Eligibility
          </button>
          <button onClick={() => scrollToSection('honor-code')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all">
            2. Campus Honor Code
          </button>
          <button onClick={() => scrollToSection('gists-memes')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all">
            3. Anonymous Rules
          </button>
          <button onClick={() => scrollToSection('dating-safety')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all">
            4. Dating & Crushes
          </button>
          <button onClick={() => scrollToSection('liability')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all">
            5. Access Termination
          </button>
        </aside>

        {/* LEGAL MAIN TEXT */}
        <main className="flex-1 bg-white border border-purple-100 rounded-3xl shadow-sm p-6 sm:p-10 space-y-10">
          
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-purple-950">Terms of Service</h1>
            <p className="text-xs text-purple-700/90 leading-relaxed">
              Welcome to SocialGist. By creating an account, verified via your institutional email or phone number, you enter a binding agreement with SocialGist Inc. Please read these terms carefully to protect your profile standing.
            </p>
          </div>

          <section id="eligibility" className="space-y-3 scroll-mt-24">
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
              Student Eligibility & Verification
            </h2>
            <p className="text-xs text-purple-600/90 leading-relaxed">
              SocialGist is exclusively engineered for active university students and verified staff members. Registration requires a valid institutional `.edu` email address or verified device phone number. Impersonating other students, university faculty, or campus officials is strictly forbidden and results in instant, permanent terminal access bans.
            </p>
          </section>

          <section id="honor-code" className="space-y-3 scroll-mt-24">
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
              Campus Academic Honor Code
            </h2>
            <div className="flex gap-4 items-start bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4">
              <GraduationCap className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950/80 leading-relaxed">
                Our Academic Help hubs are built for collaborative study assistance, flashcard trading, and sharing textbook outlines. <strong>You are explicitly forbidden from uploading active exam keys, live test cheat sheets, or unauthorized homework blueprints.</strong> SocialGist strictly respects university honor boards and will cooperate with institutional integrity inquiries if intellectual property theft or cheating networks are identified.
              </p>
            </div>
          </section>

          <section id="gists-memes" className="space-y-3 scroll-mt-24">
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center text-xs font-bold">3</span>
              Anonymous Gists & Media Upload Rules
            </h2>
            <p className="text-xs text-purple-600/90 leading-relaxed">
              Spilling the tea is fun, but safety is paramount. When using our anonymous post triggers, you retain your privacy, but you do not escape accountability. Content containing malicious cyberbullying, explicit targeted harassment, doxed private phone numbers/addresses, or revenge media is completely banned. All reported media is subjected to strict content screening.
            </p>
            <div className="flex gap-4 items-start bg-fuchsia-50/30 border border-fuchsia-100 rounded-2xl p-4">
              <Flame className="h-5 w-5 text-fuchsia-600 shrink-0 mt-0.5" />
              <p className="text-xs text-fuchsia-950/80 leading-relaxed">
                <strong>Zero Tolerance Policy:</strong> Any user caught orchestrating campaigns intended to ruin another student's psychological wellbeing will have their identity metrics blacklisted from our servers permanently.
              </p>
            </div>
          </section>

          <section id="dating-safety" className="space-y-3 scroll-mt-24">
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">4</span>
              Dating & Crush Interaction Framework
            </h2>
            <p className="text-xs text-purple-600/90 leading-relaxed">
              Our Match Radar and crush signaling waves are intended to build healthy, fun connections across your college batches. Unsolicited explicit media, obsessive stalking behaviors, sending repeated waves after being blocked, or leveraging match details to track peers physically across physical campus blocks constitutes predatory behavior. Use common sense, treat your peers with respect, and keep the romance clean.
            </p>
          </section>

          <section id="liability" className="space-y-3 scroll-mt-24">
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">5</span>
              Limitation of Liability & Termination
            </h2>
            <p className="text-xs text-purple-600/90 leading-relaxed">
              SocialGist acts purely as a crowd-sourced campus community noticeboard. We do not certify the absolute truth of peer confessions, anonymous hot takes, or academic material accuracy. We provide our services on an "as-is" basis without warranties. We reserve the absolute operational authority to shut down access loops, wipe server content logs, or instantly cancel user accounts violating community bylaws without prior notification.
            </p>
          </section>

          <div className="pt-6 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-purple-400">
              <ShieldAlert className="h-4 w-4 text-purple-400" />
              <span>By interacting with the platform, you acknowledge compliance.</span>
            </div>
            <button 
              onClick={() => onNavigate('signup')}
              className="text-xs font-bold px-5 py-2.5 bg-purple-600 text-white hover:bg-purple-500 rounded-xl shadow-md shadow-purple-100 transition-all active:scale-[0.98]"
            >
              Back to Signup
            </button>
          </div>

        </main>
      </div>

      </div>

  );
}