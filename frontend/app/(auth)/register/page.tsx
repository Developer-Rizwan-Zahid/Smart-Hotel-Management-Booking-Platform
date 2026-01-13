"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ChevronDown, Check } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "Guest" })
    const [error, setError] = useState("")

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const roles = ["Guest", "Staff", "Admin", "HotelManager", "Receptionist"]

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleSelect = (role: string) => {
        setFormData({ ...formData, role })
        setIsDropdownOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await axios.post("http://localhost:5000/api/auth/register", formData)
            router.push("/login")
        } catch (err: any) {
            console.error(err)
            if (err.response && err.response.data) {
                // Handle logic if it's an array of errors or a single message
                const data = err.response.data;
                if (typeof data === 'string') {
                    setError(data);
                } else if (data.errors) {
                    // ASP.NET Core Validation errors structure
                    const messages = Object.values(data.errors).flat().join(", ");
                    setError(messages || "Validation failed.");
                } else if (Array.isArray(data)) {
                    setError(data.map((e: any) => e.description || e).join(", "));
                } else if (data.title) {
                    setError(data.title);
                } else {
                    setError("Registration failed. Please check your inputs.");
                }
            } else {
                setError("Registration failed. Server unreachable or unknown error.");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
        >
            <div className="flex flex-col items-center justify-center text-center space-y-8 p-8 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Text Logo */}
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-1 bg-white/50 rounded-full mb-6"></div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase drop-shadow-md">
                        Villa Serena
                    </h1>
                    <h2 className="text-lg md:text-xl font-light text-white/90 tracking-[0.3em] uppercase border-b border-white/20 pb-2 inline-block">
                        Hotel & Resorts
                    </h2>
                </div>

                <div className="w-full space-y-6">
                    <p className="text-white/80 text-sm tracking-widest uppercase font-medium">
                        Create Account
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5 w-full text-left">
                        <div className="space-y-4">
                            <Input
                                name="fullName"
                                placeholder="Full Name"
                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 focus:ring-0 text-center tracking-wide transition-all"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 focus:ring-0 text-center tracking-wide transition-all"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 focus:ring-0 text-center tracking-wide transition-all"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            {/* Custom Glass Dropdown - Dark Mod */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`h-12 w-full bg-white/5 border border-white/20 text-white flex items-center justify-center rounded-md px-3 cursor-pointer transition-all hover:bg-white/10 ${isDropdownOpen ? 'border-white/50' : ''}`}
                                >
                                    <span className="tracking-wide font-medium">{formData.role}</span>
                                    <ChevronDown className={`ml-2 h-4 w-4 text-white/60 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute z-50 mt-2 w-full rounded-md border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl overflow-hidden"
                                        >
                                            {roles.map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => handleRoleSelect(role)}
                                                    className="relative flex cursor-pointer items-center justify-center py-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white font-medium"
                                                >
                                                    {role}
                                                    {formData.role === role && (
                                                        <Check className="absolute right-4 h-4 w-4 text-emerald-400" />
                                                    )}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-200 text-xs text-center bg-red-900/60 p-2 rounded border border-red-500/30">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] shadow-lg shadow-white/10 transition-all active:scale-[0.98] border-none"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-white/50">
                            Already have an account?{" "}
                            <span
                                className="text-white font-bold cursor-pointer hover:underline uppercase tracking-wider ml-1"
                                onClick={() => router.push("/login")}
                            >
                                Sign In
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
