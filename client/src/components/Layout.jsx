import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck, LogOut, User, FileText, Users,
    LayoutDashboard, Menu, X, Lock, Activity,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const roleConfig = {
    admin: { color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    doctor: { color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
    patient: { color: 'from-sky-500 to-blue-600', bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
};

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const rc = roleConfig[user?.role] || roleConfig.patient;

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50/10 dot-grid">
            {/* Top Navbar */}
            <header className="glass sticky top-0 z-50 border-b border-white/20 animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Hamburger + Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-xl hover:bg-teal-50 active:scale-95"
                            >
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <Link to="/dashboard" className="flex items-center gap-3 group">
                                <div className={`w-10 h-10 bg-gradient-to-br ${rc.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                                    <ShieldCheck size={22} className="text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-lg font-extrabold text-slate-800">
                                        Aegis <span className="text-gradient">Medical</span>
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* Activity indicator */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                <Activity size={12} className="animate-pulse" />
                                Secured
                            </div>

                            {/* Role badge */}
                            <div className={`px-3 py-1.5 rounded-xl ${rc.bg} ${rc.text} text-xs font-bold flex items-center gap-1.5`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                                {user?.role?.toUpperCase()}
                            </div>

                            {/* User */}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-sky-100 flex items-center justify-center">
                                    <User size={14} className="text-teal-600" />
                                </div>
                                <span className="font-medium">{user?.username}</span>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95"
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
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 z-40
          glass border-r border-white/20
          transform transition-all duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
                    <nav className="p-5 space-y-1.5">
                        {filteredNav.map((item, i) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold
                    animate-slide-left group
                    ${active
                                            ? `bg-gradient-to-r ${rc.color} text-white shadow-lg`
                                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                                        }
                  `}
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    <Icon size={18} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
                                    {item.label}
                                    {active && <ChevronRight size={14} className="ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Security Info Card */}
                    <div className="absolute bottom-6 left-5 right-5">
                        <div className="bg-animated-gradient rounded-3xl p-5 text-white shadow-xl animate-fade-in delay-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Lock size={16} />
                                <span className="font-bold text-sm">Security Active</span>
                            </div>
                            <p className="text-xs text-white/70 leading-relaxed">
                                All data encrypted with AES-256-CBC. Records signed with RSA-SHA256 digital signatures.
                            </p>
                            <div className="flex gap-1 mt-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-1 flex-1 rounded-full bg-white/30">
                                        <div className="h-full rounded-full bg-white" style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
