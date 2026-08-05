import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10 animate-bounce duration-[10s]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Find the right people for the work
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Collaborate.</span> <br />
            Create.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A simple space for students to find collaborators, share ideas, and make progress on projects that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link 
              href="/signup" 
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] active:scale-95 w-full sm:w-auto"
            >
              Get Started for Free
            </Link>
            <Link 
              href="/students" 
              className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: 'Built for students', value: 'People first' },
              { label: 'Made for projects', value: 'Ideas to action' },
              { label: 'Easy to explore', value: 'Start anywhere' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-5xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{stat.value}</p>
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white tracking-tight mb-4">A clearer way to get started.</h2>
            <p className="text-slate-400 font-medium">Explore people, projects, ideas, and the skills behind them.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Project Recruitment', desc: 'Post your ideas and find specialized talent across campus.', icon: '🚀' },
              { title: 'Idea Pitches', desc: 'Submit anonymous pitches and get real feedback from the community.', icon: '💡' },
              { title: 'Neural Messaging', desc: 'Real-time collaboration with integrated peer messaging.', icon: '💬' },
              { title: 'Skill Badges', desc: 'Verify your expertise and earn reputation as you collaborate.', icon: '🏆' },
              { title: 'Student Directory', desc: 'Browse and filter students by skills, university, and year.', icon: '🔍' },
              { title: 'Smart Matching', desc: 'Our algorithm suggests teammates based on your skill gaps.', icon: '🧠' },
            ].map((feature, i) => (
              <div key={i} className="premium-card p-10 rounded-[2.5rem] group hover:-translate-y-2 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-3xl mb-8 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg italic">S</span>
            </div>
            <span className="font-black text-white tracking-tighter">SkillMatch</span>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
            © 2026 SkillMatch Platform. Engineered for excellence.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Terms</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
