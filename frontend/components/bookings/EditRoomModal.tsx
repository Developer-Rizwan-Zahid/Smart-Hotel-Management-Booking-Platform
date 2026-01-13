"use client";

import { useState, useEffect } from "react";
import { Edit3, X, Trash2 } from "lucide-react";

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    room: any;
}

export function EditRoomModal({ isOpen, onClose, onSuccess, room }: EditRoomModalProps) {
    const [roomNumber, setRoomNumber] = useState("");
    const [type, setType] = useState("Single");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (room) {
            setRoomNumber(room.roomNumber);
            setType(room.type);
            setPrice(room.pricePerNight.toString());
            setStatus(room.status);
        }
    }, [room]);

    if (!isOpen || !room) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/room/${room.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: room.id,
                    roomNumber,
                    type,
                    pricePerNight: parseFloat(price),
                    status: status,
                    isActive: true
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError("Update failed. Priority credentials required.");
            }
        } catch (err) {
            setError("Network error. Synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will archive the asset.")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/room/${room.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError("Deletion protocol failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#0f0f10] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-3xl overflow-hidden">
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-xl">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Modify Asset</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asset Ref</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rate ($)</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Configuration</label>
                            <select
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none appearance-none"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="Single">Standard Suite</option>
                                <option value="Double">Executive Suite</option>
                                <option value="Suite">Presidential Suite</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Operational Status</label>
                            <div className="flex gap-2">
                                {[0, 2, 3].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${status === s
                                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                                            : "bg-white/5 border-white/5 text-slate-600 hover:border-white/10"
                                            }`}
                                    >
                                        {s === 0 ? "Ready" : s === 2 ? "Cleaning" : "Repair"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-tight">{error}</p>}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/25 transition-all"
                        >
                            {loading ? "Synching..." : "Commit Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
