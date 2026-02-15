import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FileText, Plus, Lock, Unlock, CheckCircle, XCircle,
    Stethoscope, ClipboardList, FlaskConical, ScanLine, StickyNote
} from 'lucide-react';

const categoryIcons = {
    diagnosis: Stethoscope,
    prescription: ClipboardList,
    'lab-result': FlaskConical,
    imaging: ScanLine,
    notes: StickyNote,
};

const categoryColors = {
    diagnosis: 'bg-rose-50 text-rose-600',
    prescription: 'bg-sky-50 text-sky-600',
    'lab-result': 'bg-amber-50 text-amber-600',
    imaging: 'bg-purple-50 text-purple-600',
    notes: 'bg-slate-50 text-slate-600',
};

export default function Records() {
    const { user, api } = useAuth();
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [decryptedData, setDecryptedData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        patientId: '',
        title: '',
        data: '',
        category: 'notes',
    });

    useEffect(() => {
        fetchRecords();
        if (['doctor', 'admin'].includes(user?.role)) {
            fetchPatients();
        }
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api('/api/records');
            const data = await res.json();
            setRecords(data.records || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await api('/api/patients');
            const data = await res.json();
            setPatients(data.patients || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api('/api/records', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    data: { content: form.data, createdBy: user.username },
                }),
            });

            if (res.ok) {
                setShowForm(false);
                setForm({ patientId: '', title: '', data: '', category: 'notes' });
                fetchRecords();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecrypt = async (recordId) => {
        if (decryptedData[recordId]) {
            // Toggle off
            setDecryptedData(prev => {
                const copy = { ...prev };
                delete copy[recordId];
                return copy;
            });
            return;
        }

        try {
            const res = await api(`/api/records/${recordId}/decrypt`, { method: 'POST' });
            const data = await res.json();
            setDecryptedData(prev => ({
                ...prev,
                [recordId]: data,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
                    <p className="text-sm text-slate-500">All records are AES-256 encrypted with RSA digital signatures</p>
                </div>
                {['doctor', 'admin'].includes(user?.role) && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-200"
                    >
                        <Plus size={18} />
                        New Record
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="glass rounded-2xl p-6 animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4">Create Encrypted Record</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                                <select
                                    value={form.patientId}
                                    onChange={e => setForm({ ...form, patientId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 outline-none text-sm"
                                    required
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.username} ({p.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 outline-none text-sm"
                                >
                                    <option value="diagnosis">Diagnosis</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="lab-result">Lab Result</option>
                                    <option value="imaging">Imaging</option>
                                    <option value="notes">Notes</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 outline-none text-sm"
                                placeholder="e.g., Annual Checkup Results"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Medical Data</label>
                            <textarea
                                value={form.data}
                                onChange={e => setForm({ ...form, data: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-teal-400 outline-none text-sm min-h-[100px] resize-none"
                                placeholder="Enter medical data (will be AES-256 encrypted)..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-200"
                            >
                                Encrypt & Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200"
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
                    <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                </div>
            ) : records.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No medical records found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {user?.role === 'patient' ? 'Your doctor will add records here.' : 'Create a new encrypted record above.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map(record => {
                        const CatIcon = categoryIcons[record.category] || StickyNote;
                        const catColor = categoryColors[record.category] || categoryColors.notes;
                        const isDecrypted = decryptedData[record._id];

                        return (
                            <div key={record._id} className="glass rounded-2xl p-5 hover:shadow-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catColor}`}>
                                            <CatIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{record.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                <span>Dr. {record.doctorId?.username || 'Unknown'}</span>
                                                <span>•</span>
                                                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="capitalize">{record.category}</span>
                                            </div>
                                            {record.patientId?.username && (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Patient: {record.patientId.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isDecrypted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {isDecrypted ? <Unlock size={12} /> : <Lock size={12} />}
                                            {isDecrypted ? 'Decrypted' : 'Encrypted'}
                                        </span>
                                        <button
                                            onClick={() => handleDecrypt(record._id)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100"
                                        >
                                            {isDecrypted ? 'Hide' : 'Decrypt'}
                                        </button>
                                    </div>
                                </div>

                                {/* Decrypted Data */}
                                {isDecrypted && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in">
                                        <div className="flex items-center gap-2 mb-2">
                                            {isDecrypted.signatureValid ? (
                                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <CheckCircle size={14} /> Signature Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                                                    <XCircle size={14} /> Invalid Signature
                                                </span>
                                            )}
                                        </div>
                                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
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
