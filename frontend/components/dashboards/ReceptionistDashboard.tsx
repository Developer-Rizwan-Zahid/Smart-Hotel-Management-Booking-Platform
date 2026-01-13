"use client";

import { motion } from "framer-motion";
import { RoomCalendar } from "@/components/advanced-ui/RoomCalendar";
import { RoomAvailabilityGrid } from "@/components/bookings/RoomAvailabilityGrid";
import { Users, Clock, LogIn, LogOut, Search } from "lucide-react";

export function ReceptionistDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Front Desk Engine</h1>
                    <p className="text-slate-500 mt-1 italic font-medium">Live guest synchronization and room allocation</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            placeholder="Guest name or Room #"
                            className="bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: "Arrivals Today", value: "14", icon: LogIn, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Departures", value: "8", icon: LogOut, color: "text-orange-400", bg: "bg-orange-500/10" },
                    { label: "Currently In", value: "42", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Avg Wait Time", value: "4m", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Inventory Matrix</h2>
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden backdrop-blur-3xl">
                    <div className="p-8">
                        <RoomAvailabilityGrid />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Operational Timeline</h2>
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <RoomCalendar />
                </div>
            </div>
        </div>
    );
}
