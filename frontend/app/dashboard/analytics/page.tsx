"use client";

import { DashboardGuard } from "@/components/DashboardGuard";
import { AnalyticsDashboard } from "@/components/dashboards/AnalyticsDashboard";
import { BookingProvider } from "@/context/BookingContext";

export default function AnalyticsPage() {
    return (
        <DashboardGuard allowedRoles={["Admin", "HotelManager"]}>
            <BookingProvider>
                <div className="p-2">
                    <AnalyticsDashboard />
                </div>
            </BookingProvider>
        </DashboardGuard>
    );
}
