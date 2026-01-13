"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/lib/bookingService";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: any;
}

export function BookingModal({ isOpen, onClose, room }: BookingModalProps) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [estimate, setEstimate] = useState<{ total: number; breakdown: any[] } | null>(null);
    const [estimating, setEstimating] = useState(false);

    useEffect(() => {
        if (checkIn && checkOut) {
            fetchEstimate();
        } else {
            setEstimate(null); // Clear estimate if dates are not fully selected
        }
    }, [checkIn, checkOut, room.id]);

    const fetchEstimate = async () => {
        setEstimating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/pricing/estimate?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setEstimate(await res.json());
            } else {
                setEstimate(null);
                const errorData = await res.json();
                setError(errorData.message || "Failed to fetch estimate.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch estimate due to network error.");
        } finally {
            setEstimating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token") || "";
            await bookingService.createBooking(room.id, checkIn, checkOut, token);
            alert(`Booking Successfully Confirmed! Room ${room.roomNumber} reserved.`);
            onClose();
        } catch (err: any) {
            console.error("Booking failed:", err);
            setError(err.message || "Failed to create booking. Room might be unavailable.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Book Room {room.roomNumber}</h2>
                <p className="text-slate-400 text-sm mb-6">{room.type} Suite • ${room.pricePerNight} Base Rate</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Check In</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 transition-colors"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Check Out</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 transition-colors"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    {estimate && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Price Breakdown</h3>
                            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {estimate.breakdown.map((day: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-slate-300 font-medium">{new Date(day.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-500 italic">
                                                {day.appliedRules.length > 0 ? day.appliedRules.join(", ") : "Standard Rate"}
                                            </span>
                                        </div>
                                        <span className="text-white font-bold">${day.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                <span className="text-sm font-bold text-white">Estimated Total</span>
                                <span className="text-xl font-black text-indigo-400">
                                    {estimating ? "..." : `$${estimate.total}`}
                                </span>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || estimating || !estimate}
                            className="flex-3 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            {loading ? "Confirming..." : "Confirm Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
