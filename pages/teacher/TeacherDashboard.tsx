import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { ChevronRight, BookOpen, ClipboardCheck, FileUp } from '../../components/ui/Icons';

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
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

const QuickActionLink = ({ to, title, description, icon }: { to: string, title: string, description: string, icon: React.ReactNode }) => (
    <Link to={to} className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md hover:bg-gray-50 transition-all">
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-brand-purple-light text-brand-purple">
                {icon}
            </div>
            <div className="ml-4">
                <p className="font-semibold text-gray-700">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        <ChevronRight className="text-gray-400" />
    </Link>
);


const TeacherDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { user, exams } = state;

    const teacher = state.teachers.find(t => t.id === user?.id);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Subjects Taught" value={teacher?.subject || 'N/A'} icon={<BookOpen className="text-white" />} color="bg-brand-blue" />
                <StatCard title="Exams Created" value={exams.filter(e => e.subject === teacher?.subject).length} icon={<FileUp className="text-white" />} color="bg-brand-orange" />
                <StatCard title="Assigned Classes" value={3} icon={<ClipboardCheck className="text-white" />} color="bg-brand-pink" />
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionLink to="/teacher/exams" title="Create Exam" description="Set up a new test or exam for your classes." icon={<BookOpen size={24} />} />
                    <QuickActionLink to="/teacher/attendance" title="Mark Attendance" description="Take daily attendance for your assigned classes." icon={<ClipboardCheck size={24} />} />
                    <QuickActionLink to="/teacher/results" title="Upload Results" description="Enter and publish marks for recent exams." icon={<FileUp size={24} />} />
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
