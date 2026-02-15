import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FileText, Plus, Lock, Unlock, CheckCircle, XCircle, X,
    Stethoscope, ClipboardList, FlaskConical, ScanLine, StickyNote,
    Leaf, Heart
} from 'lucide-react';

const categoryConfig = {
    diagnosis: { icon: Stethoscope, color: 'from-[#c47a6a] to-[#d49080]', bg: 'bg-red-50 text-[#c47a6a]' },
    prescription: { icon: ClipboardList, color: 'from-[#617050] to-[#7a8b66]', bg: 'bg-[#e8ebe3] text-[#617050]' },
    'lab-result': { icon: FlaskConical, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 text-amber-700' },
    imaging: { icon: ScanLine, color: 'from-[#94a37e] to-[#b3bea3]', bg: 'bg-[#f0ece4] text-[#617050]' },
    notes: { icon: StickyNote, color: 'from-[#8a8478] to-[#a09888]', bg: 'bg-[#f5f0e8] text-[#5a564e]' },
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
        try { const res = await api('/api/records'); const data = await res.json(); setRecords(data.records || []); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPatients = async () => {
        try { const res = await api('/api/patients'); const data = await res.json(); setPatients(data.patients || []); }
        catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api('/api/records', { method: 'POST', body: JSON.stringify({ ...form, data: { content: form.data, createdBy: user.username } }) });
            if (res.ok) { setShowForm(false); setForm({ patientId: '', title: '', data: '', category: 'notes' }); fetchRecords(); }
        } catch (err) { console.error(err); }
    };

    const handleDecrypt = async (recordId) => {
        if (decryptedData[recordId]) { setDecryptedData(prev => { const c = { ...prev }; delete c[recordId]; return c; }); return; }
        setDecrypting(prev => ({ ...prev, [recordId]: true }));
        try {
            const res = await api(`/api/records/${recordId}/decrypt`, { method: 'POST' });
            const data = await res.json();
            setTimeout(() => { setDecryptedData(prev => ({ ...prev, [recordId]: data })); setDecrypting(prev => ({ ...prev, [recordId]: false })); }, 600);
        } catch (err) { console.error(err); setDecrypting(prev => ({ ...prev, [recordId]: false })); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#3d3a35] flex items-center gap-2">
                        <Heart size={22} className="text-[#c47a6a]" />
                        Medical Records
                    </h1>
                    <p className="text-sm text-[#8a8478] mt-1">Protected with AES-256 encryption & digital signatures</p>
                </div>
                {['doctor', 'admin'].includes(user?.role) && (
                    <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.97]">
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Close' : 'New Record'}
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="glass rounded-[1.25rem] p-8 animate-fade-in-up shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Leaf size={16} className="text-[#94a37e]" />
                        <h3 className="font-bold text-[#3d3a35]">Create Encrypted Record</h3>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="animate-fade-in delay-1">
                                <label className="block text-sm font-semibold text-[#5a564e] mb-2">Patient</label>
                                <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium" required>
                                    <option value="">Select patient...</option>
                                    {patients.map(p => <option key={p._id} value={p._id}>{p.username} ({p.email})</option>)}
                                </select>
                            </div>
                            <div className="animate-fade-in delay-2">
                                <label className="block text-sm font-semibold text-[#5a564e] mb-2">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(categoryConfig).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <button key={key} type="button" onClick={() => setForm({ ...form, category: key })}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold capitalize ${form.category === key ? `bg-gradient-to-r ${cfg.color} text-white shadow-md scale-105` : `${cfg.bg} hover:scale-105`}`}>
                                                <Icon size={14} />{key}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="animate-fade-in delay-3">
                            <label className="block text-sm font-semibold text-[#5a564e] mb-2">Title</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium" placeholder="e.g., Annual Checkup Results" required />
                        </div>
                        <div className="animate-fade-in delay-4">
                            <label className="block text-sm font-semibold text-[#5a564e] mb-2">Medical Data</label>
                            <textarea value={form.data} onChange={e => setForm({ ...form, data: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#e0d8cc] bg-white/60 input-glow outline-none text-sm font-medium min-h-[120px] resize-none" placeholder="Enter medical data (will be encrypted)..." required />
                        </div>
                        <div className="flex gap-3 animate-fade-in delay-5">
                            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                                <Lock size={14} /> Encrypt & Save
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-[#f0ece4] text-[#5a564e] rounded-2xl text-sm font-bold hover:bg-[#e8e4dc] active:scale-[0.98]">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Record List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-[#d1d7c7] border-t-[#617050] rounded-full animate-spin" />
                </div>
            ) : records.length === 0 ? (
                <div className="glass rounded-[1.25rem] p-16 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-[#f0ece4] rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <FileText size={32} className="text-[#d1cdc4]" />
                    </div>
                    <p className="text-[#5a564e] font-bold text-lg">No Records Yet</p>
                    <p className="text-sm text-[#a09888] mt-2">{user?.role === 'patient' ? 'Your doctor will add records here.' : 'Create a new record to get started.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record, i) => {
                        const cat = categoryConfig[record.category] || categoryConfig.notes;
                        const CatIcon = cat.icon;
                        const isDecrypted = decryptedData[record._id];
                        const isDecrypting = decrypting[record._id];

                        return (
                            <div key={record._id} className="glass rounded-[1.25rem] p-6 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center shadow-md`}>
                                            <CatIcon size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#3d3a35] text-lg">{record.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-[#a09888]">
                                                <span>Dr. {record.doctorId?.username || 'Unknown'}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#d1cdc4]" />
                                                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                <span className={`capitalize px-2 py-0.5 rounded-md ${cat.bg} text-[10px] font-bold`}>{record.category}</span>
                                            </div>
                                            {record.patientId?.username && <p className="text-xs text-[#b3aa9a] mt-1">Patient: {record.patientId.username}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isDecrypted ? 'bg-[#e8ebe3] text-[#617050]' : 'bg-amber-50 text-amber-700'}`}>
                                            {isDecrypted ? <Unlock size={12} /> : <Lock size={12} />} {isDecrypted ? 'Open' : 'Locked'}
                                        </span>
                                        <button onClick={() => handleDecrypt(record._id)} disabled={isDecrypting}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold active:scale-95 ${isDecrypted ? 'bg-[#f0ece4] text-[#5a564e] hover:bg-[#e8e4dc]' : 'bg-gradient-to-r from-[#617050] to-[#7a8b66] text-white shadow-md hover:shadow-lg'}`}>
                                            {isDecrypting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isDecrypted ? 'Lock' : 'Decrypt'}
                                        </button>
                                    </div>
                                </div>

                                {isDecrypting && (
                                    <div className="mt-4 p-4 bg-[#3d3a35] rounded-xl animate-fade-in">
                                        <div className="font-mono text-xs text-[#b3bea3] animate-pulse">Decrypting AES-256-CBC... Verifying RSA signature...</div>
                                    </div>
                                )}

                                {isDecrypted && (
                                    <div className="mt-4 p-5 bg-[#faf8f4] rounded-xl border border-[#e8e4dc] animate-fade-in-up">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#e8e4dc]">
                                            {isDecrypted.signatureValid ? (
                                                <span className="flex items-center gap-1.5 text-xs text-[#617050] font-bold bg-[#e8ebe3] px-3 py-1.5 rounded-xl">
                                                    <CheckCircle size={14} /> Signature Verified ✓
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-[#d46a6a] font-bold bg-red-50 px-3 py-1.5 rounded-xl">
                                                    <XCircle size={14} /> Signature Invalid ✗
                                                </span>
                                            )}
                                            <span className="text-[10px] text-[#b3aa9a] font-mono">AES-256 • RSA-SHA256</span>
                                        </div>
                                        <pre className="text-sm text-[#5a564e] whitespace-pre-wrap font-mono bg-white p-4 rounded-xl border border-[#e8e4dc]">
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
