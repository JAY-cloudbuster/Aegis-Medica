import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FileText, Plus, Lock, Unlock, CheckCircle, XCircle, X,
    Stethoscope, ClipboardList, FlaskConical, ScanLine, StickyNote,
    Sparkles, Shield
} from 'lucide-react';

const categoryConfig = {
    diagnosis: { icon: Stethoscope, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 text-rose-600' },
    prescription: { icon: ClipboardList, color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50 text-sky-600' },
    'lab-result': { icon: FlaskConical, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 text-amber-600' },
    imaging: { icon: ScanLine, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50 text-purple-600' },
    notes: { icon: StickyNote, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100 text-slate-600' },
};

export default function Records() {
    const { user, api } = useAuth();
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [decryptedData, setDecryptedData] = useState({});
    const [decrypting, setDecrypting] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ patientId: '', title: '', data: '', category: 'notes' });

    useEffect(() => {
        fetchRecords();
        if (['doctor', 'admin'].includes(user?.role)) fetchPatients();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api('/api/records');
            const data = await res.json();
            setRecords(data.records || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPatients = async () => {
        try {
            const res = await api('/api/patients');
            const data = await res.json();
            setPatients(data.patients || []);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api('/api/records', {
                method: 'POST',
                body: JSON.stringify({ ...form, data: { content: form.data, createdBy: user.username } }),
            });
            if (res.ok) {
                setShowForm(false);
                setForm({ patientId: '', title: '', data: '', category: 'notes' });
                fetchRecords();
            }
        } catch (err) { console.error(err); }
    };

    const handleDecrypt = async (recordId) => {
        if (decryptedData[recordId]) {
            setDecryptedData(prev => { const c = { ...prev }; delete c[recordId]; return c; });
            return;
        }
        setDecrypting(prev => ({ ...prev, [recordId]: true }));
        try {
            const res = await api(`/api/records/${recordId}/decrypt`, { method: 'POST' });
            const data = await res.json();
            // Brief delay for visual effect
            setTimeout(() => {
                setDecryptedData(prev => ({ ...prev, [recordId]: data }));
                setDecrypting(prev => ({ ...prev, [recordId]: false }));
            }, 600);
        } catch (err) {
            console.error(err);
            setDecrypting(prev => ({ ...prev, [recordId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Shield size={24} className="text-teal-600" />
                        Medical Records
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">All records are AES-256 encrypted with RSA digital signatures</p>
                </div>
                {['doctor', 'admin'].includes(user?.role) && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-3 bg-animated-gradient text-white rounded-2xl text-sm font-bold shadow-xl shadow-teal-200/30 hover:scale-[1.03] active:scale-[0.97]"
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Close' : 'New Record'}
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="glass rounded-3xl p-8 animate-fade-in-up shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={18} className="text-teal-600" />
                        <h3 className="font-bold text-slate-800">Create Encrypted Record</h3>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="animate-fade-in delay-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Patient</label>
                                <select
                                    value={form.patientId}
                                    onChange={e => setForm({ ...form, patientId: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium"
                                    required
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.username} ({p.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="animate-fade-in delay-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(categoryConfig).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setForm({ ...form, category: key })}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${form.category === key
                                                        ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg scale-105`
                                                        : `${cfg.bg} hover:scale-105`
                                                    }`}
                                            >
                                                <Icon size={14} />
                                                {key}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="animate-fade-in delay-3">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium"
                                placeholder="e.g., Annual Checkup Results"
                                required
                            />
                        </div>
                        <div className="animate-fade-in delay-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Medical Data</label>
                            <textarea
                                value={form.data}
                                onChange={e => setForm({ ...form, data: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/60 input-glow outline-none text-sm font-medium min-h-[120px] resize-none"
                                placeholder="Enter medical data (will be AES-256 encrypted)..."
                                required
                            />
                        </div>
                        <div className="flex gap-3 animate-fade-in delay-5">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-teal-200/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                            >
                                <Lock size={16} />
                                Encrypt & Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Records List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                </div>
            ) : records.length === 0 ? (
                <div className="glass rounded-3xl p-16 text-center animate-fade-in-up shadow-lg">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                        <FileText size={36} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">No Medical Records</p>
                    <p className="text-sm text-slate-400 mt-2">
                        {user?.role === 'patient' ? 'Your doctor will add encrypted records here.' : 'Create a new encrypted record to get started.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record, i) => {
                        const cat = categoryConfig[record.category] || categoryConfig.notes;
                        const CatIcon = cat.icon;
                        const isDecrypted = decryptedData[record._id];
                        const isDecrypting = decrypting[record._id];

                        return (
                            <div
                                key={record._id}
                                className="glass rounded-3xl p-6 hover-lift animate-fade-in-up"
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <CatIcon size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{record.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                <span>Dr. {record.doctorId?.username || 'Unknown'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className={`capitalize px-2 py-0.5 rounded-md ${cat.bg} text-[10px] font-bold`}>{record.category}</span>
                                            </div>
                                            {record.patientId?.username && (
                                                <p className="text-xs text-slate-400 mt-1">Patient: {record.patientId.username}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isDecrypted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {isDecrypted ? <Unlock size={12} /> : <Lock size={12} />}
                                            {isDecrypted ? 'Open' : 'Locked'}
                                        </span>
                                        <button
                                            onClick={() => handleDecrypt(record._id)}
                                            disabled={isDecrypting}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDecrypted
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200/30 hover:shadow-xl'
                                                }`}
                                        >
                                            {isDecrypting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                isDecrypted ? 'Lock' : 'Decrypt'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Decryption animation + data */}
                                {isDecrypting && (
                                    <div className="mt-4 p-4 bg-slate-900 rounded-2xl animate-fade-in overflow-hidden">
                                        <div className="font-mono text-xs text-emerald-400 animate-pulse">
                                            Decrypting AES-256-CBC... Verifying RSA-SHA256 signature...
                                        </div>
                                    </div>
                                )}

                                {isDecrypted && (
                                    <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in-up">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                                            {isDecrypted.signatureValid ? (
                                                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl">
                                                    <CheckCircle size={14} /> Signature Verified ✓
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl">
                                                    <XCircle size={14} /> Signature Invalid ✗
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-mono">AES-256-CBC • RSA-SHA256</span>
                                        </div>
                                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-xl border border-slate-100">
                                            {JSON.stringify(isDecrypted.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
