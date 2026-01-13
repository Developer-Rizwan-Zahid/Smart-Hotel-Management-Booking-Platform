"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", formData)
            const { accessToken, refreshToken } = response.data
            login(accessToken, refreshToken)
        } catch (err: any) {
            console.error(err)
            setError("Invalid email or password.")
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
                        Welcome Back
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5 w-full">
                        <div className="space-y-4">
                            <Input
                                name="email"
                                type="email"
                                placeholder="Username"
                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 focus:ring-0 text-center tracking-wide transition-all"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <div className="space-y-1">
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 focus:ring-0 text-center tracking-wide transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex justify-end">
                                    <a href="#" className="text-[10px] text-white/60 hover:text-white uppercase tracking-wider mt-1 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
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
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-white/50">
                            Don't have an account?{" "}
                            <span
                                className="text-white font-bold cursor-pointer hover:underline uppercase tracking-wider ml-1"
                                onClick={() => router.push("/register")}
                            >
                                Register
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
