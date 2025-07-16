
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, GraduationCap, User, ArrowRight, Megaphone, Bus, School } from '../../components/ui/Icons';

const PortalCard = ({ to, icon, title, description, role }: { to:string, icon: React.ReactNode, title: string, description: string, role: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-brand-purple-light">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        <Link to={to} className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
            Login <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
    </div>
);

const InfoCard = ({ to, icon, title }: { to:string, icon: React.ReactNode, title: string }) => (
    <Link to={to} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-between">
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand-purple-light">
                {icon}
            </div>
            <span className="ml-4 font-semibold text-gray-700">{title}</span>
        </div>
        <ArrowRight className="text-gray-400" />
    </Link>
);


const HomePage: React.FC = () => {
    return (
        <div className="w-full">
            <header className="text-center py-12">
                 <div className="mx-auto w-20 h-20 mb-4 rounded-2xl flex items-center justify-center bg-brand-purple-light">
                    <School className="w-12 h-12 text-brand-purple" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">Mary Matha Public School</h1>
                <p className="text-xl text-gray-600 mt-2">MMPS Kadaplamattom</p>
                <p className="text-2xl text-gray-700 mt-8 font-light">Welcome to the School Portal</p>
            </header>

            <main>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <PortalCard to="/login/admin" icon={<Shield className="w-8 h-8 text-brand-purple" />} title="Admin Portal" description="For school administration and staff." role="admin" />
                    <PortalCard to="/login/teacher" icon={<GraduationCap className="w-8 h-8 text-brand-green" />} title="Teacher Portal" description="Access for faculty and teachers." role="teacher" />
                    <PortalCard to="/login/student" icon={<User className="w-8 h-8 text-brand-pink" />} title="Parent/Student Portal" description="Access grades, attendance, and more." role="student" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard to="/announcements" icon={<Megaphone className="w-6 h-6 text-brand-orange" />} title="Announcements" />
                    <InfoCard to="/transport" icon={<Bus className="w-6 h-6 text-brand-blue" />} title="Transport" />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
