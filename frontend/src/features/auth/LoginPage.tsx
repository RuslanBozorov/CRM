import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, Eye, EyeOff, Loader2, ShieldCheck, GraduationCap, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    phone: z.string().min(9, "Telefon raqami noto'g'ri"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type LoginForm = z.infer<typeof loginSchema>;

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            let endpoint = '/auth/user/login';
            if (selectedRole === 'TEACHER') endpoint = '/auth/teacher/login';
            if (selectedRole === 'STUDENT') endpoint = '/auth/student/login';

            const response = await api.post(endpoint, data);
            const { accessToken, success, message, user } = response.data;

            if (!success && !accessToken) {
                throw new Error(message || 'Xatolik yuz berdi');
            }

            localStorage.setItem('token', accessToken);
            localStorage.setItem('me', JSON.stringify(user));

            toast.success(message || 'Xush kelibsiz!');

            // Role-based redirect
            if (user?.role === 'TEACHER') {
                navigate('/teacher-dashboard');
            } else if (user?.role === 'STUDENT') {
                navigate('/student-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || error.message || "Kirishda xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'TEACHER', label: 'Teacher', icon: UserCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side: Branding & Animation */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-primary-900 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 mx-auto border border-white/20">
                        <LogIn className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">CRM Systems</h1>
                    <p className="text-primary-100 text-xl max-w-md mx-auto leading-relaxed">
                        O'quv markazingizni yanada oson va samarali boshqaring.
                    </p>
                </motion.div>

                <div className="mt-24 w-full max-w-md relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 * i }}
                                className="h-24 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-6 bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-[480px]"
                >
                    <div className="bg-white p-8 lg:p-12 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Tizimga kirish</h2>
                            <p className="text-slate-500">Davom etish uchun ma'lumotlaringizni kiriting.</p>
                        </div>

                        {/* Role Selector */}
                        <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id as UserRole)}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${selectedRole === role.id
                                        ? 'bg-white shadow-sm text-slate-900 font-bold'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <role.icon size={18} className={selectedRole === role.id ? role.color : 'text-slate-400'} />
                                    <span className="text-sm">{role.label}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon raqam</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        {...register('phone')}
                                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.phone ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'} rounded-2xl outline-none transition-all placeholder:text-slate-400`}
                                        placeholder="+998 90 123 45 67"
                                    />
                                </div>
                                {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'} rounded-2xl outline-none transition-all placeholder:text-slate-400`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all" />
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Eslab qolish</span>
                                </label>
                                <button type="button" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                    Parolni unutdingizmi?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Kirish
                                        <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-sm">
                                Hisobingiz yo'qmi? <button className="font-bold text-primary-600 hover:text-primary-700 transition-colors">Ro'yxatdan o'tish</button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
