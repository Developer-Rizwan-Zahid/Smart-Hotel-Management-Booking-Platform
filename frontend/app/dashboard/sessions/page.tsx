"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Users, Loader2, Laptop, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Session {
    id: number
    userId: string
    createdAt: string
    expiresAt: string
    isRevoked: boolean
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios.get("http://localhost:5000/api/auth/sessions", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSessions(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const handleRevoke = async (id: number) => {
        try {
            const token = localStorage.getItem("token")
            await axios.post(`http://localhost:5000/api/auth/revoke-session/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchSessions() // Refresh list
        } catch (err) {
            console.error("Failed to revoke", err)
        }
    }

    if (loading) return <div className="flex h-96 items-center justify-center text-indigo-400"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-indigo-400" />
                <h1 className="text-3xl font-bold tracking-tight text-white">Active Sessions</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                    <div key={session.id} className="relative rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl glass hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                                    <Laptop className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Session #{session.id}</h3>
                                    <p className="text-xs text-slate-400">Created {new Date(session.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRevoke(session.id)}
                            >
                                Revoke
                            </Button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span>Expires: {new Date(session.expiresAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => handleRevoke(session.id)}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <LogOut className="h-3 w-3" /> Revoke Access
                            </button>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 border border-white/5 rounded-xl border-dashed">
                        No active sessions found.
                    </div>
                )}
            </div>
        </div>
    )
}
