"use client";

import { useEffect, useState } from "react";
import { BookingProvider, useBookingSignalR } from "@/context/BookingContext";
import { StaffTaskBoard } from "@/components/StaffTaskBoard";
import { ListChecks, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { DashboardGuard } from "@/components/DashboardGuard";

export default function StaffPortalPage() {
    const { lastUpdate } = useBookingSignalR();
    const [stats, setStats] = useState({
        criticalTasks: 0,
        activeStaff: 0,
        taskEfficiency: "0%",
        totalTasksHandled: 0
    });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/staff/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [lastUpdate]);

    return (
        <DashboardGuard allowedRoles={["Admin", "HotelManager", "Staff", "Receptionist"]}>
            <BookingProvider>
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                                Operational Task Board
                            </h1>
                            <p className="text-slate-500 mt-1 italic font-medium">Real-time synchronization with front-desk operations</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">System Live</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            { label: "Critical Priority", value: stats.criticalTasks, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
                            { label: "Active Staff", value: stats.activeStaff, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                            { label: "Task Efficiency", value: stats.taskEfficiency, icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                            { label: "Total Handled", value: stats.totalTasksHandled, icon: ListChecks, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 group hover:border-white/20 transition-all font-sans">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
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
            </BookingProvider>
        </DashboardGuard>
    );
}
