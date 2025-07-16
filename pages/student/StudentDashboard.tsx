import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { BookOpen, ClipboardCheck, BarChart2, Megaphone, ChevronRight } from '../../components/ui/Icons';
import { Link } from 'react-router-dom';

const InfoCard = ({ title, icon, to }: { title: string, icon: React.ReactNode, to: string }) => (
    <Link to={to} className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md hover:bg-gray-50 transition-all">
        <div className="flex items-center">
             <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-brand-purple-light text-brand-purple">
                {icon}
            </div>
            <span className="ml-4 font-semibold text-gray-700">{title}</span>
        </div>
        <ChevronRight className="text-gray-400" />
    </Link>
);


const StudentDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { user } = state;

    const student = state.students.find(s => s.id === user?.id);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold mb-4">Your Information</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-500">Roll Number</p>
                        <p className="text-gray-800 font-semibold">{student?.rollNumber}</p>
                    </div>
                     <div>
                        <p className="font-medium text-gray-500">Class</p>
                        <p className="text-gray-800 font-semibold">{student?.class} {student?.section}</p>
                    </div>
                     <div>
                        <p className="font-medium text-gray-500">Parent's Name</p>
                        <p className="text-gray-800 font-semibold">{student?.parentName}</p>
                    </div>
                 </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard to="#" title="View My Results" icon={<BarChart2 size={24} />} />
                    <InfoCard to="#" title="View My Attendance" icon={<ClipboardCheck size={24} />} />
                    <InfoCard to="/announcements" title="School Announcements" icon={<Megaphone size={24} />} />
                    <InfoCard to="#" title="My Subjects & Homework" icon={<BookOpen size={24} />} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
