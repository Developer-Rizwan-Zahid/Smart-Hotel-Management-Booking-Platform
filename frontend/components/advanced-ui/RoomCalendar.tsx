"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingSignalR } from "@/context/BookingContext";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Hammer, Brush, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";

interface Room {
    id: number;
    roomNumber: string;
    type: string;
    pricePerNight: number;
    status: number;
}

interface Booking {
    id: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    status: number;
}

function DraggableBooking({ booking, room }: { booking: Booking; room: Room }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `booking-${booking.id}`,
        data: { booking, room }
    });

    const dragStyle = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    const duration = differenceInDays(new Date(booking.checkOutDate), new Date(booking.checkInDate));
    const widthPercent = (duration + 1) * 100;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`absolute inset-y-1 left-1 rounded-lg bg-gradient-to-br border shadow-xl flex items-center px-3 cursor-grab active:cursor-grabbing z-10 transition-shadow hover:shadow-indigo-500/20 ${isDragging ? "opacity-50 !cursor-grabbing scale-105" : "opacity-100"
                } ${booking.status === 1 ? "from-indigo-500/30 to-purple-600/20 border-indigo-400/30" :
                    booking.status === 2 ? "from-blue-500/30 to-cyan-500/20 border-blue-400/30" :
                        "from-green-500/30 to-emerald-500/20 border-green-400/30"
                }`}
            style={{
                ...dragStyle,
                width: `calc(${widthPercent}% - 8px)`,
            }}
        >
            <GripVertical className="w-3 h-3 text-white/50 mr-2 flex-shrink-0" />
            <span className="text-[10px] font-bold text-white uppercase truncate">Guest #{booking.id}</span>
        </div>
    );
}

function DroppableCell({ roomId, day, children }: { roomId: number; day: Date; children?: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${roomId}-${day.toISOString()}`,
        data: { roomId, day }
    });

    return (
        <div
            ref={setNodeRef}
            className={`relative h-12 flex items-center justify-center border border-white/[0.02] rounded-lg transition-colors ${isOver ? "bg-indigo-500/10" : "bg-white/[0.02]"
                }`}
        >
            {children}
        </div>
    );
}

export function RoomCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { lastUpdate } = useBookingSignalR();

    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const [roomRes, bookingRes] = await Promise.all([
                fetch("http://localhost:5000/api/room", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://localhost:5000/api/booking", { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (roomRes.ok && bookingRes.ok) {
                setRooms(await roomRes.json());
                setBookings(await bookingRes.json());
            }
        } catch (error) {
            console.error("Calendar fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate, lastUpdate]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const booking = active.data.current?.booking as Booking;
        const newRoomId = over.data.current?.roomId as number;
        const newStartDate = over.data.current?.day as Date;

        if (!booking || !newRoomId || !newStartDate) return;

        // Optimistic UI Update
        const originalBookings = [...bookings];
        const duration = differenceInDays(new Date(booking.checkOutDate), new Date(booking.checkInDate));

        setBookings(prev => prev.map(b =>
            b.id === booking.id ? {
                ...b,
                roomId: newRoomId,
                checkInDate: newStartDate.toISOString(),
                checkOutDate: addDays(newStartDate, duration).toISOString()
            } : b
        ));

        // API Call
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/booking/${booking.id}/move`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    roomId: newRoomId,
                    checkInDate: newStartDate,
                    checkOutDate: addDays(newStartDate, duration)
                })
            });

            if (!res.ok) throw new Error("Move failed");

        } catch (error) {
            console.error("Rollback!");
            setBookings(originalBookings); 
            alert("Failed to move booking: Overlap detected or server error.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 text-white min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Live Timeline
                        </h2>
                        <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                            {['Day', 'Week', 'Month'].map(v => (
                                <button key={v} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${v === 'Week' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                            <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-1.5 rounded-md hover:bg-white/10">
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-300 min-w-[150px] text-center">
                                 {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
                            </span>
                            <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1.5 rounded-md hover:bg-white/10">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                        {/* Calendar Headers */}
                        <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 mb-4">
                            <div className="text-xs font-bold text-slate-500 uppercase flex items-center pl-4">Resource</div>
                            {days.map(day => (
                                <div key={day.toString()} className="text-center group">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(day, "EEE")}</div>
                                    <div className={`mt-1 text-sm font-black transition-all ${isSameDay(day, new Date()) ? "text-indigo-400" : "text-white"}`}>
                                        {format(day, "d")}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {rooms.map(room => (
                                <div key={room.id} className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 group">
                                    <div className="flex flex-col justify-center pl-4 bg-white/5 border border-white/10 rounded-xl h-14 group-hover:bg-white/10 transition-colors">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                            {room.roomNumber}
                                            <span className={`w-1.5 h-1.5 rounded-full ${room.status === 0 ? "bg-green-500" :
                                                    room.status === 2 ? "bg-blue-500 animate-pulse" :
                                                        "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                }`} />
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{room.type}</span>
                                    </div>

                                    {days.map(day => {
                                        const booking = bookings.find(b =>
                                            b.roomId === room.id &&
                                            isSameDay(new Date(b.checkInDate), day) &&
                                            b.status !== 4
                                        );

                                        return (
                                            <DroppableCell key={day.toString()} roomId={room.id} day={day}>
                                                {booking && <DraggableBooking booking={booking} room={room} />}
                                            </DroppableCell>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
