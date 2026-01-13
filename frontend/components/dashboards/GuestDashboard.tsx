"use client";

import { motion } from "framer-motion";
import { MyBookingsList } from "@/components/bookings/MyBookingsList";
import { AiInsights } from "@/components/AiInsights";
import { Calendar, CreditCard, Sparkles, MapPin, CheckCircle, Download } from "lucide-react";

export function GuestDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Your Stay Experience</h1>
                    <p className="text-slate-500 mt-1 italic">Personalized concierge and booking management</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">VIP Member</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                My Reservations
                            </h2>
                            <MyBookingsList />
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MapPin className="w-32 h-32" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Upgrade Your Stay</h3>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">Experience ultimate luxury with our Presidential Suite upgrade, now at 20% off for your next visit.</p>
                            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform">Explore Suites</button>
                        </div>
                        <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-3xl">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            Billing Summary
                        </h3>
                        <div className="space-y-4">
                            {[1].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">Stay #42901</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Paid in Full</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors cursor-pointer" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">View All Invoices</button>
                    </div>
                </div>
            </div>

            <AiInsights isGuest={true} />
        </div>
    );
}
