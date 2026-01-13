"use client";

import { useAuth } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { DashboardGuard } from "@/components/DashboardGuard";
import { GuestDashboard } from "@/components/dashboards/GuestDashboard";
import { ReceptionistDashboard } from "@/components/dashboards/ReceptionistDashboard";
import { ManagerDashboard } from "@/components/dashboards/ManagerDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { StaffDashboardView } from "@/components/dashboards/StaffDashboard";
import { AnalyticsDashboard } from "@/components/dashboards/AnalyticsDashboard";

export default function DashboardPage() {
    const { user } = useAuth();
    const role = user?.role || "Guest";

    const renderDashboard = () => {
        const normalizedRole = role.toLowerCase();
        switch (normalizedRole) {
            case "admin":
                return <AdminDashboard />;
            case "hotelmanager":
                return <ManagerDashboard />;
            case "receptionist":
                return <ReceptionistDashboard />;
            case "staff":
                return <StaffDashboardView />;
            case "guest":
            default:
                return <GuestDashboard />;
        }
    };

    return (
        <DashboardGuard>
            <BookingProvider>
                {renderDashboard()}
            </BookingProvider>
        </DashboardGuard>
    );
}
