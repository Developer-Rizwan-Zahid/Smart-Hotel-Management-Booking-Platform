"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Shield,
    Users,
    LogOut,
    Settings,
    BarChart3,
    CalendarCheck,
    BedDouble,
    Zap,
    History,
    ChevronRight,
    ListChecks
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { useAuth } from "@/context/AuthContext"

interface NavItem {
    href: string;
    icon: any;
    label: string;
    sub: string;
    roles?: string[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: "Operations",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Control Center", sub: "Live overview" },
            { href: "/dashboard/bookings", icon: CalendarCheck, label: "Booking Engine", sub: "Manage stays", roles: ["Admin", "HotelManager", "Receptionist", "Guest"] },
            { href: "/dashboard/rooms", icon: BedDouble, label: "Room Assets", sub: "Inventory sync", roles: ["Admin", "HotelManager", "Receptionist"] },
            { href: "/dashboard/staff", icon: ListChecks, label: "Staff Operations", sub: "Manage team", roles: ["Admin", "HotelManager", "Staff", "Receptionist"] },
        ]
    },
    {
        title: "Revenue",
        items: [
            { href: "/dashboard/admin/pricing", icon: Zap, label: "Pricing Engine", sub: "Yield management", roles: ["Admin", "HotelManager"] },
            { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", sub: "Growth metrics", roles: ["Admin", "HotelManager"] },
        ]
    },
    {
        title: "System",
        items: [
            { href: "/dashboard/audit", icon: Shield, label: "Audit Logs", sub: "Security trails", roles: ["Admin"] },
            { href: "/dashboard/sessions", icon: History, label: "Active Sessions", sub: "User traffic", roles: ["Admin", "HotelManager"] },
            { href: "/dashboard/settings", icon: Settings, label: "Config", sub: "System params", roles: ["Admin", "HotelManager"] },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const userRole = (user?.role || "Guest").toLowerCase()

    const filteredSections = navSections
        .map(section => ({
            ...section,
            items: section.items.filter(item => !item.roles || item.roles.some(r => r.toLowerCase() === userRole))
        }))
        .filter(section => section.items.length > 0)

    return (
        <div className="flex h-full w-72 flex-col border-r border-white/10 bg-black/70 backdrop-blur-2xl text-white shadow-[0_24px_90px_rgba(15,23,42,1)] relative z-20">
            {/* Logo Section */}
            <div className="flex h-24 items-center px-7 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.6)_0,transparent_55%),radial-gradient(circle_at_100%_100%,rgba(45,212,191,0.5)_0,transparent_55%)]" />
                <div className="relative flex items-center gap-3 font-black text-xl tracking-[0.2em] uppercase">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.7)] ring-1 ring-white/30">
                            <Zap className="w-5 h-5 text-black" />
                        </div>
                        <div className="absolute -inset-1 rounded-2xl bg-emerald-400/40 blur-xl" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] tracking-[0.26em] text-slate-200">Smart Hotel</span>
                        <span className="text-[9px] text-indigo-300/90 tracking-[0.3em] mt-0.5">Serena Console</span>
                    </div>
                </div>
            </div>

            {/* User Profile Hook */}
            <div className="px-5 mb-6">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3 shadow-[0_14px_40px_rgba(15,23,42,0.8)]">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/50 to-sky-500/50 flex items-center justify-center text-white font-bold">
                        {user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold truncate text-white">{user?.email || "User"}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mt-0.5">
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
                {filteredSections.map((section, idx) => (
                    <div key={idx} className="mb-8 last:mb-0">
                        <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.28em] text-slate-500 mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 rounded-full bg-slate-700" />
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group relative flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all duration-300 overflow-hidden",
                                            isActive
                                                ? "bg-white/[0.04] border border-white/15 shadow-[0_18px_60px_rgba(15,23,42,0.9)]"
                                                : "hover:bg-white/[0.02] border border-transparent"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-400/10 via-sky-400/5 to-transparent" />
                                        )}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "p-2 rounded-xl transition-all duration-300",
                                                    isActive
                                                        ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                                                        : "bg-white/[0.04] text-slate-400 group-hover:text-white group-hover:bg-white/[0.14]"
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span
                                                    className={cn(
                                                        "text-sm font-semibold transition-all tracking-tight",
                                                        isActive ? "text-white" : "text-slate-300 group-hover:text-slate-100"
                                                    )}
                                                >
                                                    {item.label}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-medium tracking-[0.18em] uppercase">
                                                    {item.sub}
                                                </span>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                                            />
                                        )}
                                        {!isActive && <ChevronRight className="w-3 h-3 text-slate-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Section */}
            <div className="p-6 border-t border-white/10 bg-black/60">
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/[0.02] border border-white/10 py-4 px-5 text-sm font-semibold text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 group"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </div>
                </button>
            </div>
        </div>
    )
}
