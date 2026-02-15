import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Leaf, LogOut, User, FileText, Users,
    LayoutDashboard, Menu, X, Lock, Heart,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const roleConfig = {
    admin: { color: 'from-amber-600 to-amber-700', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600' },
    doctor: { color: 'from-[#617050] to-[#7a8b66]', bg: 'bg-[#e8ebe3]', text: 'text-[#4d5940]', dot: 'bg-[#617050]' },
    patient: { color: 'from-[#94a37e] to-[#b3bea3]', bg: 'bg-[#f0ece4]', text: 'text-[#5a564e]', dot: 'bg-[#94a37e]' },
};

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const rc = roleConfig[user?.role] || roleConfig.patient;

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
        { label: 'Medical Records', to: '/records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
        { label: 'Manage Users', to: '/admin/users', icon: Users, roles: ['admin'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#faf8f4] via-[#f5f0e8] to-[#f0ece4] grain">
            {/* Navbar */}
            <header className="glass sticky top-0 z-50 border-b border-[#e0d8cc]/40 animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-[#f0ece4] active:scale-95">
                                {sidebarOpen ? <X size={20} className="text-[#5a564e]" /> : <Menu size={20} className="text-[#5a564e]" />}
                            </button>
                            <Link to="/dashboard" className="flex items-center gap-3 group">
                                <div className={`w-10 h-10 bg-gradient-to-br ${rc.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform`}>
                                    <Leaf size={20} className="text-white" />
                                </div>
                                <span className="text-lg font-extrabold text-[#3d3a35] hidden sm:block">
                                    Aegis <span className="text-gradient">Medical</span>
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e8ebe3]/60 text-[#617050] text-xs font-semibold">
                                <Heart size={12} className="animate-breathe" />
                                Active
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl ${rc.bg} ${rc.text} text-xs font-bold flex items-center gap-1.5`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-[#5a564e] px-3 py-1.5 rounded-xl hover:bg-[#f0ece4]">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8ebe3] to-[#d1d7c7] flex items-center justify-center">
                                    <User size={14} className="text-[#617050]" />
                                </div>
                                <span className="font-medium">{user?.username}</span>
                            </div>
                            <button onClick={handleLogout} className="p-2.5 rounded-xl text-[#a09888] hover:text-[#d46a6a] hover:bg-red-50 active:scale-95" title="Logout">
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
          glass border-r border-[#e0d8cc]/30
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
                                            ? `bg-gradient-to-r ${rc.color} text-white shadow-md`
                                            : 'text-[#8a8478] hover:bg-[#f5f0e8] hover:text-[#5a564e]'
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

                    {/* Bottom Card */}
                    <div className="absolute bottom-6 left-5 right-5">
                        <div className="bg-gradient-to-br from-[#617050] to-[#4d5940] rounded-2xl p-5 text-white shadow-lg animate-fade-in delay-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock size={14} />
                                <span className="font-bold text-sm">Data Protected</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Your health data is encrypted with care using AES-256 & RSA signatures.
                            </p>
                            <div className="flex gap-1 mt-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-1 flex-1 rounded-full bg-white/20">
                                        <div className="h-full rounded-full bg-white/60" style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 bg-[#3d3a35]/10 backdrop-blur-sm z-30 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-6xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
