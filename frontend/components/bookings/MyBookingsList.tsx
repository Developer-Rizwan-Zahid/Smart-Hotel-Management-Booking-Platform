"use client";

import { useEffect, useState } from "react";
import { Booking, bookingService } from "@/lib/bookingService";
import { useBookingSignalR } from "@/context/BookingContext";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CreditCard, Clock, MapPin, XCircle, CheckCircle, Download, Edit3, ChevronRight, AlertTriangle } from "lucide-react";
import { ModifyBookingModal } from "./ModifyBookingModal";

export function MyBookingsList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const { lastUpdate } = useBookingSignalR();

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token") || "";
            const data = await bookingService.getUserBookings(token);
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [lastUpdate]);

    const handleAction = async (id: number, action: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`http://localhost:5000/api/booking/${id}/${action}`, {
                method: action === "cancel" || action === "modify" ? "POST" : "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || `Failed to ${action}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const downloadInvoice = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/booking/${id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Invoice-${data.InvoiceId}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
                {bookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]"
                    >
                        <MapPin className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No active reservations found.</p>
                        <button className="mt-4 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors">Book Now</button>
                    </motion.div>
                ) : (
                    bookings.map((booking, idx) => {
                        const isLocked = (new Date(booking.checkInDate).getTime() - new Date().getTime()) < (24 * 60 * 60 * 1000);
                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/20 transition-all duration-500 overflow-hidden shadow-2xl"
                            >
                                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                    {/* Room Identity */}
                                    <div className="flex-shrink-0 w-full md:w-48 h-32 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1">Room</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">{booking.room?.roomNumber}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{booking.room?.type}</p>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.status === 4 ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                    booking.status === 2 ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                        booking.status === 3 ? "bg-slate-500/10 text-slate-500 border border-slate-500/20" :
                                                            "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    }`}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                    <Clock className="w-3 h-3" />
                                                    Ordered on {new Date(booking.checkInDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Total Paid</p>
                                                <p className="text-2xl font-black text-white tracking-tighter mt-1">${booking.totalPrice}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Check-In</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-sm font-bold text-white uppercase">{new Date(booking.checkInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Check-Out</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm font-bold text-white uppercase">{new Date(booking.checkOutDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="flex flex-col gap-2 justify-center">
                                        <button
                                            onClick={() => downloadInvoice(booking.id)}
                                            className="p-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl transition-all group/btn flex items-center justify-between gap-4"
                                        >
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Receipt</span>
                                            <Download className="w-4 h-4 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-y-0.5 transition-all" />
                                        </button>

                                        {booking.status === 1 && (
                                            <>
                                                <button
                                                    disabled={isLocked || actionLoading === booking.id}
                                                    className={`p-4 border rounded-2xl transition-all flex items-center justify-between gap-4 ${isLocked ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/5' : 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-400'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Modify</span>
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(booking.id, "cancel")}
                                                    disabled={isLocked || actionLoading === booking.id}
                                                    className={`p-4 border rounded-2xl transition-all flex items-center justify-between gap-4 ${isLocked ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/5' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {isLocked && booking.status === 1 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                <span className="text-[8px] font-black uppercase text-amber-500 tracking-tighter">Locked (24h Window)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Background Glare */}
                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                            </motion.div>
                        );
                    })
                )}
            </AnimatePresence>
        </div>
    );
}

function getStatusText(status: number) {
    switch (status) {
        case 0: return "Pending";
        case 1: return "Confirmed";
        case 2: return "Stay Active";
        case 3: return "Completed";
        case 4: return "Cancelled";
        default: return "Unknown";
    }
}
