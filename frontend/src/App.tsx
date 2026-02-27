import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import StudentsPage from './features/students/StudentsPage';
import TeachersPage from './features/teachers/TeachersPage';
import StaffsPage from './features/staffs/StaffsPage';
import CoursesPage from './features/courses/CoursesPage';
import GroupsPage from './features/groups/GroupsPage';
import RoomsPage from './features/rooms/RoomsPage';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import StudentDashboard from './features/student/StudentDashboard';
import {
  GraduationCap,
  TrendingUp,
  DollarSign,
  BookOpen,
  CalendarCheck2
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-slate-500 font-medium text-sm mb-1">{label}</p>
    <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
  </div>
);

const DashboardHome = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Xayrli kun! 👋</h1>
        <p className="text-slate-500 mt-1">Bugungi markaz ko'rsatkichlari bilan tanishing.</p>
      </div>
      <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all">
        Hisobot yuklash
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Jami o'quvchilar" value="1,248" icon={GraduationCap} color="bg-blue-600" trend={12} />
      <StatCard label="Faol guruhlar" value="42" icon={BookOpen} color="bg-purple-600" trend={5} />
      <StatCard label="Tushumlar (oylik)" value="45.2M" icon={DollarSign} color="bg-emerald-600" trend={8.4} />
      <StatCard label="Davomat" value="94%" icon={CalendarCheck2} color="bg-orange-600" trend={-2} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">O'sish dinamikasi</h2>
          <select className="bg-slate-50 border-none rounded-xl text-sm font-semibold px-4 py-2 outline-none">
            <option>Oxirgi 6 oy</option>
            <option>Oxirgi yil</option>
          </select>
        </div>
        <div className="h-72 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
          <TrendingUp className="text-slate-300 w-12 h-12" />
          <span className="text-slate-400 font-medium ml-4">Grafik yuklanmoqda...</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Yaqinlashayotgan darslar</h2>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase">Dush</span>
                <span className="text-sm font-bold text-slate-900">14:00</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm leading-tight">Node.js Foundation</h4>
                <p className="text-xs text-slate-500 font-medium">Bozorov Ruslan • Xona 4</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary-500" />
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-colors">
          Barcha jadvalni ko'rish
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/staffs" element={<StaffsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/lessons" element={<div className="p-8 text-2xl font-bold">Darslar sahifasi</div>} />
        <Route path="/settings" element={<div className="p-8 text-2xl font-bold">Sozlamalar sahifasi</div>} />
      </Route>
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
