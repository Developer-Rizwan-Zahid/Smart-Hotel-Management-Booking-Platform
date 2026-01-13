"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Zap, Sparkles, Globe, ArrowRight, ConciergeBell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePrimaryCta = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Premium Hotel Background Layer */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/resort-background.png"
          alt="Luxury hotel lobby"
          fill
          priority
          className="object-cover object-center opacity-40 md:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(129,140,248,0.35)_0,transparent_55%),radial-gradient(circle_at_90%_100%,rgba(56,189,248,0.3)_0,transparent_55%)] mix-blend-soft-light" />
      </div>

      {/* Floating Glass Navigation */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl"
      >
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-[0_18px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
              <ConciergeBell className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-300">
                Smart Hotel
              </span>
              <span className="text-sm md:text-base font-serif tracking-[0.3em] uppercase text-white/90">
                Serena Collection
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#services" className="hover:text-white transition-colors">Operations</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.22em] hover:bg-slate-100 transition-all shadow-xl shadow-white/20"
              >
                Open Console
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.22em] text-slate-200 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handlePrimaryCta}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-white text-[10px] font-black uppercase tracking-[0.22em] hover:brightness-110 transition-all shadow-xl shadow-indigo-500/40"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 md:pt-48 pb-28 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto grid gap-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15 text-[9px] font-black uppercase tracking-[0.32em] text-slate-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              Live hotel command centre
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.02] mb-6 drop-shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
              Elevate every stay with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-emerald-300">
                intelligent luxury.
              </span>
            </h1>

            <p className="max-w-xl text-[13px] md:text-sm text-slate-200/80 font-medium leading-relaxed mb-8">
              From boutique villas to enterprise hotel chains, Smart Hotel Serena unifies booking,
              pricing, housekeeping, and AI insights into one beautiful real‑time platform. Designed
              for GMs, revenue leaders, and front‑desk teams who demand both control and elegance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handlePrimaryCta}
                className="group relative px-8 py-4 rounded-2xl bg-white text-black font-black uppercase text-[11px] tracking-[0.28em] overflow-hidden transition-all hover:pr-12 shadow-[0_18px_65px_rgba(0,0,0,0.85)]"
              >
                <span className="relative z-10">{user ? "Enter Control Room" : "Launch Property"}</span>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-200/40 via-transparent to-emerald-200/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 rounded-2xl bg-black/40 border border-white/15 text-white font-black uppercase text-[11px] tracking-[0.28em] hover:bg-black/20 transition-all flex items-center justify-center gap-2"
              >
                View Live Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.28em] text-slate-300/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-300/50 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                </span>
                <span>Real‑time room grid</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-300/50 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-indigo-300" />
                </span>
                <span>Dynamic pricing engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-300/50 flex items-center justify-center">
                  <Globe className="w-3 h-3 text-sky-300" />
                </span>
                <span>Multi‑role access</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Premium Hotel Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="glass-card relative mt-4 md:mt-0"
            id="vision"
          >
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
              <Image
                src="/hotel-background.png"
                alt="Hotel room overview"
                fill
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[320px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-200/80">
                    Live Operations Snapshot
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-200/90">
                    Downtown Serena Flagship · Tonight
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-300/40 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Occupancy", value: "92%", tone: "text-emerald-200" },
                  { label: "ADR", value: "$248", tone: "text-indigo-200" },
                  { label: "RevPAR", value: "$228", tone: "text-sky-200" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl bg-black/50 border border-white/15 px-4 py-3 flex flex-col gap-1"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-300/80">
                      {kpi.label}
                    </span>
                    <span className={`text-lg font-semibold ${kpi.tone}`}>{kpi.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-200" />
                  <p className="text-[10px] font-medium text-slate-200/90 uppercase tracking-[0.24em]">
                    Secure bookings · PCI ready · GDPR aware
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* NEW: Amenities Section */}
        <section id="amenities" className="max-w-6xl mx-auto mt-24 mb-24">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Experience Luxury</span>
            <h2 className="text-3xl md:text-5xl font-serif mt-4 text-white">World-Class Amenities</h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { title: "Infinity Pool", desc: "A heated skyline oasis overlooking the city.", icon: "🌊" },
              { title: "Serena Spa", desc: "Rejuvenating treatments from global experts.", icon: "🌿" },
              { title: "Fine Dining", desc: "Michelin-starred culinary experiences.", icon: "🍽️" },
            ].map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={i}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all text-center group"
              >
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-lg font-serif mb-3 text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* NEW: Rooms Showcase */}
        <section id="rooms" className="relative py-24 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Accommodations</span>
                <h2 className="text-3xl md:text-5xl font-serif mt-4 text-white">Exquisite Suites</h2>
              </div>
              <button onClick={() => router.push('/login')} className="mt-6 md:mt-0 text-[10px] uppercase tracking-[0.25em] text-white border-b border-white/30 pb-1 hover:border-white transition-all">View All Rooms</button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Royal Penthouse", price: "$1,200", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop" },
                { name: "Ocean View King", price: "$450", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop" },
                { name: "Garden Villa", price: "$680", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop" },
              ].map((room, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  key={i}
                  onClick={() => router.push("/register")}
                  className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
                >
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold tracking-widest text-white z-10">
                    {room.price} / NIGHT
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 w-full z-10 pt-20">
                    <h3 className="text-2xl font-serif text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform">{room.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">Book Now <ArrowRight className="inline w-3 h-3 ml-1" /></p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Row (Original - Repurposed as 'Operations' section) */}
        <section id="features" className="max-w-6xl mx-auto mt-24 mb-24 px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Power & Control</span>
            <h2 className="text-3xl md:text-5xl font-serif mt-4 text-white">Operational Excellence</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Real-Time Front Desk",
                desc: "Live room calendar, instant check‑in/out, and conflict‑free bookings powered by SignalR.",
                icon: Sparkles,
                color: "text-indigo-300",
              },
              {
                title: "Dynamic Revenue",
                desc: "Season, segment, and demand‑based dynamic pricing enriched with AI scenarios.",
                icon: Zap,
                color: "text-amber-300",
              },
              {
                title: "Integrated Teams",
                desc: "Staff dashboards for housekeeping maintenance with auto‑tasks on checkout.",
                icon: Globe,
                color: "text-emerald-300",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-black/50 border border-white/10 rounded-3xl p-6 md:p-7 hover:bg-black/35 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </span>
                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.22em] text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[12px] md:text-[13px] text-slate-200/85 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* NEW: Final CTA */}
        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-[3rem] bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 relative z-10">Ready to transform your hotel?</h2>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto relative z-10">Join the thousands of operators using Serena Cloud to elevate guest experiences.</p>
            <button
              onClick={handlePrimaryCta}
              className="relative z-10 px-8 py-4 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-[0.22em] hover:scale-105 transition-transform shadow-xl"
            >
              Start Your Journey
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 mt-4 bg-black/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span className="text-[11px] font-serif tracking-[0.28em] uppercase font-semibold text-slate-200">
              Smart Hotel Serena
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center md:text-left">
            &copy; 2026 Serena Hospitality Cloud · Built for next‑generation operators
          </p>
          <div className="flex gap-5">
            <Shield className="w-4 h-4 text-slate-400 hover:text-emerald-300 cursor-pointer transition-colors" />
            <Globe className="w-4 h-4 text-slate-400 hover:text-indigo-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
