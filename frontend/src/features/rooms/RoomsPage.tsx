import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    DoorOpen,
    Loader2
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button, Input, Modal, Card } from '../../components/UI';

const roomSchema = z.object({
    name: z.string().min(1, "Xona nomi kiritilishi shart"),
});

type RoomForm = z.infer<typeof roomSchema>;

interface Room {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomForm>({
        resolver: zodResolver(roomSchema),
    });

    const fetchRooms = async () => {
        try {
            const response = await api.get('/rooms/all');
            setRooms(response.data);
        } catch (error: any) {
            toast.error("Xonalarni yuklashda xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const onSubmit = async (data: RoomForm) => {
        setIsSubmitting(true);
        try {
            await api.post('/rooms', data);
            toast.success("Xona muvaffaqiyatli qo'shildi");
            setIsModalOpen(false);
            reset();
            fetchRooms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Haqiqatan ham ushbu xonani o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/rooms/delete/${id}`);
            toast.success("Xona o'chirildi");
            fetchRooms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter(room =>
        room?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Xonalar</h1>
                    <p className="text-slate-500 mt-1 font-medium">Markazdagi barcha mavjud xonalar ro'yxati</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={Plus}
                    className="shadow-primary-600/20"
                >
                    Xona qo'shish
                </Button>
            </div>

            {/* Content Section */}
            <Card className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Xona nomi bo'yicha qidirish..."
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
                    ) : filteredRooms.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <DoorOpen size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Xonalar topilmadi</h3>
                            <p className="text-slate-500 mt-1">Qidiruv mezonlariga mos keladigan xona mavjud emas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Xona nomi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Holat</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qo'shilgan sana</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                    <DoorOpen size={20} />
                                                </div>
                                                <span className="font-bold text-slate-900">{room.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${room.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {room.status === 'active' ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {new Date(room.created_at).toLocaleDateString('uz-UZ')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-primary-600 shadow-sm">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.id)}
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

            {/* Add Room Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                title="Yangi xona qo'shish"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Xona nomi"
                        placeholder="Masalan: Room 101"
                        {...register('name')}
                        error={errors.name?.message}
                    />

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
                            Qo'shish
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
