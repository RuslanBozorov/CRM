import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    BookOpen,
    Loader2,
    Clock,
    DollarSign
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Card, Select } from '../../components/UI';

const courseSchema = z.object({
    name: z.string().min(1, "Kurs nomi kiritilishi shart"),
    description: z.string().optional(),
    price: z.string().min(1, "Narx kiritilishi shart"),
    duration_month: z.string().min(1, "Davomiyligi (oy) kiritilishi shart"),
    duration_hours: z.string().min(1, "Dars soati kiritilishi shart"),
    level: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED']),
});

type CourseForm = z.infer<typeof courseSchema>;

interface Course {
    id: number;
    name: string;
    description: string;
    price: number;
    duration_month: number;
    duration_hours: number;
    level: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            level: 'BEGINNER'
        }
    });

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses/all');
            setCourses(response.data);
        } catch (error: any) {
            toast.error("Kurslarni yuklashda xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const onSubmit = async (data: CourseForm) => {
        setIsSubmitting(true);
        try {
            // Backend expects numbers for several fields
            const payload = {
                ...data,
                price: Number(data.price),
                duration_month: Number(data.duration_month),
                duration_hours: Number(data.duration_hours)
            };
            await api.post('/courses', payload);
            toast.success("Kurs muvaffaqiyatli qo'shildi");
            setIsModalOpen(false);
            reset();
            fetchCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham ushbu kursni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/courses/delete/${id}`);
            toast.success("Kurs o'chirildi");
            fetchCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course =>
        course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kurslar</h1>
                    <p className="text-slate-500 mt-1 font-medium">Barcha o'quv dasturlari va kurslar</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={Plus}
                    className="shadow-primary-600/20"
                >
                    Kurs qo'shish
                </Button>
            </div>

            {/* Content Section */}
            <Card className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Kurs nomi bo'yicha qidirish..."
                            className="pl-11 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                            <p className="text-slate-500 font-medium animate-pulse">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <BookOpen size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Kurslar topilmadi</h3>
                            <p className="text-slate-500 mt-1">Qidiruv mezonlariga mos keladigan kurs mavjud emas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kurs nomi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Daraja</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Davomiyligi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Narxi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                                                    {course.name[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{course.name}</span>
                                                    <span className="text-xs text-slate-500 truncate max-w-[200px] block">{course.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {course.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm text-slate-600 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-slate-400" />
                                                    {course.duration_month} oy
                                                </div>
                                                <div className="text-xs text-slate-400 ml-5">
                                                    {course.duration_hours} soat jami
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {Number(course.price).toLocaleString()} so'm
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-primary-600 shadow-sm">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-red-600 shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Add Course Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                title="Yangi kurs qo'shish"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Kurs nomi"
                        placeholder="Masalan: Web Dasturlash"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Narxi (so'm)"
                            type="number"
                            placeholder="1200000"
                            icon={DollarSign}
                            {...register('price')}
                            error={errors.price?.message}
                        />
                        <Select
                            label="Daraja"
                            {...register('level')}
                            error={errors.level?.message}
                        >
                            <option value="BEGINNER">Beginner</option>
                            <option value="ELEMENTARY">Elementary</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Davomiyligi (oy)"
                            type="number"
                            placeholder="6"
                            {...register('duration_month')}
                            error={errors.duration_month?.message}
                        />
                        <Input
                            label="Dars soati (jami)"
                            type="number"
                            placeholder="72"
                            {...register('duration_hours')}
                            error={errors.duration_hours?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Tavsif</label>
                        <textarea
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 min-h-[100px]"
                            placeholder="Kurs haqida batafsil ma'lumot..."
                            {...register('description')}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
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
                            Saqlash
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
