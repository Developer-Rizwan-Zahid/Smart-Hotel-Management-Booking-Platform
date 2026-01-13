"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, UserCheck, UserX, MoreVertical, RefreshCw } from "lucide-react";

interface UserRecord {
    id: string;
    userName: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
}

export function UserManagement() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error("Role update failed", error);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Identity & Access</h2>
                        <p className="text-slate-500 text-xs font-medium">Manage user permissions and system access levels</p>
                    </div>
                </div>
                <button
                    onClick={fetchUsers}
                    className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03]">
                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">User Profile</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Role Authority</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {users.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white uppercase">
                                                {user.fullName.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none">{user.fullName}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            {user.roles.map(role => (
                                                <span key={role} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                                    <Shield className="w-3 h-3" />
                                                    {role}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && (
                                                <span className="text-[9px] font-black text-slate-600 uppercase">No Authority</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`flex items-center gap-2 text-[10px] font-bold ${user.isActive ? "text-emerald-400" : "text-red-400"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                            {user.isActive ? "Active Session" : "Access Revoked"}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase outline-none focus:border-indigo-500 transition-all"
                                                value={user.roles[0] || ""}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updating === user.id}
                                            >
                                                <option value="" disabled>Change Privileges</option>
                                                <option value="Admin">System Admin</option>
                                                <option value="HotelManager">Estate Manager</option>
                                                <option value="Receptionist">Front Desk</option>
                                                <option value="Staff">Operations</option>
                                                <option value="Guest">Client Base</option>
                                            </select>
                                            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                                <MoreVertical className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
