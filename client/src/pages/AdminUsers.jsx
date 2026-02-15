import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users, ShieldCheck, Unlock, UserCircle, Search,
    ArrowUpRight, Lock
} from 'lucide-react';

const roleConfig = {
    admin: { gradient: 'from-purple-500 to-indigo-600', bg: 'bg-purple-100', text: 'text-purple-700' },
    doctor: { gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-100', text: 'text-teal-700' },
    patient: { gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-100', text: 'text-sky-700' },
};

export default function AdminUsers() {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [unlocking, setUnlocking] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUnlock = async (userId) => {
        setUnlocking(userId);
        try {
            await api(`/api/users/${userId}/unlock`, { method: 'POST' });
            await fetchUsers();
        } catch (err) { console.error(err); }
        finally { setUnlocking(null); }
    };

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Users size={24} className="text-purple-600" />
                        User Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Admin panel — manage roles, unlock accounts</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold">
                    {users.length} users
                </div>
            </div>

            {/* Search */}
            <div className="relative animate-fade-in delay-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium placeholder:text-slate-400"
                    placeholder="Search users by name or email..."
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((u, i) => {
                        const rc = roleConfig[u.role] || roleConfig.patient;
                        return (
                            <div
                                key={u._id}
                                className="glass rounded-2xl p-5 hover-lift animate-fade-in-up flex items-center gap-4"
                                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                            >
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                    <UserCircle size={24} className="text-white" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{u.username}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                </div>

                                {/* Role badge */}
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${rc.bg} ${rc.text} hidden sm:inline-flex`}>
                                    {u.role}
                                </span>

                                {/* Status */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={`flex items-center gap-1 text-xs font-bold ${u.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        <ShieldCheck size={12} />
                                        {u.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                    {u.isLocked && (
                                        <span className="flex items-center gap-1 text-xs text-rose-600 font-bold">
                                            <Lock size={12} />
                                            Locked
                                        </span>
                                    )}
                                </div>

                                {/* Action */}
                                {u.isLocked ? (
                                    <button
                                        onClick={() => handleUnlock(u._id)}
                                        disabled={unlocking === u._id}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
                                    >
                                        {unlocking === u._id ? (
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Unlock size={12} />
                                        )}
                                        Unlock
                                    </button>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 hover:bg-teal-50 cursor-default group">
                                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-teal-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
