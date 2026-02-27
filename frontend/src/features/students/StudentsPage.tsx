import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, Phone, MapPin, Loader2, Trash2, Edit2, User, Lock, Calendar, Upload } from 'lucide-react';
import { Button, Input, Modal } from '../../components/UI';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const studentSchema = z.object({
    first_name: z.string().min(2, "Ism juda qisqa"),
    last_name: z.string().min(2, "Familiya juda qisqa"),
    phone: z.string().min(9, "Telefon raqam noto'g'ri"),
    email: z.string().email("Email noto'g'ri"),
    address: z.string().min(5, "Manzil juda qisqa"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    birth_date: z.string().min(10, "Tug'ilgan kun noto'g'ri"),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function StudentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentForm>({
        resolver: zodResolver(studentSchema),
    });

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/students/all');
            setStudents(response.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "O'quvchilarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const onSubmit = async (data: StudentForm) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            await api.post('/students/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("O'quvchi muvaffaqiyatli qo'shildi");
            setIsModalOpen(false);
            reset();
            setSelectedFile(null);
            fetchStudents();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
        const fullName = `${student?.first_name || ''} ${student?.last_name || ''}`.toLowerCase();
        const phone = (student?.phone || '').toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    });

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham ushbu o'quvchini o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/students/delete/${id}`);
            toast.success("O'quvchi o'chirildi");
            fetchStudents();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "O'chirishda xatolik");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">O'quvchilar</h1>
                    <p className="text-slate-500 mt-1">Markaz o'quvchilarini boshqarish va monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Filter}>Filter</Button>
                    <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>Yangi o'quvchi</Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-md w-full">
                        <Input
                            placeholder="Ism yoki telefon orqali qidirish..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">O'quvchi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kontakt</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tug'ilgan kuni</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Holat</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((student) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
                                                    {student.first_name?.[0] || '?'}{student.last_name?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{student.first_name} {student.last_name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-sm text-slate-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {student.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${student.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {student.status === 'active' ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            O'quvchilar topilmadi
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yangi o'quvchi qo'shish"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Ism"
                            placeholder="Jasur"
                            icon={User}
                            {...register('first_name')}
                            error={errors.first_name?.message}
                        />
                        <Input
                            label="Familiya"
                            placeholder="Abduvaliyev"
                            icon={User}
                            {...register('last_name')}
                            error={errors.last_name?.message}
                        />
                    </div>
                    <Input
                        label="Telefon"
                        placeholder="+998 90 123 45 67"
                        icon={Phone}
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                    <Input
                        label="Email"
                        placeholder="student@mail.com"
                        icon={Mail}
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        label="Tug'ilgan sana"
                        type="date"
                        icon={Calendar}
                        {...register('birth_date')}
                        error={errors.birth_date?.message}
                    />
                    <Input
                        label="Manzil"
                        placeholder="Toshkent sh. Olmazor t."
                        icon={MapPin}
                        {...register('address')}
                        error={errors.address?.message}
                    />
                    <Input
                        label="Parol"
                        type="password"
                        placeholder="******"
                        icon={Lock}
                        {...register('password')}
                        error={errors.password?.message}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Rasm (ixtiyoriy)</label>
                        <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${selectedFile ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            {selectedFile ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary-200">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">O'zgartirish uchun bosing</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">Rasm yuklash</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG formatlarida</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            Qo'shish
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
