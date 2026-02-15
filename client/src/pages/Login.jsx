import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Leaf, Lock, Heart, Users, UserCircle, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoRoles = [
    { id: 'admin', label: 'Administrator', emoji: '🏥', desc: 'Full system access, manage users', gradient: 'from-amber-600 to-amber-700', shadow: 'shadow-amber-200/30', ring: 'ring-amber-200' },
    { id: 'doctor', label: 'Doctor', emoji: '🩺', desc: 'Create & manage patient records', gradient: 'from-[#617050] to-[#7a8b66]', shadow: 'shadow-green-200/30', ring: 'ring-green-200' },
    { id: 'patient', label: 'Patient', emoji: '🌿', desc: 'View & decrypt your records', gradient: 'from-[#94a37e] to-[#b3bea3]', shadow: 'shadow-green-100/30', ring: 'ring-green-100' },
];

export default function Login() {
    const navigate = useNavigate();
    const { login, DEMO_MODE, MOCK_USERS } = useAuth();
    const [selectedRole, setSelectedRole] = useState('doctor');
    const [loading, setLoading] = useState(false);
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
                login('demo-token', MOCK_USERS[selectedRole]);
                navigate('/dashboard');
            }
        }, 800);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 grain">
            {/* Warm background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] via-[#f0ece4] to-[#e8ebe3]" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#617050] to-[#94a37e] rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-green-900/10 animate-bounce-soft">
                            <Leaf size={36} className="text-white/90 drop-shadow" />
                        </div>
                        <div className="absolute -inset-2 rounded-[1.5rem] border-2 border-[#b3bea3]/30 animate-pulse-soft" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#3d3a35] mt-7 tracking-tight animate-fade-in delay-2">
                        Welcome to <span className="text-gradient">Aegis</span>
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-2 animate-fade-in delay-3">
                        Your trusted healthcare companion
                    </p>
                </div>

                {/* Demo badge */}
                <div className="flex justify-center mb-6 animate-fade-in delay-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f0e8] border border-[#e0d8cc] text-[#8a7a60] text-xs font-semibold">
                        <Heart size={13} className="animate-breathe text-[#d4a24e]" />
                        Explore Mode — Choose a role to browse
                    </div>
                </div>

                {/* Card */}
                <div className="glass rounded-[1.5rem] p-8 shadow-xl animate-fade-in-up delay-3">
                    <h3 className="text-xs font-bold text-[#8a8478] uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Users size={14} className="text-[#94a37e]" />
                        I want to enter as
                    </h3>

                    <div className="space-y-3 mb-7">
                        {demoRoles.map((role, i) => {
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`
                    w-full p-4 rounded-2xl border-2 flex items-center gap-4 animate-fade-in-up active:scale-[0.98]
                    ${isSelected
                                            ? `border-[#94a37e] bg-gradient-to-r from-[#f6f7f4] to-[#e8ebe3] shadow-lg shadow-green-100/40`
                                            : `border-[#e8e4dc] bg-white/50 hover:border-[#d1d7c7] hover:bg-[#faf8f4]`
                                        }
                  `}
                                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                                >
                                    <span className="text-3xl">{role.emoji}</span>
                                    <div className="text-left flex-1">
                                        <p className={`font-bold text-sm ${isSelected ? 'text-[#4d5940]' : 'text-[#5a564e]'}`}>{role.label}</p>
                                        <p className="text-xs text-[#a09888]">{role.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#7a8b66] bg-[#7a8b66]' : 'border-[#d1cdc4]'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Enter */}
                    <button
                        ref={btnRef}
                        onClick={(e) => { handleRipple(e); handleLogin(); }}
                        disabled={loading}
                        className="btn-ripple w-full py-4 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-900/10 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] animate-fade-in delay-6"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Entering...</span>
                            </div>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Enter as {demoRoles.find(r => r.id === selectedRole)?.label}
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in delay-7">
                    {[
                        { icon: Lock, label: 'Encrypted' },
                        { icon: ShieldCheck, label: 'Secure' },
                        { icon: Stethoscope, label: 'Medical' },
                    ].map(b => (
                        <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f0e8]/80 text-xs text-[#8a8478] font-medium border border-[#e8e4dc] hover:border-[#d1d7c7] hover:text-[#617050] cursor-default">
                            <b.icon size={12} />
                            {b.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
