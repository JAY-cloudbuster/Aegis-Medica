import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
    Leaf, FileText, Users, Lock, Activity, Heart,
    ArrowUpRight, Sparkles, TrendingUp, UserCheck, Scan
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statCards = {
    admin: [
        { label: 'Total Users', icon: Users, color: 'from-amber-500 to-amber-600', value: '24', key: 'users' },
        { label: 'Records', icon: FileText, color: 'from-[#617050] to-[#7a8b66]', value: '156', key: 'records' },
        { label: 'Security', icon: Leaf, color: 'from-[#94a37e] to-[#b3bea3]', value: 'A+', key: 'events' },
    ],
    doctor: [
        { label: 'Patients', icon: Heart, color: 'from-[#c47a6a] to-[#d48a7a]', value: '12', key: 'patients' },
        { label: 'Records', icon: FileText, color: 'from-[#617050] to-[#7a8b66]', value: '48', key: 'records' },
        { label: 'Pending', icon: Activity, color: 'from-amber-500 to-amber-600', value: '3', key: 'pending' },
    ],
    patient: [
        { label: 'My Records', icon: FileText, color: 'from-[#617050] to-[#7a8b66]', value: '8', key: 'records' },
        { label: 'Active Rx', icon: Activity, color: 'from-[#94a37e] to-[#b3bea3]', value: '2', key: 'prescriptions' },
        { label: 'Protection', icon: Lock, color: 'from-amber-500 to-amber-600', value: '100%', key: 'encryption' },
    ],
};

const welcomeMessages = {
    admin: 'Manage your team and monitor system health.',
    doctor: 'Your patients\' records are safely encrypted and signed.',
    patient: 'All your health data is private and protected.',
};

function AnimatedCounter({ value }) {
    const [display, setDisplay] = useState('0');
    useEffect(() => {
        const num = parseInt(value);
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
    return <>{display}</>;
}

function WellnessMeter() {
    const [progress, setProgress] = useState(0);
    useEffect(() => { setTimeout(() => setProgress(96), 500); }, []);
    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#e8ebe3" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r="52" stroke="url(#well-grad)" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${progress * 3.27} 327`} style={{ transition: 'stroke-dasharray 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                <defs>
                    <linearGradient id="well-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#617050" />
                        <stop offset="100%" stopColor="#d4a24e" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[#3d3a35]">{progress}%</span>
                <span className="text-[10px] text-[#8a8478] font-semibold">SECURE</span>
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
            <div className="relative overflow-hidden bg-gradient-to-r from-[#617050] via-[#7a8b66] to-[#94a37e] rounded-[1.5rem] p-8 text-white shadow-xl animate-fade-in-up">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-sm" />
                <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

                <div className="relative flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-[#d4d8c8] animate-breathe" />
                            <span className="text-xs font-semibold text-[#d4d8c8] uppercase tracking-wider">{user?.role} portal</span>
                        </div>
                        <h1 className="text-3xl font-extrabold">
                            Good evening, <span className="text-[#e8ebe3]">{user?.username}</span>
                        </h1>
                        <p className="text-white/60 text-sm mt-2 max-w-md">{welcomeMessages[user?.role]}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#c4d4b0] animate-breathe shadow-lg shadow-green-300/30" />
                        <span className="text-xs font-semibold">Session Active</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.key} className="glass rounded-[1.25rem] p-6 hover-lift cursor-default animate-fade-in-up" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-13 h-13 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div className="p-2 rounded-xl bg-[#f5f0e8] hover:bg-[#e8ebe3] cursor-pointer group">
                                    <ArrowUpRight size={14} className="text-[#b3aa9a] group-hover:text-[#617050]" />
                                </div>
                            </div>
                            <p className="text-sm text-[#8a8478] font-medium">{card.label}</p>
                            <p className="text-3xl font-extrabold text-[#3d3a35] mt-1 tracking-tight">
                                <AnimatedCounter value={card.value} />
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-base font-bold text-[#3d3a35] flex items-center gap-2 animate-fade-in delay-4">
                        <Scan size={16} className="text-[#94a37e]" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user?.role !== 'patient' && (
                            <Link to="/records" className="glass rounded-[1.25rem] p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#617050] to-[#7a8b66] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <FileText size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#3d3a35]">New Record</p>
                                    <p className="text-xs text-[#a09888]">Encrypted & signed</p>
                                </div>
                                <ArrowUpRight size={14} className="ml-auto text-[#d1cdc4] group-hover:text-[#617050]" />
                            </Link>
                        )}
                        <Link to="/records" className="glass rounded-[1.25rem] p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                <Lock size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-[#3d3a35]">View Records</p>
                                <p className="text-xs text-[#a09888]">Decrypt & verify</p>
                            </div>
                            <ArrowUpRight size={14} className="ml-auto text-[#d1cdc4] group-hover:text-[#617050]" />
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin/users" className="glass rounded-[1.25rem] p-6 flex items-center gap-4 hover-lift group animate-fade-in-up delay-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#94a37e] to-[#b3bea3] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <UserCheck size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#3d3a35]">Users</p>
                                    <p className="text-xs text-[#a09888]">Manage & unlock</p>
                                </div>
                                <ArrowUpRight size={14} className="ml-auto text-[#d1cdc4] group-hover:text-[#617050]" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Security */}
                <div className="glass rounded-[1.25rem] p-6 animate-fade-in-up delay-5">
                    <h3 className="font-bold text-[#3d3a35] mb-4 flex items-center gap-2 text-sm">
                        <Leaf size={14} className="text-[#94a37e]" />
                        Health Score
                    </h3>
                    <WellnessMeter />
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {[
                            { label: 'Encryption', value: 'AES-256', color: 'text-[#617050] bg-[#e8ebe3]' },
                            { label: 'Signatures', value: 'RSA', color: 'text-amber-700 bg-amber-50' },
                            { label: 'Hashing', value: 'bcrypt', color: 'text-[#94a37e] bg-[#f0ece4]' },
                            { label: 'Auth', value: 'MFA', color: 'text-[#8a7a60] bg-[#f5f0e8]' },
                        ].map(item => (
                            <div key={item.label} className={`text-center p-3 rounded-xl ${item.color} hover:scale-105 cursor-default`}>
                                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{item.label}</p>
                                <p className="text-xs font-extrabold mt-0.5">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="glass rounded-[1.25rem] p-6 animate-fade-in-up delay-6">
                <h3 className="font-bold text-[#3d3a35] mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#94a37e]" />
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {[
                        { action: 'Session started successfully', time: 'Just now', icon: '🌱', color: 'bg-[#e8ebe3]' },
                        { action: 'Identity verified securely', time: 'A moment ago', icon: '✨', color: 'bg-[#f5f0e8]' },
                        { action: 'Encryption keys are ready', time: 'On startup', icon: '🔑', color: 'bg-amber-50' },
                    ].map((event, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f5f0e8]/60 animate-slide-left" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                            <div className={`w-10 h-10 rounded-xl ${event.color} flex items-center justify-center text-lg`}>{event.icon}</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#5a564e]">{event.action}</p>
                                <p className="text-xs text-[#b3aa9a]">{event.time}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-[#b3bea3]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
