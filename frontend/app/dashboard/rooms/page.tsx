"use client";

import { useState } from "react";
import { BookingProvider } from "@/context/BookingContext";
import { RoomAvailabilityGrid } from "@/components/bookings/RoomAvailabilityGrid";
import { CreateRoomModal } from "@/components/bookings/CreateRoomModal";
import { EditRoomModal } from "@/components/bookings/EditRoomModal";
import { Hammer, Brush, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

import { DashboardGuard } from "@/components/DashboardGuard";

export default function RoomAssetsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <DashboardGuard allowedRoles={["Admin", "HotelManager", "Receptionist"]}>
            <BookingProvider>
                <div className="space-y-8 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
                                Asset <span className="text-indigo-500">Inventory</span>
                            </h1>
                            <p className="text-slate-500 mt-2 italic font-medium">Strategic resource orchestration and maintenance lifecycle.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Admin Access Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        {[
                            { label: "Optimal State", val: "Operational", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                            { label: "Service Mode", val: "Active", icon: Brush, color: "text-blue-400", bg: "bg-blue-400/10" },
                            { label: "Critical Maint", val: "Scheduled", icon: Hammer, color: "text-orange-400", bg: "bg-orange-400/10" },
                            { label: "Health Check", val: "Passing", icon: AlertTriangle, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center gap-4 hover:bg-white/[0.04] transition-all group">
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="font-sans">
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-bold text-white tracking-tighter">{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-1 shadow-3xl overflow-hidden backdrop-blur-3xl">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic">Fleet Configuration</h2>
                                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1">Direct management of property assets</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/25 transition-all"
                                >
                                    Initialize New Asset
                                </button>
                            </div>
                            <div onContextMenu={(e) => e.preventDefault()}>
                                <RoomAvailabilityGrid
                                    key={refreshKey}
                                    onRoomSelect={(room) => setEditingRoom(room)}
                                />
                            </div>
                        </div>
                    </div>
                    <CreateRoomModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                    />
                    <EditRoomModal
                        isOpen={!!editingRoom}
                        onClose={() => setEditingRoom(null)}
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                        room={editingRoom}
                    />
                </div>
            </BookingProvider>
        </DashboardGuard>
    );
}
