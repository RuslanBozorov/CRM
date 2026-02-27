import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Users,
    GraduationCap,
    BookOpen,
    LayoutDashboard,
    DoorOpen,
    Calendar,
    UserSquare2,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    BookMarked,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { icon: LayoutDashboard, label: 'Boshqaruv', path: '/dashboard', roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
    { icon: Users, label: 'Xodimlar', path: '/staffs', roles: ['SUPERADMIN'] },
    { icon: UserSquare2, label: 'O\'qituvchilar', path: '/teachers', roles: ['SUPERADMIN', 'ADMIN'] },
    { icon: GraduationCap, label: 'O\'quvchilar', path: '/students', roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'] },
    { icon: BookOpen, label: 'Kurslar', path: '/courses', roles: ['SUPERADMIN', 'ADMIN'] },
    { icon: Calendar, label: 'Guruhlar', path: '/groups', roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
    { icon: DoorOpen, label: 'Xonalar', path: '/rooms', roles: ['SUPERADMIN', 'ADMIN'] },
    { icon: BookMarked, label: 'Darslar', path: '/lessons', roles: ['TEACHER', 'STUDENT'] },
];

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const me = localStorage.getItem('me');
        if (me) {
            setUser(JSON.parse(me));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('me');
        navigate('/login');
    };

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes(user?.role || '')
    );

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'SUPERADMIN': return 'Bosh Admin';
            case 'ADMIN': return 'Admin';
            case 'TEACHER': return 'O\'qituvchi';
            case 'STUDENT': return 'O\'quvchi';
            default: return 'Foydalanuvchi';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col relative sticky top-0 h-screen z-50`}
            >
                <div className="p-6 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-600/20">
                            <LayoutDashboard className="text-white w-6 h-6" />
                        </div>
                        {isSidebarOpen && (
                            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
                                Antigravity CRM
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all group relative ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-semibold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1.5 h-8 bg-primary-600 rounded-r-full"
                                    />
                                )}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    <Link
                        to="/settings"
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900 group`}
                    >
                        <Settings className="w-6 h-6 transition-transform group-hover:rotate-45" />
                        {isSidebarOpen && <span>Sozlamalar</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all text-red-500 hover:bg-red-50 group font-medium"
                    >
                        <LogOut className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                        {isSidebarOpen && <span>Chiqish</span>}
                    </button>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-4 top-20 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm z-50 lg:flex hidden"
                >
                    {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center flex-1 max-w-xl">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Qidiruv..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-10 w-px bg-slate-200 mx-2" />
                        <div className="flex items-center space-x-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-tight">
                                    {user?.first_name || 'Foydalanuvchi'} {user?.last_name || ''}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                    {getRoleLabel(user?.role)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white shadow-lg shadow-primary-200 flex items-center justify-center text-white font-bold text-lg overflow-hidden transition-transform group-hover:scale-105">
                                {user?.first_name ? user.first_name[0] : <UserCircle />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
