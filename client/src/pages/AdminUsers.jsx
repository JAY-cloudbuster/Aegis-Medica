import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Leaf, Unlock, UserCircle, Search, ArrowUpRight, Lock } from 'lucide-react';

const roleConfig = {
    admin: { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
    doctor: { gradient: 'from-[#617050] to-[#7a8b66]', bg: 'bg-[#e8ebe3]', text: 'text-[#4d5940]' },
    patient: { gradient: 'from-[#94a37e] to-[#b3bea3]', bg: 'bg-[#f0ece4]', text: 'text-[#5a564e]' },
};

export default function AdminUsers() {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [unlocking, setUnlocking] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try { const res = await api('/api/users'); const data = await res.json(); setUsers(data.users || []); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUnlock = async (userId) => {
        setUnlocking(userId);
        try { await api(`/api/users/${userId}/unlock`, { method: 'POST' }); await fetchUsers(); }
        catch (err) { console.error(err); }
        finally { setUnlocking(null); }
    };

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#3d3a35] flex items-center gap-2">
                        <Users size={22} className="text-amber-600" />
                        User Management
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-1">Manage accounts, roles, and access</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold">{users.length} users</div>
            </div>

            <div className="relative animate-fade-in delay-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b3aa9a]" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium placeholder:text-[#c0b8a8]"
                    placeholder="Search users..." />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-[#d1d7c7] border-t-[#617050] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((u, i) => {
                        const rc = roleConfig[u.role] || roleConfig.patient;
                        return (
                            <div key={u._id} className="glass rounded-[1.25rem] p-5 hover-lift animate-fade-in-up flex items-center gap-4" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                                    <UserCircle size={22} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#3d3a35] truncate">{u.username}</p>
                                    <p className="text-xs text-[#a09888] truncate">{u.email}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${rc.bg} ${rc.text} hidden sm:inline-flex`}>{u.role}</span>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={`flex items-center gap-1 text-xs font-bold ${u.isVerified ? 'text-[#617050]' : 'text-amber-600'}`}>
                                        <Leaf size={12} /> {u.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                    {u.isLocked && <span className="flex items-center gap-1 text-xs text-[#d46a6a] font-bold"><Lock size={12} /> Locked</span>}
                                </div>
                                {u.isLocked ? (
                                    <button onClick={() => handleUnlock(u._id)} disabled={unlocking === u._id}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white shadow-md hover:scale-105 active:scale-95 flex-shrink-0">
                                        {unlocking === u._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Unlock size={12} />} Unlock
                                    </button>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-[#f5f0e8] flex items-center justify-center flex-shrink-0 hover:bg-[#e8ebe3] cursor-default group">
                                        <ArrowUpRight size={14} className="text-[#d1cdc4] group-hover:text-[#617050]" />
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
