import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, KeyRound, Timer, ArrowLeft } from 'lucide-react';

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

    // Countdown timer
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
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return setError('Please enter all 6 digits');

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, otp: code }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                login(data.token, data.user);
                navigate('/dashboard');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30 dot-grid" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div className="w-full max-w-md relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-6 animate-fade-in"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </button>

                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-500 via-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-300/30 animate-bounce-in">
                            <KeyRound size={36} className="text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -inset-2 rounded-3xl border-2 border-sky-400/20 animate-pulse-glow" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mt-6 animate-fade-in delay-2">
                        Two-Factor <span className="text-gradient">Auth</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 animate-fade-in delay-3">
                        Enter the 6-digit code from your server console
                    </p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl shadow-teal-100/40 animate-fade-in-up delay-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className={`w-13 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-white/60 input-glow outline-none animate-fade-in-up ${digit ? 'border-teal-400 bg-teal-50/50 scale-105' : 'border-slate-200'
                                        }`}
                                    style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                                />
                            ))}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-center gap-2 animate-fade-in delay-5">
                            <Timer size={16} className={timeLeft <= 30 ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
                            <span className={`text-sm font-mono font-bold ${timeLeft <= 30 ? 'text-rose-500' : 'text-slate-500'}`}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </span>
                            {timeLeft <= 0 && (
                                <span className="text-xs text-rose-500 ml-2">(Expired — log in again)</span>
                            )}
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-sm rounded-2xl px-4 py-3.5 border border-rose-100 animate-scale-in text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || timeLeft <= 0}
                            className="btn-ripple w-full py-4 bg-animated-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-200/40 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] animate-fade-in delay-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Verify & Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-5 animate-fade-in delay-7">
                        Check your server console for the OTP code during development.
                    </p>
                </div>
            </div>
        </div>
    );
}
