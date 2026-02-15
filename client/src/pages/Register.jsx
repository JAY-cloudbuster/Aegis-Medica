import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, UserPlus, Eye, EyeOff, Heart, Mail, User } from 'lucide-react';

const roles = [
    { id: 'patient', label: 'Patient', emoji: '🌿', desc: 'View your records' },
    { id: 'doctor', label: 'Doctor', emoji: '🩺', desc: 'Manage patients' },
    { id: 'admin', label: 'Admin', emoji: '🏥', desc: 'System access' },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'patient' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) setError(data.error);
            else { setSuccess(`Account created! Token: ${data.verificationToken}`); setTimeout(() => navigate('/verify', { state: { username: form.username } }), 3000); }
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 grain">
            <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] via-[#f0ece4] to-[#e8ebe3]" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#617050] to-[#94a37e] rounded-[1.25rem] flex items-center justify-center shadow-xl mx-auto animate-bounce-soft">
                        <UserPlus size={32} className="text-white drop-shadow" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#3d3a35] mt-6 animate-fade-in delay-2">
                        Join <span className="text-gradient">Aegis</span>
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-2 animate-fade-in delay-3">Create your healthcare account</p>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in delay-3">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#94a37e] w-12' : 'bg-[#e0d8cc] w-8'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#94a37e] w-12' : 'bg-[#e0d8cc] w-8'}`} />
                </div>

                <div className="glass rounded-[1.5rem] p-8 shadow-xl animate-fade-in-up delay-3 hover-lift">
                    {step === 1 ? (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-[#3d3a35] text-center mb-2">I am a...</h3>
                            <div className="space-y-3">
                                {roles.map((r, i) => (
                                    <button key={r.id} type="button" onClick={() => { setForm({ ...form, role: r.id }); setStep(2); }}
                                        className="w-full p-4 rounded-2xl border-2 border-[#e8e4dc] bg-white/50 flex items-center gap-4 hover:border-[#d1d7c7] hover:bg-[#faf8f4] active:scale-[0.98] animate-fade-in-up"
                                        style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                                        <span className="text-3xl">{r.emoji}</span>
                                        <div className="text-left">
                                            <p className="font-bold text-[#3d3a35]">{r.label}</p>
                                            <p className="text-xs text-[#a09888]">{r.desc}</p>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.role === r.id ? 'border-[#7a8b66] bg-[#7a8b66]' : 'border-[#d1cdc4]'}`}>
                                            {form.role === r.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-[#617050] font-semibold hover:text-[#4d5940] flex items-center gap-1 mb-2">← Change role ({form.role})</button>

                            <div className="animate-fade-in delay-1">
                                <label className="block text-sm font-semibold text-[#5a564e] mb-2">Username</label>
                                <div className="relative group">
                                    <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium group-hover:border-[#d1d7c7]" required />
                                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1cdc4] group-hover:text-[#94a37e]" />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-2">
                                <label className="block text-sm font-semibold text-[#5a564e] mb-2">Email</label>
                                <div className="relative group">
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium group-hover:border-[#d1d7c7]" placeholder="hello@example.com" required />
                                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1cdc4] group-hover:text-[#94a37e]" />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-3">
                                <label className="block text-sm font-semibold text-[#5a564e] mb-2">Password</label>
                                <div className="relative group">
                                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium pr-12 group-hover:border-[#d1d7c7]" placeholder="Min 6 characters" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1cdc4] hover:text-[#617050] hover:scale-110">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${form.password.length >= i * 3
                                                    ? i <= 1 ? 'bg-[#d46a6a]' : i <= 2 ? 'bg-[#d4a24e]' : i <= 3 ? 'bg-[#94a37e]' : 'bg-[#617050]'
                                                    : 'bg-[#e0d8cc]'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && <div className="bg-red-50 text-[#d46a6a] text-sm rounded-2xl px-4 py-3.5 border border-red-100 animate-scale-in">{error}</div>}
                            {success && <div className="bg-[#e8ebe3] text-[#617050] text-sm rounded-2xl px-4 py-3.5 border border-[#d1d7c7] animate-scale-in">✅ {success}</div>}

                            <button type="submit" disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] animate-fade-in delay-4">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Leaf size={18} /> Create Account</>}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-[#8a8478] mt-6">Already have an account? <Link to="/login" className="text-[#617050] font-bold hover:underline">Sign in</Link></p>
                </div>

                <p className="text-center text-xs text-[#b3aa9a] mt-6 flex items-center justify-center gap-1.5 animate-fade-in delay-7">
                    <Heart size={12} className="text-[#c47a6a]" /> Protected with care — AES-256 & RSA
                </p>
            </div>
        </div>
    );
}
