"use client";

import { motion } from "framer-motion";
import { Shield, Users, Server, HardDrive, Terminal, History, Lock, Unlock } from "lucide-react";

export function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-indigo-500" />
                        System Overlord
                    </h1>
                    <p className="text-slate-500 mt-1 italic font-medium">Global configuration and core infrastructure management</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Master Lock Enabled</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { label: "Active Nodes", value: "3", icon: Server, color: "text-emerald-400" },
                    { label: "Total Users", value: "1,248", icon: Users, color: "text-indigo-400" },
                    { label: "Service Health", value: "99.9%", icon: Activity, color: "text-blue-400" },
                    { label: "Disk Usage", value: "42%", icon: HardDrive, color: "text-orange-400" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 group hover:bg-white/[0.05] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <History className="w-5 h-5 text-slate-400" />
                        Core Audit Trail
                    </h2>
                    <div className="space-y-4">
                        {[
                            { action: "Role Modified", target: "rizwan@villa.com", time: "2m ago", extra: "Guest -> Admin" },
                            { action: "Price Adjustment", target: "Room 404", time: "14m ago", extra: "$240 -> $265" },
                            { action: "System Reboot", target: "Node-01", time: "1h ago", extra: "Scheduled" },
                            { action: "Access Revoked", target: "test_user", time: "3h ago", extra: "Security Policy" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                                <div>
                                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{log.action}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{log.target} • {log.extra}</p>
                                </div>
                                <span className="text-[10px] font-black text-slate-600 uppercase italic">{log.time}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">View All Intelligence</button>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Security Override</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                <div>
                                    <p className="text-xs font-bold text-red-400">Lock Inventory Engine</p>
                                    <p className="text-[9px] text-red-400/60 font-medium">Prevents all checkout/booking activity</p>
                                </div>
                                <Lock className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 opacity-50">
                                <div>
                                    <p className="text-xs font-bold text-indigo-400">Purge Audit Logs</p>
                                    <p className="text-[9px] text-indigo-400/60 font-medium">Permanent deletion of security history</p>
                                </div>
                                <Unlock className="w-4 h-4 text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-tr from-slate-800 to-indigo-950 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="text-white text-lg font-bold mb-4">Infrastructure Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase mb-2">API Response</p>
                                <p className="text-xl font-black text-emerald-400 tracking-tighter">14ms</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase mb-2">DB Latency</p>
                                <p className="text-xl font-black text-emerald-400 tracking-tighter">4ms</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}
