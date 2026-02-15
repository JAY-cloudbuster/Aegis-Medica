import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck, LogOut, User, FileText, Users,
    LayoutDashboard, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-teal-100 text-teal-700',
    patient: 'bg-sky-100 text-sky-700',
};

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
        { label: 'Medical Records', to: '/records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
        { label: 'Manage Users', to: '/admin/users', icon: Users, roles: ['admin'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-sky-50/20">
            {/* Top Navbar */}
            <header className="glass sticky top-0 z-50 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-teal-50"
                            >
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <ShieldCheck size={20} className="text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-800 hidden sm:inline">
                                    Aegis <span className="text-teal-600">Medical</span>
                                </span>
                            </Link>
                        </div>

                        {/* User Badge */}
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user?.role] || ''}`}>
                                {user?.role?.toUpperCase()}
                            </span>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <User size={16} />
                                <span>{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40
          glass border-r border-white/20
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
                    <nav className="p-4 space-y-1">
                        {filteredNav.map(item => {
                            const Icon = item.icon;
                            const active = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${active
                                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                            : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                                        }
                  `}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Security Badge */}
                    <div className="absolute bottom-6 left-4 right-4">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white text-xs">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={16} />
                                <span className="font-semibold">AES-256 Protected</span>
                            </div>
                            <p className="opacity-80">All patient data is encrypted end-to-end with digital signatures.</p>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-6xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
