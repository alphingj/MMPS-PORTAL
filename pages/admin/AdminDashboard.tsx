
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Users, UserCheck, Megaphone, Calendar, ChevronRight, BookOpen, ClipboardCheck, BarChart2, Bus } from '../../components/ui/Icons';

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-5 rounded-lg shadow flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ManagementLink = ({ to, title, icon }: { to: string, title: string, icon: React.ReactNode }) => (
    <Link to={to} className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md hover:bg-gray-50 transition-all">
        <div className="flex items-center">
            {icon}
            <span className="ml-4 font-semibold text-gray-700">{title}</span>
        </div>
        <ChevronRight className="text-gray-400" />
    </Link>
);

const AdminDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { user, students, teachers, announcements, events } = state;

    const managementLinks = [
        { to: '/admin/students', title: 'Manage Students', icon: <Users className="w-6 h-6 text-brand-blue" /> },
        { to: '/admin/teachers', title: 'Manage Teachers', icon: <UserCheck className="w-6 h-6 text-brand-green" /> },
        { to: '/admin/announcements', title: 'Manage Announcements', icon: <Megaphone className="w-6 h-6 text-brand-orange" /> },
        { to: '/admin/events', title: 'Manage Events', icon: <Calendar className="w-6 h-6 text-purple-500" /> },
        { to: '/admin/exams', title: 'Manage Exams', icon: <BookOpen className="w-6 h-6 text-red-500" /> },
        { to: '/admin/attendance', title: 'Manage Attendance', icon: <ClipboardCheck className="w-6 h-6 text-yellow-500" /> },
        { to: '/admin/results', title: 'View Results', icon: <BarChart2 className="w-6 h-6 text-teal-500" /> },
        { to: '/admin/transport', title: 'Manage Transport', icon: <Bus className="w-6 h-6 text-indigo-500" /> },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={students.length} icon={<Users className="text-white" />} color="bg-brand-blue" />
                <StatCard title="Total Teachers" value={teachers.length} icon={<UserCheck className="text-white" />} color="bg-brand-green" />
                <StatCard title="Active Announcements" value={announcements.length} icon={<Megaphone className="text-white" />} color="bg-brand-orange" />
                <StatCard title="Upcoming Events" value={events.length} icon={<Calendar className="text-white" />} color="bg-purple-500" />
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Management Portal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {managementLinks.map(link => (
                        <ManagementLink key={link.to} {...link} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
