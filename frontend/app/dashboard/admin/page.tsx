"use client";

import { DashboardGuard } from "@/components/DashboardGuard";
import { UserManagement } from "@/components/admin/UserManagement";
import { BookingProvider } from "@/context/BookingContext";
import { ShieldAlert, Globe, Server } from "lucide-react";

export default function AdminControlPage() {
    return (
        <DashboardGuard allowedRoles={["Admin"]}>
            <BookingProvider>
                <div className="space-y-12 pb-20 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none">
                                Command <span className="text-indigo-500">Center</span>
                            </h1>
                            <p className="text-slate-500 mt-4 italic font-medium max-w-xl">
                                System-level authority and identity orchestration for the Smart Hotel ecosystem.
                            </p>
                        </div>
                        <div className="hidden md:flex gap-6">
                            {[
                                { label: "System Uptime", val: "99.9%", icon: Server },
                                { label: "Nodes Active", val: "12/12", icon: Globe },
                                { label: "Attack Surface", val: "Minimal", icon: ShieldAlert },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                        <s.icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{s.label}</p>
                                        <p className="text-xl font-bold text-white tracking-tighter">{s.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-1 shadow-3xl overflow-hidden backdrop-blur-3xl">
                        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent p-12">
                            <UserManagement />
                        </div>
                    </div>
                </div>
            </BookingProvider>
        </DashboardGuard>
    );
}
