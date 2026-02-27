import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Users, Calendar, Clock, BookOpen, MapPin, GraduationCap,
    Bell, ChevronRight, Loader2, TrendingUp, CheckCircle, XCircle,
    ClipboardList, Plus, X, FileText, ChevronDown, Send
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Group {
    id: number; name: string; description: string;
    start_date: string; start_time: string; week_day: string[];
    courses: { name: string };
    rooms: { name: string };
    _count: { studentGroups: number };
    studentGroups?: { students: { id: number; first_name: string; last_name: string } }[];
}
interface Lesson { id: number; group_id: number; created_at: string; }

const weekDayLabels: Record<string, string> = {
    MONDAY: 'Du', TUESDAY: 'Se', WEDNESDAY: 'Ch', THURSDAY: 'Pa', FRIDAY: 'Ju', SATURDAY: 'Sh', SUNDAY: 'Ya'
};

type Tab = 'groups' | 'attendance' | 'homework';

export default function TeacherDashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>('groups');
    const navigate = useNavigate();

    // Attendance state
    const [selectedGroupForAtt, setSelectedGroupForAtt] = useState<Group | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [students, setStudents] = useState<{ id: number; first_name: string; last_name: string }[]>([]);
    const [attendance, setAttendance] = useState<Record<number, boolean>>({});
    const [isSavingAtt, setIsSavingAtt] = useState(false);

    // Homework state
    const [selectedGroupForHw, setSelectedGroupForHw] = useState<Group | null>(null);
    const [hwLessons, setHwLessons] = useState<Lesson[]>([]);
    const [selectedHwLesson, setSelectedHwLesson] = useState<Lesson | null>(null);
    const [hwTitle, setHwTitle] = useState('');
    const [isSavingHw, setIsSavingHw] = useState(false);

    useEffect(() => {
        const me = localStorage.getItem('me');
        if (!me) { navigate('/login'); return; }
        const parsed = JSON.parse(me);
        if (parsed.role !== 'TEACHER') { navigate('/login'); return; }
        setUser(parsed);

        api.get('/teachers/my-groups')
            .then(res => {
                const raw = res.data?.data ?? res.data;
                setGroups(Array.isArray(raw) ? raw : []);
            })
            .catch(() => toast.error("Guruhlarni yuklashda xatolik"))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    const loadLessons = useCallback(async (groupId: number, setter: (l: Lesson[]) => void) => {
        try {
            const res = await api.get('/lessons/all');
            const allLessons: Lesson[] = res.data?.data ?? res.data ?? [];
            setter(allLessons.filter(l => l.group_id === groupId));
        } catch { toast.error("Darslarni yuklashda xatolik"); }
    }, []);

    const handleSelectGroupForAtt = async (group: Group) => {
        setSelectedGroupForAtt(group);
        setSelectedLesson(null);
        setAttendance({});
        await loadLessons(group.id, setLessons);
        // Load students via group detail
        try {
            const res = await api.get(`/groups/one/${group.id}`);
            const groupData = res.data?.data ?? res.data;
            const studs = (groupData?.studentGroups ?? []).map((sg: any) => sg.students).filter(Boolean);
            setStudents(studs);
            const initialAtt: Record<number, boolean> = {};
            studs.forEach((s: any) => { initialAtt[s.id] = true; });
            setAttendance(initialAtt);
        } catch { toast.error("O'quvchilarni yuklashda xatolik"); }
    };

    const handleSaveAttendance = async () => {
        if (!selectedLesson) { toast.error("Avval darsni tanlang"); return; }
        if (students.length === 0) { toast.error("Bu guruhda o'quvchilar topilmadi"); return; }
        setIsSavingAtt(true);
        try {
            const requests = students.map(s =>
                api.post('/attendance', {
                    lesson_id: selectedLesson.id,
                    student_id: s.id,
                    isPresent: attendance[s.id] ?? true,
                })
            );
            await Promise.all(requests);
            toast.success("Davomat muvaffaqiyatli saqlandi!");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Saqlashda xatolik");
        } finally {
            setIsSavingAtt(false);
        }
    };

    const handleSelectGroupForHw = async (group: Group) => {
        setSelectedGroupForHw(group);
        setSelectedHwLesson(null);
        setHwTitle('');
        await loadLessons(group.id, setHwLessons);
    };

    const handleSaveHomework = async () => {
        if (!selectedGroupForHw || !selectedHwLesson) { toast.error("Guruh va darsni tanlang"); return; }
        if (!hwTitle.trim()) { toast.error("Vazifa nomini kiriting"); return; }
        setIsSavingHw(true);
        try {
            await api.post('/homework', {
                lesson_id: selectedHwLesson.id,
                group_id: selectedGroupForHw.id,
                title: hwTitle,
            });
            toast.success("Vazifa muvaffaqiyatli qo'shildi!");
            setHwTitle('');
            setSelectedHwLesson(null);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSavingHw(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('me');
        navigate('/login');
    };

    const stats = [
        { label: "Faol guruhlar", value: groups.length, icon: BookOpen, color: "from-blue-500 to-blue-600" },
        { label: "Jami o'quvchilar", value: groups.reduce((a, g) => a + (g._count?.studentGroups ?? 0), 0), icon: GraduationCap, color: "from-purple-500 to-purple-600" },
        { label: "Dars kunlari/hafta", value: [...new Set(groups.flatMap(g => g.week_day))].length, icon: Calendar, color: "from-emerald-500 to-emerald-600" },
    ];

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'groups', label: 'Guruhlarim', icon: Users },
        { id: 'attendance', label: 'Davomat', icon: ClipboardList },
        { id: 'homework', label: 'Vazifa berish', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                            <BookOpen className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Antigravity CRM</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {user?.first_name?.[0] ?? 'T'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-purple-600 font-semibold">O'qituvchi</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="ml-2 flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold">
                            <LogOut size={16} /><span className="hidden sm:inline">Chiqish</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Welcome Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-purple-200 font-semibold mb-1">Xush kelibsiz! 👋</p>
                        <h1 className="text-3xl font-bold tracking-tight">{user?.first_name} {user?.last_name}</h1>
                        <p className="text-purple-200 mt-2">{groups.length} ta aktiv guruh • Davomat va vazifalar paneliga kirish uchun quyidagi tablardan foydalaning.</p>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <stat.icon className="text-white" size={22} />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                            {/* ── GROUPS TAB ── */}
                            {activeTab === 'groups' && (
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center py-16">
                                            <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">Hozircha guruhlar yo'q</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {groups.map((group, i) => (
                                                <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                                    className="bg-slate-50 hover:bg-purple-50 rounded-2xl p-5 border border-slate-100 hover:border-purple-200 transition-all group cursor-pointer">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center">
                                                            <Users size={20} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                                                            {group._count?.studentGroups ?? 0} o'q
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">{group.name}</h3>
                                                    <p className="text-sm text-purple-600 font-medium">{group.courses?.name}</p>
                                                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                                                        <div className="flex items-center gap-1.5"><Clock size={12} />{group.start_time} · {group.start_date}</div>
                                                        <div className="flex items-center gap-1.5"><MapPin size={12} />{group.rooms?.name}</div>
                                                    </div>
                                                    <div className="flex gap-1 mt-3">
                                                        {(group.week_day || []).map(d => (
                                                            <span key={d} className="px-2 py-0.5 bg-white text-purple-600 text-[10px] font-bold rounded border border-purple-100">{weekDayLabels[d] ?? d}</span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-6 flex gap-4">
                                        <button onClick={() => navigate('/students')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                            <GraduationCap size={16} />O'quvchilarni ko'rish<ChevronRight size={14} />
                                        </button>
                                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                            <TrendingUp size={16} />Statistika<ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── ATTENDANCE TAB ── */}
                            {activeTab === 'attendance' && (
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Guruhni tanlang</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groups.map(g => (
                                                <button key={g.id} onClick={() => handleSelectGroupForAtt(g)}
                                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedGroupForAtt?.id === g.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-slate-50 hover:border-purple-200'}`}>
                                                    <p className="font-bold text-slate-900 text-sm">{g.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{g.courses?.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedGroupForAtt && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">2. Darsni tanlang</label>
                                            {lessons.length === 0 ? (
                                                <p className="text-sm text-slate-400 italic">Bu guruh uchun darslar topilmadi.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                    {lessons.map(l => (
                                                        <button key={l.id} onClick={() => setSelectedLesson(l)}
                                                            className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${selectedLesson?.id === l.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 hover:border-purple-200 text-slate-600'}`}>
                                                            Dars #{l.id}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedGroupForAtt && students.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-bold text-slate-700">3. O'quvchilar davomati</label>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { const a: Record<number, boolean> = {}; students.forEach(s => a[s.id] = true); setAttendance(a); }}
                                                        className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        Barchasi keldi ✓
                                                    </button>
                                                    <button onClick={() => { const a: Record<number, boolean> = {}; students.forEach(s => a[s.id] = false); setAttendance(a); }}
                                                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        Barchasi kelmadi ✗
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {students.map(student => (
                                                    <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${attendance[student.id] ? 'border-emerald-200 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${attendance[student.id] ? 'bg-emerald-200 text-emerald-700' : 'bg-red-100 text-red-500'}`}>
                                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                                            </div>
                                                            <span className="font-semibold text-slate-900">{student.first_name} {student.last_name}</span>
                                                        </div>
                                                        <button onClick={() => setAttendance(prev => ({ ...prev, [student.id]: !prev[student.id] }))}
                                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all ${attendance[student.id] ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-red-400 text-white hover:bg-red-500'}`}>
                                                            {attendance[student.id] ? <><CheckCircle size={15} /> Keldi</> : <><XCircle size={15} /> Kelmadi</>}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button onClick={handleSaveAttendance} disabled={isSavingAtt || !selectedLesson}
                                                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20">
                                                {isSavingAtt ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={18} /> Davomatni saqlash</>}
                                            </button>
                                        </div>
                                    )}
                                    {selectedGroupForAtt && students.length === 0 && (
                                        <p className="text-sm text-slate-400 italic">Bu guruhda hali o'quvchilar yo'q.</p>
                                    )}
                                </div>
                            )}

                            {/* ── HOMEWORK TAB ── */}
                            {activeTab === 'homework' && (
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Guruhni tanlang</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groups.map(g => (
                                                <button key={g.id} onClick={() => handleSelectGroupForHw(g)}
                                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedGroupForHw?.id === g.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-slate-50 hover:border-purple-200'}`}>
                                                    <p className="font-bold text-slate-900 text-sm">{g.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{g.courses?.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedGroupForHw && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">2. Darsni tanlang</label>
                                            {hwLessons.length === 0 ? (
                                                <p className="text-sm text-slate-400 italic">Bu guruh uchun darslar topilmadi.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                    {hwLessons.map(l => (
                                                        <button key={l.id} onClick={() => setSelectedHwLesson(l)}
                                                            className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${selectedHwLesson?.id === l.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 hover:border-purple-200 text-slate-600'}`}>
                                                            Dars #{l.id}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedGroupForHw && selectedHwLesson && (
                                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                                            <h3 className="font-bold text-slate-900">3. Vazifa ma'lumotlari</h3>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vazifa nomi / Topshiriq</label>
                                                <textarea
                                                    value={hwTitle}
                                                    onChange={e => setHwTitle(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 resize-none transition-all"
                                                    placeholder="Masalan: 1-10 mashqlarni bajaring, 5-bob topshiriqlar..."
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 bg-white rounded-xl p-3 border border-slate-100">
                                                <ChevronDown size={14} />
                                                <span>Guruh: <strong className="text-slate-800">{selectedGroupForHw.name}</strong> | Dars: <strong className="text-slate-800">#{selectedHwLesson.id}</strong></span>
                                            </div>
                                            <button onClick={handleSaveHomework} disabled={isSavingHw || !hwTitle.trim()}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20">
                                                {isSavingHw ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus size={18} /> Vazifani yuborish</>}
                                            </button>
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
