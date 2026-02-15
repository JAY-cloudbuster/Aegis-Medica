import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ====== DEMO MODE: No backend needed ======
const DEMO_MODE = true;

const MOCK_USERS = {
    admin: { _id: 'demo-admin', username: 'Dr. Admin', email: 'admin@aegis.med', role: 'admin', isVerified: true },
    doctor: { _id: 'demo-doctor', username: 'Dr. Williams', email: 'doc@aegis.med', role: 'doctor', isVerified: true },
    patient: { _id: 'demo-patient', username: 'Alex Johnson', email: 'alex@aegis.med', role: 'patient', isVerified: true },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('aegis_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (DEMO_MODE) {
            // In demo mode, restore session from localStorage
            const savedRole = localStorage.getItem('aegis_demo_role');
            if (savedRole && MOCK_USERS[savedRole]) {
                setUser(MOCK_USERS[savedRole]);
                setToken('demo-token');
            }
            setLoading(false);
            return;
        }
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                logout();
            }
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        if (DEMO_MODE) {
            localStorage.setItem('aegis_demo_role', userData.role);
        }
        localStorage.setItem('aegis_token', newToken || 'demo-token');
        setToken(newToken || 'demo-token');
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('aegis_token');
        localStorage.removeItem('aegis_demo_role');
        setToken(null);
        setUser(null);
    };

    const api = async (url, options = {}) => {
        if (DEMO_MODE) {
            // Return mock responses for demo mode
            return mockApi(url, options, user);
        }
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });
        return res;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, api, DEMO_MODE, MOCK_USERS }}>
            {children}
        </AuthContext.Provider>
    );
}

// ====== Mock API for demo mode ======
function mockApi(url, options, user) {
    const mockRecords = [
        {
            _id: 'rec-1', title: 'Annual Checkup Results', category: 'diagnosis',
            encryptedData: '***ENCRYPTED***', iv: 'mock-iv', digitalSignature: 'mock-sig',
            isEncrypted: true, createdAt: '2026-02-10T10:00:00Z',
            doctorId: { username: 'Dr. Williams' }, patientId: { _id: 'demo-patient', username: 'Alex Johnson' },
        },
        {
            _id: 'rec-2', title: 'Blood Work Panel', category: 'lab-result',
            encryptedData: '***ENCRYPTED***', iv: 'mock-iv-2', digitalSignature: 'mock-sig-2',
            isEncrypted: true, createdAt: '2026-02-12T14:30:00Z',
            doctorId: { username: 'Dr. Williams' }, patientId: { _id: 'demo-patient', username: 'Alex Johnson' },
        },
        {
            _id: 'rec-3', title: 'Prescription - Amoxicillin', category: 'prescription',
            encryptedData: '***ENCRYPTED***', iv: 'mock-iv-3', digitalSignature: 'mock-sig-3',
            isEncrypted: true, createdAt: '2026-02-14T09:15:00Z',
            doctorId: { username: 'Dr. Williams' }, patientId: { _id: 'demo-patient', username: 'Alex Johnson' },
        },
        {
            _id: 'rec-4', title: 'MRI Scan - Left Knee', category: 'imaging',
            encryptedData: '***ENCRYPTED***', iv: 'mock-iv-4', digitalSignature: 'mock-sig-4',
            isEncrypted: true, createdAt: '2026-02-15T11:00:00Z',
            doctorId: { username: 'Dr. Williams' }, patientId: { _id: 'demo-patient', username: 'Alex Johnson' },
        },
    ];

    const mockUsers = [
        { _id: '1', username: 'Dr. Williams', email: 'doc@aegis.med', role: 'doctor', isVerified: true, isLocked: false },
        { _id: '2', username: 'Alex Johnson', email: 'alex@aegis.med', role: 'patient', isVerified: true, isLocked: false },
        { _id: '3', username: 'Sarah Chen', email: 'sarah@aegis.med', role: 'patient', isVerified: true, isLocked: true },
        { _id: '4', username: 'Dr. Patel', email: 'patel@aegis.med', role: 'doctor', isVerified: true, isLocked: false },
        { _id: '5', username: 'Admin Kay', email: 'admin@aegis.med', role: 'admin', isVerified: true, isLocked: false },
        { _id: '6', username: 'New User', email: 'new@aegis.med', role: 'patient', isVerified: false, isLocked: false },
    ];

    const mockPatients = mockUsers.filter(u => u.role === 'patient');

    // Simulate network delay
    return new Promise(resolve => {
        setTimeout(() => {
            if (url === '/api/records') {
                resolve({ ok: true, json: async () => ({ records: mockRecords }) });
            } else if (url.startsWith('/api/records/') && url.endsWith('/decrypt')) {
                resolve({
                    ok: true,
                    json: async () => ({
                        data: {
                            content: 'Patient shows normal vitals. Blood pressure 120/80. Heart rate 72bpm. All lab values within normal range.',
                            createdBy: 'Dr. Williams',
                            timestamp: new Date().toISOString(),
                        },
                        signatureValid: true,
                    }),
                });
            } else if (url === '/api/patients') {
                resolve({ ok: true, json: async () => ({ patients: mockPatients }) });
            } else if (url === '/api/users') {
                resolve({ ok: true, json: async () => ({ users: mockUsers }) });
            } else if (url.includes('/unlock')) {
                resolve({ ok: true, json: async () => ({ message: 'User unlocked' }) });
            } else {
                resolve({ ok: true, json: async () => ({}) });
            }
        }, 300);
    });
}

export const useAuth = () => useContext(AuthContext);
