"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "@/components/DashboardStats";
import { AiInsights } from "@/components/AiInsights";
import { TrendingUp, Users, DollarSign, BarChart2, PieChart, Activity } from "lucide-react";

export function ManagerDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Revenue Command</h1>
                    <p className="text-slate-500 mt-1 italic font-medium">Strategic oversight and AI-driven yield management</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">+12.4% MoM</span>
                    </div>
                </div>
            </div>

            <DashboardStats />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Occupancy Forecast</h2>
                            <p className="text-xs text-slate-500">Predictive analysis for the next 30 days</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase">Volume</button>
                            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase">Revenue</button>
                        </div>
                    </div>

                    {/* Placeholder for complex chart */}
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
                        <BarChart2 className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Real-time Heatmap Loading</span>
                    </div>

                    <Activity className="absolute bottom-0 right-0 w-64 h-64 text-indigo-500/5 -mb-20 -mr-20" />
                </div>

                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-indigo-400" />
                            Channel Mix
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Direct Booking", val: 65, color: "bg-indigo-500" },
                                { label: "OTA (Booking.com)", val: 20, color: "bg-blue-500" },
                                { label: "Corporate", val: 15, color: "bg-purple-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/20 rounded-[2rem] p-8">
                        <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Manager's Note</h3>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"The upcoming holiday weekend shows a 15% surge in demand. AI recommends adjusting Suite pricing by +$20."</p>
                    </div>
                </div>
            </div>

            <AiInsights />
        </div>
    );
}
