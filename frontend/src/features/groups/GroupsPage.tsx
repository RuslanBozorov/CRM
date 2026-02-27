import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    Loader2,
    Calendar,
    Clock,
    MapPin,
    GraduationCap
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Card, Select } from '../../components/UI';

const groupSchema = z.object({
    name: z.string().min(1, "Guruh nomi kiritilishi shart"),
    description: z.string().optional(),
    course_id: z.string().min(1, "Kursni tanlang"),
    teacher_id: z.string().min(1, "O'qituvchini tanlang"),
    room_id: z.string().min(1, "Xonani tanlang"),
    start_date: z.string().min(1, "Boshlanish sanasini tanlang"),
    start_time: z.string().min(1, "Dars vaqtini tanlang"),
    max_student: z.string().min(1, "Maksimal o'quvchi sonini kiriting"),
    week_day: z.array(z.string()).min(1, "Kamida bitta kunni tanlang"),
});

type GroupForm = z.infer<typeof groupSchema>;

interface Group {
    id: number;
    name: string;
    description: string;
    max_student: number;
    start_date: string;
    start_time: string;
    week_day: string[];
    courses: { id: number; name: string };
    teachers: { id: number; first_name: string };
    rooms: { id: number; name: string };
    status: 'active' | 'inactive';
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [courses, setCourses] = useState<{ id: number, name: string }[]>([]);
    const [teachers, setTeachers] = useState<{ id: number, first_name: string, last_name: string }[]>([]);
    const [rooms, setRooms] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GroupForm>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            week_day: []
        }
    });

    const selectedDays = watch('week_day');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [groupsRes, coursesRes, teachersRes, roomsRes] = await Promise.all([
                api.get('/groups/all'),
                api.get('/courses/all'),
                api.get('/teachers/all'),
                api.get('/rooms/all')
            ]);
            setGroups(groupsRes.data);
            setCourses(coursesRes.data);
            setTeachers(teachersRes.data);
            setRooms(roomsRes.data);
        } catch (error: any) {
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: GroupForm) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                course_id: Number(data.course_id),
                teacher_id: Number(data.teacher_id),
                room_id: Number(data.room_id),
                max_student: Number(data.max_student)
            };
            await api.post('/groups', payload);
            toast.success("Guruh muvaffaqiyatli yaratildi");
            setIsModalOpen(false);
            reset();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDay = (day: string) => {
        const current = [...selectedDays];
        const index = current.indexOf(day);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(day);
        }
        setValue('week_day', current, { shouldValidate: true });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham ushbu guruhni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/groups/delete/${id}`);
            toast.success("Guruh o'chirildi");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const filteredGroups = (Array.isArray(groups) ? groups : []).filter(group =>
        group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group?.courses?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const weekDays = [
        { id: 'MONDAY', label: 'Du' },
        { id: 'TUESDAY', label: 'Se' },
        { id: 'WEDNESDAY', label: 'Ch' },
        { id: 'THURSDAY', label: 'Pa' },
        { id: 'FRIDAY', label: 'Ju' },
        { id: 'SATURDAY', label: 'Sh' },
        { id: 'SUNDAY', label: 'Ya' },
    ];

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Guruhlar</h1>
                    <p className="text-slate-500 mt-1 font-medium">Faol va yangi o'quv guruhlari</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={Plus}
                    className="shadow-primary-600/20"
                >
                    Guruh yaratish
                </Button>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
                <Card className="p-4 border-slate-200/60 shadow-lg shadow-slate-200/40">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Guruh yoki kurs nomi bo'yicha..."
                            className="pl-11 bg-slate-50/50 border-transparent focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Card>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-slate-500 font-medium">Guruhlar ro'yxati yuklanmoqda...</p>
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Users size={40} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">Guruhlar topilmadi</h3>
                        <p className="text-slate-500 mt-1">Hozircha hech qanday guruh yaratilmagan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGroups.map((group) => (
                            <Card key={group.id} className="group hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 border-slate-100 flex flex-col p-0 overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                            <Users size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id)}
                                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{group.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                            <GraduationCap size={14} className="text-slate-400" />
                                            {group.courses?.name}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{group.start_date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Clock size={14} className="text-slate-400" />
                                            <span>{group.start_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span>{group.rooms?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Users size={14} className="text-slate-400" />
                                            <span>Max {group.max_student}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                                        {group.week_day.map(day => (
                                            <span key={day} className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-md">
                                                {weekDays.find(d => d.id === day)?.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-primary-600">
                                            {group.teachers?.first_name?.[0] || 'T'}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{group.teachers?.first_name}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary-600 font-bold hover:bg-white text-xs">
                                        Batafsil
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                title="Yangi guruh yaratish"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Guruh nomi"
                        placeholder="Masalan: Frontend #12"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Kurs"
                            {...register('course_id')}
                            error={errors.course_id?.message}
                        >
                            <option value="">Kursni tanlang</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <Select
                            label="O'qituvchi"
                            {...register('teacher_id')}
                            error={errors.teacher_id?.message}
                        >
                            <option value="">O'qituvchini tanlang</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Dars xonasi"
                            {...register('room_id')}
                            error={errors.room_id?.message}
                        >
                            <option value="">Xonani tanlang</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </Select>
                        <Input
                            label="Boshlanish sanasi"
                            type="date"
                            {...register('start_date')}
                            error={errors.start_date?.message}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Dars vaqti"
                            type="time"
                            {...register('start_time')}
                            error={errors.start_time?.message}
                        />
                        <Input
                            label="O'quvchilar soni (max)"
                            type="number"
                            placeholder="12"
                            {...register('max_student')}
                            error={errors.max_student?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Hafta kunlari</label>
                        <div className="flex flex-wrap gap-2">
                            {weekDays.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleDay(day.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedDays.includes(day.id)
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary-500 hover:text-primary-600'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                        {errors.week_day && <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.week_day.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isSubmitting}
                        >
                            Yaratish
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
