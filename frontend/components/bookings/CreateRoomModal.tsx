"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
    const [roomNumber, setRoomNumber] = useState("");
    const [type, setType] = useState("Single");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    roomNumber,
                    type,
                    pricePerNight: parseFloat(price),
                    isActive: true,
                    status: 0
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError("Failed to create room. Please check input.");
            }
        } catch (err) {
            setError("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#111112] border border-white/10 w-full max-w-lg rounded-3xl shadow-3xl overflow-hidden">
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-xl">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Add New Asset</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Room Reference</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. 404"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 transition-all outline-none"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pricing Plan ($)</label>
                            <input
                                required
                                type="number"
                                placeholder="Rate per night"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 transition-all outline-none"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Configuration Type</label>
                        <select
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 transition-all outline-none appearance-none"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Single">Standard Suite (Single)</option>
                            <option value="Double">Executive Suite (Double)</option>
                            <option value="Suite">Presidential Suite (Luxury)</option>
                        </select>
                    </div>

                    {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-white/5 transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Initializing..." : "Provision Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
