
import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { User, LogOut, LayoutDashboard, Users, UserCheck, Megaphone, Calendar, BookOpen, ClipboardCheck, Bus, BarChart2, ChevronDown, School } from 'lucide-react';

const NavLink = ({ to, icon, children, isSelected }: { to: string, icon: React.ReactNode, children: React.ReactNode, isSelected: boolean }) => (
    <Link to={to} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isSelected ? 'bg-brand-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
        {icon}
        <span className="ml-3">{children}</span>
    </Link>
);

const AdminSidebar = () => {
    const location = useLocation();
    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/admin/teachers', icon: <UserCheck size={20} />, label: 'Teachers' },
        { path: '/admin/exams', icon: <BookOpen size={20} />, label: 'Exams' },
        { path: '/admin/attendance', icon: <ClipboardCheck size={20} />, label: 'Attendance' },
        { path: '/admin/results', icon: <BarChart2 size={20} />, label: 'Results' },
        { path: '/admin/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
        { path: '/admin/events', icon: <Calendar size={20} />, label: 'Events' },
        { path: '/admin/transport', icon: <Bus size={20} />, label: 'Transport' },
    ];
    return (
        <nav className="flex flex-col space-y-1">
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path} icon={item.icon} isSelected={location.pathname === item.path}>
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
};

const TeacherSidebar = () => {
    const location = useLocation();
    const navItems = [
        { path: '/teacher/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/teacher/exams', icon: <BookOpen size={20} />, label: 'My Exams' },
        { path: '/teacher/attendance', icon: <ClipboardCheck size={20} />, label: 'Attendance' },
        { path: '/teacher/results', icon: <BarChart2 size={20} />, label: 'Upload Results' },
    ];
     return (
        <nav className="flex flex-col space-y-1">
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path} icon={item.icon} isSelected={location.pathname === item.path}>
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
};


const AppHeader = () => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                         <div className="w-10 h-10 bg-brand-purple rounded-lg flex items-center justify-center">
                            <School className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-gray-800">MMPS</span>
                            <span className="text-xs text-gray-500">School Portal</span>
                        </div>
                    </Link>
                    {user && (
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                                <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

const Layout: React.FC = () => {
    const { state } = useAppContext();
    const { user } = state;

    const renderSidebar = () => {
        if (!user) return null;
        switch (user.role) {
            case 'admin':
                return <AdminSidebar />;
            case 'teacher':
                return <TeacherSidebar />;
            default:
                return null;
        }
    };
    
    const sidebar = renderSidebar();

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />
             <div className="flex">
                {sidebar && (
                    <aside className="w-64 bg-white p-4 border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16">
                        {sidebar}
                    </aside>
                )}
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${!sidebar ? 'max-w-7xl mx-auto' : ''}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
