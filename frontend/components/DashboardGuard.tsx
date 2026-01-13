"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function DashboardGuard({ children, allowedRoles }: DashboardGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }

        if (!loading && user && allowedRoles) {
            const userLowerRole = user.role.toLowerCase();
            const isAllowed = allowedRoles.some(r => r.toLowerCase() === userLowerRole);
            if (!isAllowed) {
                router.push("/dashboard");
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0b]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
