import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck, FileText, Users, Lock, Activity,
    AlertCircle, ArrowUpRight, Sparkles, TrendingUp,
    Heart, Scan, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statCards = {
    admin: [
        { label: 'Total Users', icon: Users, gradient: 'from-purple-500 to-indigo-600', value: '—', suffix: '', key: 'users' },
        { label: 'Medical Records', icon: FileText, gradient: 'from-teal-500 to-emerald-600', value: '—', suffix: '', key: 'records' },
        { label: 'Security Level', icon: ShieldCheck, gradient: 'from-sky-500 to-blue-600', value: 'A+', suffix: '', key: 'events' },
    ],
    doctor: [
        { label: 'Active Patients', icon: Heart, gradient: 'from-rose-500 to-pink-600', value: '—', suffix: '', key: 'patients' },
        { label: 'Records Created', icon: FileText, gradient: 'from-teal-500 to-emerald-600', value: '—', suffix: '', key: 'records' },
        { label: 'Pending Reviews', icon: AlertCircle, gradient: 'from-amber-500 to-orange-600', value: '0', suffix: '', key: 'pending' },
    ],
    patient: [
        { label: 'My Records', icon: FileText, gradient: 'from-teal-500 to-emerald-600', value: '—', suffix: '', key: 'records' },
        { label: 'Prescriptions', icon: Activity, gradient: 'from-sky-500 to-blue-600', value: '—', suffix: 'active', key: 'prescriptions' },
        { label: 'Data Protection', icon: Lock, gradient: 'from-emerald-500 to-green-600', value: '100', suffix: '%', key: 'encryption' },
    ],
};

const welcomeMessages = {
    admin: 'Full system access • Monitor security events',
    doctor: 'Your patients\' data is protected with AES-256 encryption',
    patient: 'All your health data is encrypted and RSA-signed',
};

function AnimatedCounter({ value, suffix = '' }) {
    const [display, setDisplay] = useState(0);
    const num = parseInt(value);

    useEffect(() => {
        if (isNaN(num)) { setDisplay(value); return; }
        let start = 0;
        const duration = 1200;
        const step = (timestamp) => {
            start = start || timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * num));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value]);

    return <>{typeof display === 'number' ? display : display}{suffix}</>;
}

function SecurityMeter() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        setTimeout(() => setProgress(96), 500);
    }, []);

    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle
                    cx="60" cy="60" r="52"
                    stroke="url(#security-grad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 3.27} 327`}
                    style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
                <defs>
                    <linearGradient id="security-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-800">{progress}%</span>
                <span className="text-[10px] text-slate-500 font-medium">SECURE</span>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const cards = statCards[user?.role] || statCards.patient;

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-animated-gradient rounded-3xl p-8 text-white shadow-2xl shadow-teal-300/20 animate-fade-in-up">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-sm" />
                <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

                <div className="relative flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-teal-200 animate-pulse" />
                            <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
                                {user?.role} Dashboard
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold">
                            Welcome, <span className="text-teal-100">{user?.username}</span>
                        </h1>
                        <p className="text-teal-100/80 text-sm mt-2 max-w-md">
                            {welcomeMessages[user?.role]}
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur rounded-2xl px-5 py-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                        <span className="text-xs font-semibold">Session Active</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className={`glass rounded-3xl p-6 hover-lift cursor-default animate-fade-in-up`}
                            style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <div className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 cursor-pointer group">
                                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                            <p className="text-4xl font-extrabold text-slate-800 mt-1 tracking-tight">
                                <AnimatedCounter value={card.value} suffix={card.suffix} />
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 animate-fade-in delay-4">
                        <Scan size={18} className="text-teal-600" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user?.role !== 'patient' && (
                            <Link
                                to="/records"
                                className="glass rounded-2xl p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <FileText size={22} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Create Record</p>
                                    <p className="text-xs text-slate-500">Encrypted & digitally signed</p>
                                </div>
                                <ArrowUpRight size={16} className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
                            </Link>
                        )}

                        <Link
                            to="/records"
                            className="glass rounded-2xl p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-5"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                <Lock size={22} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">View Records</p>
                                <p className="text-xs text-slate-500">Decrypt & verify signatures</p>
                            </div>
                            <ArrowUpRight size={16} className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
                        </Link>

                        {user?.role === 'admin' && (
                            <Link
                                to="/admin/users"
                                className="glass rounded-2xl p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <UserCheck size={22} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Manage Users</p>
                                    <p className="text-xs text-slate-500">Roles, unlock, verify</p>
                                </div>
                                <ArrowUpRight size={16} className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Security Panel */}
                <div className="glass rounded-3xl p-6 animate-fade-in-up delay-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                        <ShieldCheck size={16} className="text-teal-600" />
                        Security Score
                    </h3>
                    <SecurityMeter />
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {[
                            { label: 'Encryption', value: 'AES-256', color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Signatures', value: 'RSA-2048', color: 'text-sky-600 bg-sky-50' },
                            { label: 'Hashing', value: 'bcrypt', color: 'text-purple-600 bg-purple-50' },
                            { label: 'Auth', value: 'MFA+JWT', color: 'text-teal-600 bg-teal-50' },
                        ].map(item => (
                            <div key={item.label} className={`text-center p-3 rounded-2xl ${item.color} hover:scale-105 cursor-default`}>
                                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{item.label}</p>
                                <p className="text-xs font-extrabold mt-0.5">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass rounded-3xl p-6 animate-fade-in-up delay-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-teal-600" />
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {[
                        { action: 'Session started', time: 'Just now', icon: '🔐', color: 'bg-teal-100' },
                        { action: 'Identity verified via MFA', time: 'Moments ago', icon: '✅', color: 'bg-emerald-100' },
                        { action: 'RSA keys loaded from database', time: 'On startup', icon: '🔑', color: 'bg-sky-100' },
                    ].map((event, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50/80 animate-slide-left`}
                            style={{ animationDelay: `${0.6 + i * 0.15}s` }}
                        >
                            <div className={`w-10 h-10 rounded-xl ${event.color} flex items-center justify-center text-lg`}>
                                {event.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700">{event.action}</p>
                                <p className="text-xs text-slate-400">{event.time}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
