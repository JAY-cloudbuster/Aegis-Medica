import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, KeyRound } from 'lucide-react';

export default function OTPVerify() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-600 rounded-2xl shadow-xl shadow-teal-200 mb-4">
                        <KeyRound size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Verify Your Identity</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Enter the 6-digit OTP sent to your email
                    </p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center gap-3">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 border border-rose-100 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-200 disabled:opacity-50 flex items-center justify-center gap-2"
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

                    <p className="text-center text-xs text-slate-400 mt-4">
                        OTP expires in 2 minutes. Check your server console for the code during development.
                    </p>
                </div>
            </div>
        </div>
    );
}
