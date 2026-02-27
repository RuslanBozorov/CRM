import { useState, useEffect } from 'react';
import { Search, Shield, Loader2, Trash2, Edit2, UserPlus, Phone, User, Mail, MapPin, Lock, X } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const createSchema = z.object({
    first_name: z.string().min(2, "Ism juda qisqa"),
    last_name: z.string().min(2, "Familiya juda qisqa"),
    phone: z.string().min(9, "Telefon raqam noto'g'ri"),
    email: z.string().email("Email noto'g'ri"),
    address: z.string().min(3, "Manzil kiritilishi shart"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    role: z.enum(['ADMIN', 'SUPERADMIN']),
});

const updateSchema = z.object({
    first_name: z.string().min(2, "Ism juda qisqa").optional(),
    last_name: z.string().min(2, "Familiya juda qisqa").optional(),
    phone: z.string().min(9, "Telefon raqami noto'g'ri").optional(),
    email: z.string().email("Email noto'g'ri").optional(),
    address: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export default function StaffsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [staffs, setStaffs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const createForm = useForm<CreateForm>({
        resolver: zodResolver(createSchema),
        defaultValues: { role: 'ADMIN' }
    });

    const editForm = useForm<UpdateForm>({
        resolver: zodResolver(updateSchema),
    });

    const fetchStaffs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users/admin/all');
            setStaffs(Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xodimlarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStaffs(); }, []);

    const onCreateSubmit = async (data: CreateForm) => {
        setIsSubmitting(true);
        try {
            await api.post('/users/admin', data);
            toast.success("Admin muvaffaqiyatli qo'shildi");
            setIsModalOpen(false);
            createForm.reset();
            fetchStaffs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (staff: any) => {
        setSelectedStaff(staff);
        editForm.reset({
            first_name: staff.first_name,
            last_name: staff.last_name,
            phone: staff.phone,
            email: staff.email,
            address: staff.address ?? '',
        });
        setIsEditModalOpen(true);
    };

    const onUpdateSubmit = async (data: UpdateForm) => {
        if (!selectedStaff) return;
        setIsSubmitting(true);
        try {
            await api.put(`/users/update/${selectedStaff.id}`, data);
            toast.success("Admin ma'lumotlari yangilandi");
            setIsEditModalOpen(false);
            fetchStaffs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Yangilashda xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham ushbu adminni o'chirmoqchimisiz?")) return;
        setDeletingId(id);
        try {
            await api.delete(`/users/delete/${id}`);
            toast.success("Admin o'chirildi");
            fetchStaffs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "O'chirishda xatolik");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredStaffs = staffs.filter(staff => {
        const fullName = `${staff?.first_name || ''} ${staff?.last_name || ''}`.toLowerCase();
        const phone = (staff?.phone || '').toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    });

    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
        SUPERADMIN: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Super Admin' },
        ADMIN: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Admin' },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Adminlar va Xodimlar</h1>
                    <p className="text-slate-500 mt-1">Tizim foydalanuvchilarini boshqarish.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={UserPlus}>
                    Yangi admin qo'shish
                </Button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Ism yoki telefon orqali qidirish..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="text-sm text-slate-400 font-medium">{filteredStaffs.length} ta xodim</span>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Xodim</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Roli</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kontakt</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Holat</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {filteredStaffs.map((staff) => {
                                        const role = roleConfig[staff.role] ?? roleConfig['ADMIN'];
                                        return (
                                            <motion.tr
                                                key={staff.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${staff.role === 'SUPERADMIN' ? 'from-violet-500 to-violet-600' : 'from-blue-500 to-blue-600'} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                                                            {staff.first_name?.[0] || '?'}{staff.last_name?.[0] || ''}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{staff.first_name} {staff.last_name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${role.bg} ${role.text} text-xs font-bold`}>
                                                        <Shield size={12} />
                                                        {role.label}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 font-medium">{staff.phone}</div>
                                                    <div className="text-xs text-slate-400">{staff.address}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${staff.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        {staff.status === 'active' ? '● Faol' : '● Nofaol'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(staff)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="Tahrirlash"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {staff.role !== 'SUPERADMIN' && (
                                                            <button
                                                                onClick={() => handleDelete(staff.id)}
                                                                disabled={deletingId === staff.id}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40"
                                                                title="O'chirish"
                                                            >
                                                                {deletingId === staff.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                                {filteredStaffs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <X size={36} className="text-slate-200" />
                                                <p className="text-slate-500 font-medium">Xodimlar topilmadi</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); createForm.reset(); }} title="Yangi admin qo'shish">
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Ism" placeholder="Ali" icon={User} {...createForm.register('first_name')} error={createForm.formState.errors.first_name?.message} />
                        <Input label="Familiya" placeholder="Valiyev" icon={User} {...createForm.register('last_name')} error={createForm.formState.errors.last_name?.message} />
                    </div>
                    <Input label="Telefon" placeholder="+998 90 123 45 67" icon={Phone} {...createForm.register('phone')} error={createForm.formState.errors.phone?.message} />
                    <Input label="Email" placeholder="example@mail.com" icon={Mail} {...createForm.register('email')} error={createForm.formState.errors.email?.message} />
                    <Input label="Manzil" placeholder="Toshkent sh. Chilonzor t." icon={MapPin} {...createForm.register('address')} error={createForm.formState.errors.address?.message} />
                    <Input label="Parol" type="password" placeholder="******" icon={Lock} {...createForm.register('password')} error={createForm.formState.errors.password?.message} />
                    <Select label="Roli" {...createForm.register('role')} error={createForm.formState.errors.role?.message}>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERADMIN">Super Admin</option>
                    </Select>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); createForm.reset(); }}>Bekor qilish</Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>Qo'shish</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Tahrirlash: ${selectedStaff?.first_name} ${selectedStaff?.last_name}`}>
                <form onSubmit={editForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Ism" icon={User} {...editForm.register('first_name')} error={editForm.formState.errors.first_name?.message} />
                        <Input label="Familiya" icon={User} {...editForm.register('last_name')} error={editForm.formState.errors.last_name?.message} />
                    </div>
                    <Input label="Telefon" icon={Phone} {...editForm.register('phone')} error={editForm.formState.errors.phone?.message} />
                    <Input label="Email" icon={Mail} {...editForm.register('email')} error={editForm.formState.errors.email?.message} />
                    <Input label="Manzil" icon={MapPin} {...editForm.register('address')} error={editForm.formState.errors.address?.message} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>Saqlash</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
