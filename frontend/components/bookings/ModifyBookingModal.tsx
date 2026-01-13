"use client";

import { useState, useEffect } from "react";

interface ModifyBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
}

export function ModifyBookingModal({ isOpen, onClose, booking, onSuccess }: ModifyBookingModalProps) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (booking) {
            setCheckIn(new Date(booking.checkInDate).toISOString().split('T')[0]);
            setCheckOut(new Date(booking.checkOutDate).toISOString().split('T')[0]);
        }
    }, [booking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token") || "";
            const response = await fetch(`http://localhost:5000/api/booking/${booking.id}/modify`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ roomId: booking.roomId, checkInDate: checkIn, checkOutDate: checkOut }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to modify booking");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <div className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Modify Reservation</h2>
                    <p className="text-slate-500 text-xs mb-8 font-medium italic">Adjust your stay dates for Room {booking.room?.roomNumber}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Check In</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 transition-all text-sm font-bold"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Check Out</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 transition-all text-sm font-bold"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <p className="text-red-400 text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/5"
                            >
                                Dismiss
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/20"
                            >
                                {loading ? "Updating..." : "Update Stay"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Visual Flair */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full" />
            </div>
        </div>
    );
}
