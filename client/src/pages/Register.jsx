import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, Eye, EyeOff, Stethoscope, Mail, User } from 'lucide-react';

const roles = [
    { id: 'patient', label: 'Patient', emoji: '🩺', desc: 'View your records' },
    { id: 'doctor', label: 'Doctor', emoji: '👨‍⚕️', desc: 'Manage patients' },
    { id: 'admin', label: 'Admin', emoji: '🔧', desc: 'System access' },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'patient' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: role, 2: details
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
            } else {
                setSuccess(`Account created! Verification token: ${data.verificationToken}`);
                setTimeout(() => navigate('/verify', { state: { username: form.username } }), 3000);
            }
        } catch {
            setError('Network error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/40 to-sky-50/30 dot-grid" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-animated-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-300/30 animate-bounce-in">
                            <UserPlus size={36} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mt-6 animate-fade-in delay-2">
                        Join <span className="text-gradient">Aegis Medical</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 animate-fade-in delay-3">
                        Create your secure healthcare account
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in delay-3">
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-teal-500 w-12' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-teal-500 w-12' : 'bg-slate-200'}`} />
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl shadow-teal-100/40 animate-fade-in-up delay-3 hover-lift">
                    {step === 1 ? (
                        /* Step 1: Role Selection */
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">I am a...</h3>
                            <div className="space-y-3">
                                {roles.map((r, i) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => { setForm({ ...form, role: r.id }); setStep(2); }}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up`}
                                        style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                                    >
                                        <span className="text-3xl">{r.emoji}</span>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">{r.label}</p>
                                            <p className="text-xs text-slate-500">{r.desc}</p>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.role === r.id ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                                            }`}>
                                            {form.role === r.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Account Details */
                        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                            {/* Back button */}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 mb-2"
                            >
                                ← Change role ({form.role})
                            </button>

                            <div className="animate-fade-in delay-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium placeholder:text-slate-400 group-hover:border-teal-300"
                                        placeholder="Enter username"
                                        required
                                    />
                                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-teal-500" />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium placeholder:text-slate-400 group-hover:border-teal-300"
                                        placeholder="doctor@hospital.com"
                                        required
                                    />
                                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-teal-500" />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium placeholder:text-slate-400 pr-12 group-hover:border-teal-300"
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-600 hover:scale-110">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Password strength meter */}
                                {form.password && (
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${form.password.length >= i * 3
                                                        ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-teal-400' : 'bg-emerald-500'
                                                        : 'bg-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-rose-50 text-rose-600 text-sm rounded-2xl px-4 py-3.5 border border-rose-100 animate-scale-in">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-emerald-50 text-emerald-600 text-sm rounded-2xl px-4 py-3.5 border border-emerald-100 animate-scale-in">
                                    ✅ {success}
                                </div>
                            )}

                            <button
                                ref={btnRef}
                                type="submit"
                                disabled={loading}
                                onClick={handleRipple}
                                className="btn-ripple w-full py-4 bg-animated-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-200/40 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-teal-300/40 hover:scale-[1.02] active:scale-[0.98] animate-fade-in delay-4"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Create Secure Account
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5 animate-fade-in delay-7">
                    <Stethoscope size={14} />
                    Protected by AES-256 Encryption & RSA Digital Signatures
                </p>
            </div>
        </div>
    );
}
