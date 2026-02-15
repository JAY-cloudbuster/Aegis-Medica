import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, ArrowLeft, Mail, User } from 'lucide-react';

export default function VerifyRegistration() {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState(location.state?.username || '');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/verify-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, token }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
            } else {
                setSuccess('Email verified! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/30 dot-grid" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-6 animate-fade-in"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </button>

                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-300/30 animate-bounce-in">
                            <CheckCircle size={36} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mt-6 animate-fade-in delay-2">
                        Verify <span className="text-gradient">Email</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 animate-fade-in delay-3">
                        Enter the verification token to activate your account
                    </p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl shadow-teal-100/40 animate-fade-in-up delay-3 hover-lift">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="animate-fade-in delay-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium group-hover:border-teal-300"
                                    required
                                />
                                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-teal-500" />
                            </div>
                        </div>

                        <div className="animate-fade-in delay-5">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Token</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-mono font-medium group-hover:border-teal-300"
                                    placeholder="Paste your token here"
                                    required
                                />
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-teal-500" />
                            </div>
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
                            type="submit"
                            disabled={loading}
                            className="btn-ripple w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200/40 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] animate-fade-in delay-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Verify Email
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already verified?{' '}
                        <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
