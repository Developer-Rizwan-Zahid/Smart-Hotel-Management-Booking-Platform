"use client";

import { StaffTaskBoard } from "@/components/StaffTaskBoard";
import { ListChecks, Zap, ShieldCheck, AlertCircle } from "lucide-react";

export function StaffDashboardView() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        Mission Control
                    </h1>
                    <p className="text-slate-500 mt-1 italic font-medium">Real-time task synchronization for operational units</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Active Shift</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: "High Priority", value: "3", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
                    { label: "My Tasks", value: "12", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                    { label: "Team Health", value: "94%", icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Completed Today", value: "28", icon: ListChecks, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl backdrop-blur-3xl overflow-hidden">
                <div className="p-8">
                    <StaffTaskBoard />
                </div>
            </div>
        </div>
    );
}
