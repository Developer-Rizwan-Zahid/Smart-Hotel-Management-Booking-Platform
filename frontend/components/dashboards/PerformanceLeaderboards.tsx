"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Star, TrendingUp, Users, Zap, Award, Crown } from "lucide-react";

interface LeaderboardData {
    roomTypePerformance: { type: string, revenue: number, bookings: number }[];
    staffLeaderboard: { name: string, completedTasks: number, score: number }[];
    seasonalGrowth: number;
    topRooms: { roomNumber: string, rankFactor: number }[];
}

export function PerformanceLeaderboards() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/admin/leaderboards", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setData(await res.json());
            } catch (error) {
                console.error("Failed to fetch leaderboards", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboards();
    }, []);

    if (loading) return <div className="p-10 text-slate-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Synchronizing Leaderboards...</div>;

    return (
        <div className="space-y-12">
            {/* Seasonal Comparison Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Seasonal <span className="text-indigo-200">Momentum</span></h2>
                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mt-1">Comparative revenue trajectory vs previous cycle</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-6xl font-black tracking-tighter ${data?.seasonalGrowth! >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                            {data?.seasonalGrowth! >= 0 ? "+" : ""}{data?.seasonalGrowth.toFixed(1)}%
                        </p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">Revenue Growth Index</p>
                    </div>
                </div>
                <TrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Staff Hall of Fame */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-yellow-500/10 rounded-2xl">
                            <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-black text-white italic uppercase">Staff Elite</h3>
                    </div>
                    <div className="space-y-4">
                        {data?.staffLeaderboard.map((staff, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-yellow-500/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? "bg-yellow-500 text-black" :
                                            i === 1 ? "bg-slate-300 text-black" :
                                                i === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-white"
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-tight">{staff.name}</p>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{staff.completedTasks} Tasks Handled</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-yellow-500">{staff.score} XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performing Asset Types */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                            <Zap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white italic uppercase">Asset Velocity</h3>
                    </div>
                    <div className="space-y-6">
                        {data?.roomTypePerformance.map((room, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.type}</p>
                                    <p className="text-sm font-black text-white">${room.revenue.toLocaleString()}</p>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(room.revenue / data.roomTypePerformance[0].revenue) * 100}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[8px] font-black text-slate-600 uppercase">{room.bookings} Bookings</p>
                                    <p className="text-[8px] font-black text-indigo-400 uppercase">Growth Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High-Turnover Units */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl">
                            <Award className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-black text-white italic uppercase">Alpha Units</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {data?.topRooms.map((room, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-emerald-500/5 transition-all">
                                <div className="text-2xl font-black text-slate-800 group-hover:text-emerald-500/20 italic">
                                    #{i + 1}
                                </div>
                                <div>
                                    <p className="text-lg font-black text-white tracking-tighter">Room {room.roomNumber}</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimal Performance</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3].map(s => <Star key={s} className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
