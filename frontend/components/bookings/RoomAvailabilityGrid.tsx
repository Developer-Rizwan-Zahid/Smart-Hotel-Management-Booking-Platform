"use client";

import { useState, useEffect } from "react";
import { useBookingSignalR } from "@/context/BookingContext";
import { BookingModal } from "./BookingModal";
import { Hammer } from "lucide-react";

interface Room {
    id: number;
    roomNumber: string;
    type: string;
    pricePerNight: number;
    isActive: boolean;
    isAvailable?: boolean;
    status: number; 
}

interface RoomAvailabilityGridProps {
    onRoomSelect?: (room: Room) => void;
}

export function RoomAvailabilityGrid({ onRoomSelect }: RoomAvailabilityGridProps) {
    const { connection } = useBookingSignalR();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/room", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data);
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    // Real-time Updates
    useEffect(() => {
        if (!connection) return;

        const handleRoomUpdate = (update: { roomId: number, isAvailable: boolean, status?: number }) => {
            setRooms(prev => prev.map(r =>
                r.id === update.roomId ? { ...r, isAvailable: update.isAvailable, status: update.status !== undefined ? update.status : r.status } : r
            ));
        };

        connection.on("RoomUpdated", handleRoomUpdate);

        return () => {
            connection.off("RoomUpdated", handleRoomUpdate);
        };
    }, [connection]);

    const handleBookClick = (room: Room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-slate-400 text-sm italic">Loading rooms...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-1 md:p-4">
            {rooms.map((room) => (
                <div
                    key={room.id}
                    className={`relative p-6 rounded-3xl border transition-all bg-black/50 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.9)] ${
                        room.isAvailable
                            ? "border-emerald-400/30 hover:border-emerald-300/70"
                            : "border-slate-700/80 opacity-80"
                    }`}
                >
                    {onRoomSelect && (
                        <button
                            onClick={() => onRoomSelect(room)}
                            className="absolute top-2 right-2 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
                        >
                            <Hammer className="w-3 h-3 text-gray-400" />
                        </button>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Room {room.roomNumber}</h3>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {room.type}
                            </p>
                        </div>
                        <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] ${
                                room.isAvailable
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                                    : "bg-rose-500/10 text-rose-300 border border-rose-400/40"
                            }`}
                        >
                            {room.isAvailable ? "Available" : "Occupied"}
                        </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold text-white">
                            ${room.pricePerNight}
                            <span className="text-xs font-semibold text-slate-400 ml-1">/night</span>
                        </span>
                        <button
                            disabled={!room.isAvailable}
                            onClick={() => handleBookClick(room)}
                            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-[0.22em] ${
                                room.isAvailable
                                    ? "bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 text-black shadow-[0_18px_60px_rgba(6,182,212,0.7)] hover:brightness-110"
                                    : "bg-slate-700/80 text-slate-400 cursor-not-allowed"
                            } transition-all`}
                        >
                            {room.isAvailable ? "Book Now" : "Unavailable"}
                        </button>
                    </div>
                </div>
            ))}

            {selectedRoom && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    room={selectedRoom}
                />
            )}
        </div>
    );
}
