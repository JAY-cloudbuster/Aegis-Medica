import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, KeyRound, Timer, ArrowLeft } from 'lucide-react';

export default function OTPVerify() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split('')); inputRefs.current[5]?.focus(); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return setError('Enter all 6 digits');
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, otp: code }) });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }
            else { login(data.token, data.user); navigate('/dashboard'); }
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
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-amber-200/20 animate-bounce-soft">
                            <KeyRound size={32} className="text-white drop-shadow" />
                        </div>
                        <div className="absolute -inset-2 rounded-[1.5rem] border-2 border-amber-300/20 animate-pulse-soft" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#3d3a35] mt-6 animate-fade-in delay-2">
                        Verify <span className="text-gradient">Identity</span>
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-2 animate-fade-in delay-3">Enter the 6-digit code from the server console</p>
                </div>

                <div className="glass rounded-[1.5rem] p-8 shadow-xl animate-fade-in-up delay-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                                    onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                                    className={`w-13 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-white/60 input-glow outline-none animate-fade-in-up ${digit ? 'border-[#94a37e] bg-[#f6f7f4] scale-105' : 'border-[#e0d8cc]'}`}
                                    style={{ animationDelay: `${0.3 + i * 0.08}s` }} />
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-2 animate-fade-in delay-5">
                            <Timer size={16} className={timeLeft <= 30 ? 'text-[#d46a6a] animate-pulse' : 'text-[#a09888]'} />
                            <span className={`text-sm font-mono font-bold ${timeLeft <= 30 ? 'text-[#d46a6a]' : 'text-[#8a8478]'}`}>
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                        {error && <div className="bg-red-50 text-[#d46a6a] text-sm rounded-2xl px-4 py-3.5 border border-red-100 animate-scale-in text-center">{error}</div>}
                        <button type="submit" disabled={loading || timeLeft <= 0}
                            className="w-full py-4 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] animate-fade-in delay-6">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Leaf size={18} /> Verify & Enter</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
