"use client";

import { useEffect, useState } from "react";
import { Brain, Sparkles, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Recommendation {
    id: number;
    type: string;
    message: string;
    impact: string;
    generatedAt: string;
}

export function AiInsights({ isGuest = false }: { isGuest?: boolean }) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchInsights = async () => {
        try {
            const token = localStorage.getItem("token");
            const endpoint = isGuest ? "guest-insights" : "recommendations";
            const res = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setRecommendations(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:5000/api/ai/run-analysis", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchInsights();
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const getImpactColor = (impact: string) => {
        switch (impact.toLowerCase()) {
            case 'critical': return 'text-red-400 border-red-500/20 bg-red-500/10';
            case 'high': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
            default: return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10';
        }
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group min-h-[400px]">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">
                            {isGuest ? "Smart Stay Concierge" : "AI Revenue Engine"}
                        </h2>
                        <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
                            {isGuest ? "Personalized Experience & Upgrades" : "Predictive Yield & Optimization"}
                        </p>
                    </div>
                </div>
                {!isGuest && (
                    <button
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                    >
                        <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
                        {analyzing ? "Thinking..." : "Re-Analyze"}
                    </button>
                )}
            </div>

            <div className="space-y-4 relative z-10">
                <AnimatePresence mode="popLayout">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, i) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:scale-[1.01] ${getImpactColor(rec.impact)}`}
                            >
                                {rec.type === 'Alert' ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" /> : <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" />}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{rec.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                        <span className="text-[10px] font-bold opacity-60">{new Date(rec.generatedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold tracking-tight leading-relaxed">{rec.message}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                            <div className="p-6 rounded-full bg-white/[0.02] border border-dashed border-white/10 mb-4">
                                <TrendingUp className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No active recommendations</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">Trigger analysis to begin</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Futuristic Background Gradients */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
}
