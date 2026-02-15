import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Stethoscope, Lock, Sparkles, Users, UserCircle, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoRoles = [
    { id: 'admin', label: 'Administrator', icon: Crown, emoji: '🔧', desc: 'Full system access, manage users', gradient: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-200/40' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, emoji: '👨‍⚕️', desc: 'Create & manage patient records', gradient: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-200/40' },
    { id: 'patient', label: 'Patient', icon: UserCircle, emoji: '🩺', desc: 'View & decrypt your records', gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-200/40' },
];

export default function Login() {
    const navigate = useNavigate();
    const { login, DEMO_MODE, MOCK_USERS } = useAuth();
    const [selectedRole, setSelectedRole] = useState('doctor');
    const [loading, setLoading] = useState(false);
    const [hoveredRole, setHoveredRole] = useState(null);
    const btnRef = useRef(null);

    const handleRipple = (e) => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
        circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
        circle.className = 'ripple-circle';
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    };

    const handleLogin = () => {
        setLoading(true);
        setTimeout(() => {
            if (DEMO_MODE && MOCK_USERS) {
                const mockUser = MOCK_USERS[selectedRole];
                login('demo-token', mockUser);
                navigate('/dashboard');
            }
        }, 800);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/40 to-sky-50/30 dot-grid" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <div className="w-full max-w-lg relative z-10">
                {/* Logo with bounce animation */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-animated-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-300/30 animate-bounce-in">
                            <ShieldCheck size={40} className="text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -inset-2 rounded-3xl border-2 border-teal-400/20 animate-pulse-glow" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mt-6 animate-fade-in delay-2">
                        Welcome to <span className="text-gradient">Aegis</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 animate-fade-in delay-3">
                        Select a role to explore the secure medical portal
                    </p>
                </div>

                {/* Demo Mode Badge */}
                <div className="flex justify-center mb-6 animate-fade-in delay-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 text-xs font-bold">
                        <Sparkles size={14} className="animate-pulse" />
                        UI EXPLORATION MODE — No backend needed
                    </div>
                </div>

                {/* Role Selection Cards */}
                <div className="glass rounded-3xl p-8 shadow-2xl shadow-teal-100/40 animate-fade-in-up delay-3">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users size={16} className="text-teal-600" />
                        Choose your role
                    </h3>

                    <div className="space-y-3 mb-6">
                        {demoRoles.map((role, i) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            const isHovered = hoveredRole === role.id;

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    onMouseEnter={() => setHoveredRole(role.id)}
                                    onMouseLeave={() => setHoveredRole(null)}
                                    className={`
                    w-full p-4 rounded-2xl border-2 flex items-center gap-4
                    animate-fade-in-up active:scale-[0.98]
                    ${isSelected
                                            ? `border-transparent bg-gradient-to-r ${role.gradient} text-white shadow-xl ${role.shadow}`
                                            : `border-slate-200 bg-white/60 text-slate-800 hover:border-teal-200 hover:bg-white/80`
                                        }
                  `}
                                    style={{ animationDelay: `${0.35 + i * 0.1}s` }}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isSelected ? 'bg-white/20' : 'bg-slate-100'
                                        }`}>
                                        {role.emoji}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-sm">{role.label}</p>
                                        <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{role.desc}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-300'
                                        }`}>
                                        {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Enter Button with ripple */}
                    <button
                        ref={btnRef}
                        onClick={(e) => { handleRipple(e); handleLogin(); }}
                        disabled={loading}
                        className="btn-ripple w-full py-4 bg-animated-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-200/40 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-teal-300/40 hover:scale-[1.02] active:scale-[0.98] animate-fade-in delay-6"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Entering as {selectedRole}...</span>
                            </div>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Enter as {demoRoles.find(r => r.id === selectedRole)?.label}
                            </>
                        )}
                    </button>
                </div>

                {/* Footer badges */}
                <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in delay-7">
                    {[
                        { icon: Lock, label: 'AES-256' },
                        { icon: ShieldCheck, label: 'MFA' },
                        { icon: Stethoscope, label: 'HIPAA' },
                    ].map(b => (
                        <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur text-xs text-slate-500 font-medium border border-white/40 hover:border-teal-200 hover:text-teal-600 cursor-default">
                            <b.icon size={12} />
                            {b.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
