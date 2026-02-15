import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, Unlock, UserCircle } from 'lucide-react';

const roleStyles = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-teal-100 text-teal-700',
    patient: 'bg-sky-100 text-sky-700',
};

export default function AdminUsers() {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (userId) => {
        try {
            await api(`/api/users/${userId}/unlock`, { method: 'POST' });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <p className="text-sm text-slate-500">Admin-only: Manage all system users</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-100 to-sky-100 flex items-center justify-center">
                                                <UserCircle size={20} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{u.username}</p>
                                                <p className="text-xs text-slate-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleStyles[u.role] || ''}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`flex items-center gap-1 text-xs font-medium ${u.isVerified ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                <ShieldCheck size={12} />
                                                {u.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                            {u.isLocked && (
                                                <span className="text-xs text-rose-600 font-medium">🔒 Locked</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.isLocked && (
                                            <button
                                                onClick={() => handleUnlock(u._id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                            >
                                                <Unlock size={12} />
                                                Unlock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
