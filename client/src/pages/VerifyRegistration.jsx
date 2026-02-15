import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Leaf, CheckCircle, ArrowLeft, Mail, User } from 'lucide-react';

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
        setError(''); setSuccess(''); setLoading(true);
        try {
            const res = await fetch('/api/verify-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, token }) });
            const data = await res.json();
            if (!res.ok) setError(data.error);
            else { setSuccess('Verified! Redirecting...'); setTimeout(() => navigate('/login'), 2000); }
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 grain">
            <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] via-[#f0ece4] to-[#e8ebe3]" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div className="w-full max-w-md relative z-10">
                <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-[#8a8478] hover:text-[#617050] mb-6 animate-fade-in">
                    <ArrowLeft size={16} /> Back to login
                </button>

                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#7a9e6b] to-[#617050] rounded-[1.25rem] flex items-center justify-center shadow-xl mx-auto animate-bounce-soft">
                        <CheckCircle size={32} className="text-white drop-shadow" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#3d3a35] mt-6 animate-fade-in delay-2">
                        Verify <span className="text-gradient">Email</span>
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-2 animate-fade-in delay-3">Enter the token to activate your account</p>
                </div>

                <div className="glass rounded-[1.5rem] p-8 shadow-xl animate-fade-in-up delay-3 hover-lift">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="animate-fade-in delay-4">
                            <label className="block text-sm font-semibold text-[#5a564e] mb-2">Username</label>
                            <div className="relative group">
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium group-hover:border-[#d1d7c7]" required />
                                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1cdc4] group-hover:text-[#94a37e]" />
                            </div>
                        </div>
                        <div className="animate-fade-in delay-5">
                            <label className="block text-sm font-semibold text-[#5a564e] mb-2">Verification Token</label>
                            <div className="relative group">
                                <input type="text" value={token} onChange={e => setToken(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-mono font-medium group-hover:border-[#d1d7c7]" placeholder="Paste token here" required />
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1cdc4] group-hover:text-[#94a37e]" />
                            </div>
                        </div>
                        {error && <div className="bg-red-50 text-[#d46a6a] text-sm rounded-2xl px-4 py-3.5 border border-red-100 animate-scale-in">{error}</div>}
                        {success && <div className="bg-[#e8ebe3] text-[#617050] text-sm rounded-2xl px-4 py-3.5 border border-[#d1d7c7] animate-scale-in">✅ {success}</div>}
                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] animate-fade-in delay-6">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Leaf size={18} /> Verify Email</>}
                        </button>
                    </form>
                    <p className="text-center text-sm text-[#8a8478] mt-6">Already verified? <Link to="/login" className="text-[#617050] font-bold hover:underline">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
