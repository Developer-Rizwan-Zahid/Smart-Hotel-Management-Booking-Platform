"use client";

import { BookingProvider } from "@/context/BookingContext";
import { RoomAvailabilityGrid } from "@/components/bookings/RoomAvailabilityGrid";
import { MyBookingsList } from "@/components/bookings/MyBookingsList";
import { OccupancyStats } from "@/components/bookings/OccupancyStats";

import { DashboardGuard } from "@/components/DashboardGuard";

export default function BookingsPage() {
    return (
        <DashboardGuard allowedRoles={["Admin", "HotelManager", "Receptionist", "Guest"]}>
            <BookingProvider>
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-2">Real-Time Bookings</h1>
                    <p className="text-gray-500 mb-8">
                        Live room availability and booking status synchronized via SignalR.
                    </p>

                    <OccupancyStats />

                    <h2 className="text-xl font-bold mb-4">Availability Grid</h2>
                    <RoomAvailabilityGrid />

                    <MyBookingsList />
                </div>
            </BookingProvider>
        </DashboardGuard>
    );
}
