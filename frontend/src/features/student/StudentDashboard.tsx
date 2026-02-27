import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, BookOpen, Clock, MapPin, Bell, ChevronRight,
    Loader2, GraduationCap, UserCircle, Award, ClipboardList,
    FileText, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Group {
    id: number; name: string; description: string;
    start_date: string; start_time: string; week_day: string[];
    courses: { id: number; name: string };
    teachers: { id: number; first_name: string; last_name: string };
    rooms: { id: number; name: string };
}

interface AttendanceRecord {
    id: number; isPresent: boolean; lesson_id: number; student_id: number;
    created_at: string;
}

interface HomeworkRecord {
    id: number; title: string; group_id: number; lesson_id: number; file?: string;
    created_at: string;
    groups?: { name: string };
}

const weekDayShort: Record<string, string> = {
    MONDAY: 'Du', TUESDAY: 'Se', WEDNESDAY: 'Ch',
    THURSDAY: 'Pa', FRIDAY: 'Ju', SATURDAY: 'Sh', SUNDAY: 'Ya',
};

const dayMap: Record<number, string> = {
    0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
    4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
};

type Tab = 'groups' | 'attendance' | 'homework';

export default function StudentDashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [homeworks, setHomeworks] = useState<HomeworkRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>('groups');
    const navigate = useNavigate();

    useEffect(() => {
        const me = localStorage.getItem('me');
        if (!me) { navigate('/login'); return; }
        const parsed = JSON.parse(me);
        if (parsed.role !== 'STUDENT') { navigate('/login'); return; }
        setUser(parsed);

        const fetchAll = async () => {
            try {
                const [groupsRes, attRes, hwRes] = await Promise.allSettled([
                    api.get('/students/my-groups'),
                    api.get('/attendance/all'),
                    api.get('/homework/all'),
                ]);

                if (groupsRes.status === 'fulfilled') {
                    const data = Array.isArray(groupsRes.value.data) ? groupsRes.value.data : (groupsRes.value.data?.data ?? []);
                    setGroups(data);
                }
                if (attRes.status === 'fulfilled') {
                    const attData = attRes.value.data?.data ?? attRes.value.data ?? [];
                    // Filter to only this student's records
                    setAttendance(Array.isArray(attData) ? attData.filter((a: AttendanceRecord) => a.student_id === parsed.id) : []);
                }
                if (hwRes.status === 'fulfilled') {
                    const hwData = hwRes.value.data?.data ?? hwRes.value.data ?? [];
                    // Filter homeworks related to the student's groups
                    setHomeworks(Array.isArray(hwData) ? hwData : []);
                }
            } catch {
                toast.error("Ma'lumotlarni yuklashda xatolik");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAll();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('me');
        navigate('/login');
    };

    const todaysGroups = groups.filter(g =>
        g.week_day.some(d => d === dayMap[new Date().getDay()])
    );

    const attendanceStats = {
        total: attendance.length,
        present: attendance.filter(a => a.isPresent).length,
        absent: attendance.filter(a => !a.isPresent).length,
        rate: attendance.length > 0
            ? Math.round((attendance.filter(a => a.isPresent).length / attendance.length) * 100)
            : 0,
    };

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'groups', label: 'Kurslarim', icon: BookOpen },
        { id: 'attendance', label: 'Davomatim', icon: ClipboardList },
        { id: 'homework', label: 'Vazifalar', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <GraduationCap className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Antigravity CRM</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Bell size={20} />
                            {homeworks.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            {user?.photo ? (
                                <img src={`http://localhost:3000/uploads/${user.photo}`} alt="profil"
                                    className="w-10 h-10 rounded-2xl object-cover shadow border-2 border-emerald-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {user?.first_name?.[0] ?? 'S'}
                                </div>
                            )}
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-emerald-600 font-semibold">O'quvchi</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="ml-1 flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold">
                            <LogOut size={16} /><span className="hidden sm:inline">Chiqish</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Welcome Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute right-24 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 font-semibold mb-1">Salom! 👋</p>
                            <h1 className="text-3xl font-bold tracking-tight">{user?.first_name} {user?.last_name}</h1>
                            <p className="text-emerald-100 mt-2 text-sm">
                                {groups.length} kurs · Davomat: {attendanceStats.rate}% ·{' '}
                                {todaysGroups.length > 0 ? `Bugun ${todaysGroups.length} ta dars` : 'Bugun dars yo\'q'}
                            </p>
                        </div>
                        <div className="hidden sm:flex w-20 h-20 bg-white/10 rounded-2xl items-center justify-center">
                            <Award size={40} className="text-white/80" />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Kurslar", value: groups.length, icon: BookOpen, color: "from-blue-500 to-blue-600" },
                        { label: "Davomat", value: `${attendanceStats.rate}%`, icon: ClipboardList, color: attendanceStats.rate >= 80 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600" },
                        { label: "Vazifalar", value: homeworks.length, icon: FileText, color: "from-purple-500 to-purple-600" },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow`}>
                                <stat.icon className="text-white" size={18} />
                            </div>
                            <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Today's Classes */}
                {todaysGroups.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">📅 Bugungi darslar</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {todaysGroups.map((group, i) => (
                                <motion.div key={group.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl border border-emerald-100 p-4 flex items-center gap-4 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                        <Clock size={14} className="text-emerald-500 mb-0.5" />
                                        <span className="text-xs font-bold text-slate-900">{group.start_time}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{group.courses?.name}</p>
                                        <p className="text-xs text-slate-500">{group.teachers?.first_name} {group.teachers?.last_name} · {group.rooms?.name}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                <tab.icon size={15} />
                                {tab.label}
                                {tab.id === 'homework' && homeworks.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-black rounded-full">{homeworks.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                            {/* ── GROUPS TAB ── */}
                            {activeTab === 'groups' && (
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center py-16">
                                            <GraduationCap size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">Hali kursga yozilmagansiz</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {groups.map((group, i) => (
                                                <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                                    className="bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-100 hover:border-emerald-200 p-5 transition-all">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-black text-xl flex-shrink-0">
                                                                {group.courses?.name?.[0] ?? 'K'}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900">{group.courses?.name}</h3>
                                                                <p className="text-sm text-slate-500">Guruh: {group.name}</p>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                                    <UserCircle size={12} className="text-slate-400" />
                                                                    {group.teachers?.first_name} {group.teachers?.last_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="sm:text-right space-y-1.5">
                                                            <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock size={12} className="text-slate-400" />{group.start_time}
                                                            </div>
                                                            <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-500">
                                                                <MapPin size={12} className="text-slate-400" />{group.rooms?.name}
                                                            </div>
                                                            <div className="flex flex-wrap sm:justify-end gap-1 mt-1">
                                                                {(group.week_day ?? []).map(d => (
                                                                    <span key={d} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">{weekDayShort[d] ?? d}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ATTENDANCE TAB ── */}
                            {activeTab === 'attendance' && (
                                <div className="p-6 space-y-6">
                                    {/* Rate indicator */}
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-slate-900">Umumiy davomat</span>
                                            <span className={`text-2xl font-black ${attendanceStats.rate >= 80 ? 'text-emerald-600' : attendanceStats.rate >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                                {attendanceStats.rate}%
                                            </span>
                                        </div>
                                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${attendanceStats.rate}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${attendanceStats.rate >= 80 ? 'bg-emerald-500' : attendanceStats.rate >= 60 ? 'bg-orange-400' : 'bg-red-400'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-3 text-sm">
                                            <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle size={14} />{attendanceStats.present} kelgan</span>
                                            <span className="text-red-500 font-semibold flex items-center gap-1"><XCircle size={14} />{attendanceStats.absent} kelmagan</span>
                                        </div>
                                        {attendanceStats.rate < 80 && attendanceStats.total > 0 && (
                                            <div className="mt-3 flex items-start gap-2 text-sm text-orange-600 bg-orange-50 rounded-xl p-3 border border-orange-100">
                                                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                                <span>Davomatingiz {attendanceStats.rate}% atrofida. Kursni muvaffaqiyatli yakunlash uchun 80% dan yuqori bo'lishi kerak!</span>
                                            </div>
                                        )}
                                    </div>

                                    {isLoading ? (
                                        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                                    ) : attendance.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <ClipboardList size={40} className="mx-auto mb-3" />
                                            <p className="font-medium">Hali davomat ma'lumotlari yo'q</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-slate-900 text-sm mb-3">Davomat tarixi</h3>
                                            {attendance.slice().reverse().map(rec => (
                                                <div key={rec.id} className={`flex items-center justify-between p-4 rounded-2xl border ${rec.isPresent ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {rec.isPresent ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-400" />}
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Dars #{rec.lesson_id}</p>
                                                            <p className="text-xs text-slate-500">{new Date(rec.created_at).toLocaleDateString('uz-UZ')}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${rec.isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                        {rec.isPresent ? 'Kelgan' : 'Kelmagan'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── HOMEWORK TAB ── */}
                            {activeTab === 'homework' && (
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                                    ) : homeworks.length === 0 ? (
                                        <div className="text-center py-16">
                                            <FileText size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">Hali vazifalar yo'q</p>
                                            <p className="text-slate-400 text-sm mt-1">O'qituvchi vazifa berganda bu yerda ko'rinadi</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {homeworks.map((hw, i) => (
                                                <motion.div key={hw.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                                    className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-2xl border border-purple-100 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                <FileText size={18} className="text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900">{hw.title}</h3>
                                                                <p className="text-xs text-slate-500 mt-1">Dars #{hw.lesson_id} · Guruh #{hw.group_id}</p>
                                                                <p className="text-xs text-slate-400 mt-0.5">{new Date(hw.created_at).toLocaleDateString('uz-UZ')}</p>
                                                            </div>
                                                        </div>
                                                        {hw.file && (
                                                            <a href={`http://localhost:3000/uploads/files/${hw.file}`} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors flex-shrink-0">
                                                                <ChevronRight size={12} />Fayl
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
