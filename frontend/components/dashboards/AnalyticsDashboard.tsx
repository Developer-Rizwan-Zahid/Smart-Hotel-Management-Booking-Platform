import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, Users, Target, BarChart, Zap, Medal, Star, RefreshCw } from "lucide-react";
import { PerformanceLeaderboards } from "./PerformanceLeaderboards";

interface AnalyticsStats {
    totalRevenue: number;
    totalBookings: number;
    activeBookings: number;
    availableRooms: number;
    occupancyTrend: { date: string, occupancy: number }[];
}

export function AnalyticsDashboard() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/admin/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-12 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-500" />
                        Performance Alpha
                    </h1>
                    <p className="text-slate-500 mt-1 italic font-medium">Live hotel intelligence and revenue orchestration</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchStats}
                        className="bg-white/5 hover:bg-white/10 text-slate-400 p-3 rounded-2xl transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Download Metrics</button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter">Occupancy Velocity</h2>
                            <div className="p-3 bg-yellow-500/10 rounded-2xl flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">7-Day Trajectory</span>
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-48 gap-4 px-4 mb-2">
                            {stats?.occupancyTrend.map((d, i) => (
                                <div key={i} className="flex-1 group/bar relative">
                                    <div
                                        className={`w-full rounded-t-xl transition-all duration-700 ${d.occupancy > 5 ? 'bg-indigo-500' : 'bg-indigo-500/20'} group-hover/bar:bg-white`}
                                        style={{ height: `${Math.max((d.occupancy / 10) * 100, 10)}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                            {d.occupancy} Active
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase mt-4 text-center tracking-tighter">{d.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Target className="absolute top-0 right-0 w-64 h-64 text-indigo-500/5 -mt-20 -mr-20" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-3xl">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 italic">
                        <Medal className="w-6 h-6 text-indigo-400" />
                        Revenue Index
                    </h2>
                    <div className="space-y-4">
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Gross Revenue</p>
                            <p className="text-4xl font-black text-white tracking-tighter">${stats?.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">System Health</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[85%]" />
                                </div>
                                <span className="text-[10px] font-black text-white">99.8%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { label: "Total Bookings", val: stats?.totalBookings, trend: "+12%", icon: TrendingUp },
                    { label: "Active Stays", val: stats?.activeBookings, trend: "Live", icon: Users },
                    { label: "Empty Slots", val: stats?.availableRooms, trend: "Immediate", icon: Zap },
                    { label: "System Uptime", val: "99.9%", trend: "Optimal", icon: BarChart },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-all font-sans">
                        <div className="p-3 bg-white/5 rounded-2xl w-fit mb-4 group-hover:bg-indigo-500/10 transition-colors">
                            <kpi.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{kpi.label}</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-2xl font-black text-white">{kpi.val}</p>
                            <span className={`text-[10px] font-bold ${kpi.trend === 'Optimal' ? 'text-indigo-400' : 'text-emerald-400'}`}>{kpi.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-8 border-t border-white/5">
                <PerformanceLeaderboards />
            </div>
        </div>
    );
}
