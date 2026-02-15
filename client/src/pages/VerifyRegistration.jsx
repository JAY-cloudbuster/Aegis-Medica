import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-teal-200 mb-4">
                        <CheckCircle size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Enter the verification token to activate your account
                    </p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification Token</label>
                            <input
                                type="text"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm font-mono"
                                placeholder="Paste your token here"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 border border-rose-100">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3 border border-emerald-100">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
                        <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
