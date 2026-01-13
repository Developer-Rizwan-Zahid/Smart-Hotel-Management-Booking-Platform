"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, User, ClipboardList, Hammer, Brush, Search } from "lucide-react";

import { useBookingSignalR } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";

interface StaffTask {
    id: number;
    roomId: number;
    room?: { roomNumber: string, type: string };
    type: number; // 0: Cleaning, 1: Maintenance, 2: Inspection
    status: number; // 0: Pending, 1: InProgress, 2: Completed
    assignedTo?: string;
    createdAt: string;
    notes?: string;
}

interface StaffAssignee {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

export function StaffTaskBoard() {
    const { connection } = useBookingSignalR();
    const { user } = useAuth();
    const [tasks, setTasks] = useState<StaffTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignees, setAssignees] = useState<StaffAssignee[]>([]);

    const userRole = (user?.role || "").toLowerCase();
    const canAssignOthers = ["admin", "hotelmanager", "receptionist"].includes(userRole);

    // DEBUG LOGS
    console.log("DEBUG: StaffTaskBoard", { userRole, canAssignOthers, user });

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/staff/tasks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setTasks(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const fetchAssignees = async () => {
            if (!canAssignOthers) {
                console.log("DEBUG: canAssignOthers is false, skipping fetch");
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    console.error("DEBUG: Failed to fetch users", res.status);
                    return;
                }

                const data = await res.json();
                console.log("DEBUG: All Users Fetched", data);

                const filtered = (data as any[])
                    .map((u) => ({
                        id: u.id as string,
                        email: (u.email as string) ?? "",
                        fullName: (u.fullName as string) ?? "",
                        roles: (u.roles as string[]) ?? [],
                    }))
                    .filter(
                        (u) =>
                            u.email &&
                            u.roles?.some((r) =>
                                ["staff", "receptionist", "hotelmanager"].includes(r.toLowerCase())
                            )
                    );

                console.log("DEBUG: Filtered Assignees", filtered);
                setAssignees(filtered);
            } catch (err) {
                console.error("Failed to load assignees", err);
            }
        };

        fetchAssignees();
    }, [canAssignOthers]);

    useEffect(() => {
        if (!connection) return;

        connection.on("TaskCreated", (task: StaffTask) => {
            setTasks(prev => [task, ...prev]);
        });

        connection.on("TaskUpdated", (updatedTask: StaffTask) => {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        });

        return () => {
            connection.off("TaskCreated");
            connection.off("TaskUpdated");
        };
    }, [connection]);

    const updateStatus = async (taskId: number, status: number, assignedTo?: string) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:5000/api/staff/tasks/${taskId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, assignedTo })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const assignToMe = async (task: StaffTask) => {
        if (!user?.email) return;
        const nextStatus = task.status === 0 ? 1 : task.status;
        await updateStatus(task.id, nextStatus, user.email);
    };

    const assignToOther = async (task: StaffTask, email: string) => {
        if (!email) return;
        const nextStatus = task.status === 0 ? 1 : task.status;
        await updateStatus(task.id, nextStatus, email);
    };

    const getTypeIcon = (type: number) => {
        switch (type) {
            case 1: return <Hammer className="w-4 h-4 text-orange-400" />;
            case 2: return <Search className="w-4 h-4 text-blue-400" />;
            default: return <Brush className="w-4 h-4 text-emerald-400" />;
        }
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 1: return { label: "In Progress", color: "text-blue-400", bg: "bg-blue-400/10", icon: <Clock className="w-4 h-4" /> };
            case 2: return { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle2 className="w-4 h-4" /> };
            default: return { label: "Pending", color: "text-slate-400", bg: "bg-slate-400/10", icon: <Circle className="w-4 h-4" /> };
        }
    };

    const createDemoTask = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/staff/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ roomId: 1, type: 0, notes: "Routine check generated by Admin" })
            });
            if (res.ok) {
                fetchTasks();
            } else {
                alert("Failed to create task. Ensure Room ID 1 exists.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-slate-500 italic animate-pulse">Synchronizing task board...</div>;

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* ACTIONS TOOLBAR */}
            {canAssignOthers && (
                <div className="col-span-full flex justify-end mb-4">
                    <button
                        onClick={createDemoTask}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Create Demo Task
                    </button>
                </div>
            )}
            {[0, 1, 2].map((status) => {
                const statusInfo = getStatusInfo(status);
                const filteredTasks = tasks.filter(t => t.status === status);

                return (
                    <div key={status} className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`} />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{statusInfo.label}</h3>
                                <span className="text-[10px] font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg text-slate-500">{filteredTasks.length}</span>
                            </div>
                        </div>

                        <div className="space-y-4 min-h-[500px] p-2 bg-black/20 border border-white/5 rounded-[2.5rem] relative group/column">
                            <AnimatePresence mode="popLayout">
                                {filteredTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="group bg-[#111112] border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-5 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/[0.03] rounded-2xl group-hover:bg-indigo-500/10 transition-colors border border-white/5 group-hover:border-indigo-500/20">
                                                    {getTypeIcon(task.type)}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black tracking-tighter text-lg leading-none">Room {task.room?.roomNumber || task.roomId}</h4>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{task.type === 0 ? 'Cleaning' : task.type === 1 ? 'Maintenance' : 'Inspection'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(task.id, status === 2 ? 0 : status + 1)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-white/10"
                                                >
                                                    {statusInfo.icon}
                                                </button>
                                                {(!task.assignedTo || task.assignedTo === "") && task.status !== 2 && user?.email && (
                                                    <button
                                                        onClick={() => assignToMe(task)}
                                                        className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 rounded-md px-3 py-1 transition-all"
                                                    >
                                                        Assign me
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {task.notes && (
                                            <div className="mb-6 relative">
                                                <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">&quot;{task.notes}&quot;</p>
                                                <div className="absolute left-0 top-0 w-0.5 h-full bg-indigo-500/20 rounded-full" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-white/5 pt-5">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                        <User className="w-2.5 h-2.5 text-slate-500" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                        {task.assignedTo || "Unassigned"}
                                                    </span>
                                                </div>
                                                {canAssignOthers && task.status !== 2 && (
                                                    assignees.length > 0 ? (
                                                        <select
                                                            defaultValue=""
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value) assignToOther(task, value);
                                                            }}
                                                            className="mt-1 w-full rounded-md bg-white/5 border border-white/15 text-[10px] text-slate-200 px-2 py-1 uppercase tracking-[0.18em] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        >
                                                            <option value="" disabled className="text-black">
                                                                Assign to staff…
                                                            </option>
                                                            {assignees.map((a) => (
                                                                <option key={a.id} value={a.email} className="text-black">
                                                                    {a.fullName || a.email}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="mt-1 w-full rounded-md bg-white/5 border border-white/10 text-[9px] text-red-400/70 px-2 py-1 uppercase tracking-widest italic flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-red-500/50" />
                                                            No eligible staff found
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.02] px-2 py-1 rounded-md border border-white/5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>

                                        {/* Activity Bloom Overlay */}
                                        <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 opacity-20 group-hover/column:opacity-30 transition-opacity">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center mb-4">
                                        <ClipboardList className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">No tasks in queue</span>
                                </div>
                            )}

                            {/* Background Atmosphere */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${statusInfo.bg.replace('/10', '/5')} to-transparent opacity-0 group-hover/column:opacity-100 transition-opacity pointer-events-none rounded-[2.5rem]`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
