import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck, FileText, Users, Lock,
    Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statCards = {
    admin: [
        { label: 'Total Users', icon: Users, color: 'from-purple-500 to-purple-700', key: 'users' },
        { label: 'Medical Records', icon: FileText, color: 'from-teal-500 to-teal-700', key: 'records' },
        { label: 'Security Events', icon: ShieldCheck, color: 'from-sky-500 to-sky-700', key: 'events' },
    ],
    doctor: [
        { label: 'My Patients', icon: Users, color: 'from-teal-500 to-teal-700', key: 'patients' },
        { label: 'Records Created', icon: FileText, color: 'from-sky-500 to-sky-700', key: 'records' },
        { label: 'Pending Reviews', icon: AlertCircle, color: 'from-amber-500 to-amber-700', key: 'pending' },
    ],
    patient: [
        { label: 'My Records', icon: FileText, color: 'from-teal-500 to-teal-700', key: 'records' },
        { label: 'Active Prescriptions', icon: Activity, color: 'from-sky-500 to-sky-700', key: 'prescriptions' },
        { label: 'Encryption Status', icon: Lock, color: 'from-emerald-500 to-emerald-700', key: 'encryption' },
    ],
};

const welcomeMessages = {
    admin: 'System Admin Dashboard — Full access to all resources.',
    doctor: 'Welcome, Doctor. Your patients\' data is AES-256 encrypted.',
    patient: 'Your health data is protected with RSA-signed, AES-encrypted records.',
};

export default function Dashboard() {
    const { user } = useAuth();
    const cards = statCards[user?.role] || statCards.patient;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Welcome back, <span className="text-teal-200">{user?.username}</span>
                        </h1>
                        <p className="text-teal-100 text-sm mt-2 max-w-lg">
                            {welcomeMessages[user?.role]}
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium">Session Active</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.key} className="glass rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 cursor-default">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                                <Icon size={22} className="text-white" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">—</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user?.role !== 'patient' && (
                        <Link
                            to="/records"
                            className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-teal-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100">
                                <FileText size={20} className="text-teal-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Create Medical Record</p>
                                <p className="text-xs text-slate-500">Encrypted & digitally signed</p>
                            </div>
                        </Link>
                    )}

                    <Link
                        to="/records"
                        className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-sky-200 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100">
                            <Lock size={20} className="text-sky-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">View Encrypted Records</p>
                            <p className="text-xs text-slate-500">Decrypt with signature verification</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Security Info */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-teal-600" />
                    Security Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Encryption', value: 'AES-256-CBC', color: 'text-emerald-600' },
                        { label: 'Signatures', value: 'RSA-SHA256', color: 'text-sky-600' },
                        { label: 'Authentication', value: 'MFA + OTP', color: 'text-teal-600' },
                        { label: 'Hashing', value: 'bcrypt (10r)', color: 'text-purple-600' },
                    ].map(item => (
                        <div key={item.label} className="text-center p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">{item.label}</p>
                            <p className={`text-sm font-bold mt-1 ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
