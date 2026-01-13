"use client";

import { useEffect, useState } from "react";
import { useBookingSignalR } from "@/context/BookingContext";
import { Activity, Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardStats() {
    const [stats, setStats] = useState({
        activeGuests: 0,
        bookingsToday: 0,
        revenue: 0,
        occupancyRate: 0,
    });
    const { lastUpdate } = useBookingSignalR();

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const [roomRes, bookingRes] = await Promise.all([
                fetch("http://localhost:5000/api/room", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://localhost:5000/api/booking", { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (roomRes.ok && bookingRes.ok) {
                const rooms = await roomRes.json();
                const bookings = await bookingRes.json();

                const totalRooms = rooms.length;
                const occupiedRooms = rooms.filter((r: any) => r.status === 1 || !r.isAvailable).length;
                const rate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

                const today = new Date().toISOString().split('T')[0];
                const todayBookings = bookings.filter((b: any) => b.createdAt.startsWith(today)).length;
                const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.status !== 4 ? b.totalPrice : 0), 0);
                const activeGuests = bookings.filter((b: any) => b.status === 2).length;

                setStats({ activeGuests, bookingsToday: todayBookings, revenue: totalRevenue, occupancyRate: rate });
            }
        } catch (error) {
            console.error("Dashboard stats fetch failed", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [lastUpdate]);

    const cards = [
        { label: "Active Guests", value: stats.activeGuests, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Bookings Today", value: stats.bookingsToday, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
        { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group transition-all"
                >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                            <card.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-full uppercase tracking-tighter">+12.5%</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.label}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white tracking-tighter">{card.value}</span>
                        </div>
                    </div>
                    {/* Decorative Background Blob */}
                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${card.bg.replace('/10', '')}`} />
                </motion.div>
            ))}
        </div>
    );
}
