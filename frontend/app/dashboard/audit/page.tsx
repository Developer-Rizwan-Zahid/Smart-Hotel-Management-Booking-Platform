"use client";

import { DashboardGuard } from "@/components/DashboardGuard";
import { Shield, Search, Filter, Download } from "lucide-react";

export default function AuditLogsPage() {
    return (
        <DashboardGuard allowedRoles={["Admin"]}>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                            <Shield className="w-8 h-8 text-indigo-500" />
                            Security Audit Trail
                        </h1>
                        <p className="text-slate-500 mt-1 italic font-medium">Immutable records of system activity and user modifications</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white/5 border border-white/10 text-white p-3 rounded-xl hover:bg-white/10 transition-all">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input placeholder="Search logs..." className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all w-64" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-xs font-bold text-slate-400">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Timestamp</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Actor</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Action</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Entity</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { time: "2026-01-12 11:42", user: "rizwan@villa.com", action: "UPDATE_STATUS", entity: "Room 101", details: "Available -> Cleaning" },
                                    { time: "2026-01-12 11:30", user: "system_ai", action: "PRICE_CHANGE", entity: "Suite-A", details: "Dynamic Surge +15%" },
                                    { time: "2026-01-12 10:15", user: "admin@villa.com", action: "ROLE_MOD", entity: "User_42", details: "Guest -> Receptionist" },
                                    { time: "2026-01-12 09:00", user: "recept_lara", action: "CHECK_IN", entity: "Booking_882", details: "Guest: Mr. Wick" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="p-6 text-[10px] font-bold text-slate-400">{row.time}</td>
                                        <td className="p-6 text-sm font-bold text-white">{row.user}</td>
                                        <td className="p-6">
                                            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase">{row.action}</span>
                                        </td>
                                        <td className="p-6 text-xs text-slate-300">{row.entity}</td>
                                        <td className="p-6 text-xs italic text-slate-500">{row.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardGuard>
    );
}
