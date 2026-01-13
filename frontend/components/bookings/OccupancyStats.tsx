"use client";

import { useEffect, useState } from "react";
import { useBookingSignalR } from "@/context/BookingContext";

export function OccupancyStats() {
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
    const { lastUpdate } = useBookingSignalR();

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/room", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const rooms = await res.json();
                const total = rooms.length;
                const occupied = rooms.filter((r: any) => !r.isAvailable).length;
                setStats({ total, occupied, available: total - occupied });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [lastUpdate]);

    return (
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Total Rooms</p>
                <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <p className="text-blue-500 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold text-blue-600">{stats.available}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                <p className="text-orange-500 text-sm font-medium">Occupied</p>
                <p className="text-3xl font-bold text-orange-600">{stats.occupied}</p>
            </div>
        </div>
    );
}
