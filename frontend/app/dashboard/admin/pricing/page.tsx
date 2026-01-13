"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Zap, Calendar, TrendingUp, Tag } from "lucide-react";

interface PricingRule {
    id: number;
    name: string;
    ruleType: number;
    adjustmentType: number;
    adjustmentValue: number;
    startDate: string | null;
    endDate: string | null;
    applyToDays: string | null;
    occupancyThreshold: number | null;
    isActive: boolean;
}

import { DashboardGuard } from "@/components/DashboardGuard";

export default function PricingManager() {
    // ... (rest of the component logic)
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRules = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/pricing/rules", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setRules(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const getRuleTypeLabel = (type: number) => {
        switch (type) {
            case 0: return { label: "Seasonal", icon: Calendar, color: "text-purple-400 bg-purple-400/10" };
            case 1: return { label: "Day of Week", icon: Zap, color: "text-yellow-400 bg-yellow-400/10" };
            case 2: return { label: "Demand Based", icon: TrendingUp, color: "text-blue-400 bg-blue-400/10" };
            default: return { label: "Special", icon: Tag, color: "text-slate-400 bg-slate-400/10" };
        }
    };

    if (loading) return <div>Loading rules...</div>;

    return (
        <DashboardGuard allowedRoles={["Admin", "HotelManager"]}>
            <div className="space-y-8 p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">Pricing Engine</h1>
                        <p className="text-slate-500 mt-1">Configure dynamic yield management strategies</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25">
                        <Plus className="w-5 h-5" />
                        Create Rule
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rules.map((rule) => {
                        const config = getRuleTypeLabel(rule.ruleType);
                        return (
                            <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl ${config.color}`}>
                                        <config.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black ${rule.adjustmentValue > 0 ? "text-green-400" : "text-red-400"}`}>
                                            {rule.adjustmentType === 0 ? `${(rule.adjustmentValue * 100).toFixed(0)}%` : `$${rule.adjustmentValue}`}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Adjustment</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">{rule.name}</h3>

                                <div className="space-y-2 mb-6">
                                    <p className="text-xs text-slate-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                        Type: <span className="text-slate-200">{config.label}</span>
                                    </p>
                                    {rule.startDate && (
                                        <p className="text-xs text-slate-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            Range: <span className="text-slate-200">{new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate!).toLocaleDateString()}</span>
                                        </p>
                                    )}
                                    {rule.applyToDays && (
                                        <p className="text-xs text-slate-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            Days: <span className="text-slate-200">{rule.applyToDays}</span>
                                        </p>
                                    )}
                                    {rule.occupancyThreshold && (
                                        <p className="text-xs text-slate-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            Threshold: <span className="text-slate-200">Occupancy &gt; {(rule.occupancyThreshold * 100).toFixed(0)}%</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${rule.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                                        <span className="text-[10px] uppercase font-bold text-slate-450">{rule.isActive ? "Active" : "Paused"}</span>
                                    </div>
                                    <button className="text-red-400/50 hover:text-red-400 transition-colors p-2">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardGuard>
    );
}
