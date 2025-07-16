import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Role, User as UserType } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import { MOCK_ADMIN, MOCK_TEACHERS, MOCK_STUDENTS } from '../../data/mock';
import { Shield, GraduationCap, User, ArrowRight, Eye, EyeOff, ChevronLeft } from '../../components/ui/Icons';

/**
 * Simulates calling a backend API to authenticate a user.
 * In a real app, this would be an actual fetch/axios call to your server.
 * @param role The user's role.
 * @param username The username or identifier.
 * @param password The password.
 * @returns A promise that resolves to the user object or null.
 */
const authenticateUser = async (role: Role, username: string, password: string): Promise<UserType | null> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    switch (role) {
        case Role.Admin:
            if (username === 'principal@mmps' && password === 'Moby@2025_') {
                const adminData = MOCK_ADMIN;
                return { id: adminData.id, name: adminData.name, role: Role.Admin, username: adminData.username };
            }
            break;
        case Role.Teacher:
            const teacher = MOCK_TEACHERS.find(t => t.username === username);
            // Teacher password check (for mock purposes)
            if (teacher && password === 'password') {
                return { id: teacher.id, name: teacher.fullName, role: Role.Teacher, username: teacher.username, permissions: teacher.permissions };
            }
            break;
        case Role.Student:
            const student = MOCK_STUDENTS.find(s => s.rollNumber === username);
             // Student password check (for mock purposes)
            if (student && password === 'password') {
                return { id: student.id, name: student.fullName, role: Role.Student, username: student.rollNumber };
            }
            break;
    }
    
    // If no match is found
    return null;
};


const LoginPage: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const { dispatch } = useAppContext();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!role || !Object.values(Role).includes(role as Role)) {
            navigate('/');
        }
    }, [role, navigate]);

    const pageConfig = {
        [Role.Admin]: {
            icon: <Shield className="w-10 h-10 text-brand-purple" />,
            title: 'Admin Portal',
            subtitle: 'Mary Matha Public School',
            usernameLabel: 'Email / Username',
            passwordLabel: 'Password',
            helpText: 'Contact IT administrator for login access'
        },
        [Role.Teacher]: {
            icon: <GraduationCap className="w-10 h-10 text-brand-green" />,
            title: 'Teacher Portal',
            subtitle: 'Mary Matha Public School',
            usernameLabel: 'Username',
            passwordLabel: 'Password',
            helpText: 'Contact admin for login credentials'
        },
        [Role.Student]: {
            icon: <User className="w-10 h-10 text-brand-pink" />,
            title: 'Parent / Student Portal',
            subtitle: 'Enter your credentials to access the dashboard.',
            usernameLabel: "Enter your child's roll number",
            passwordLabel: 'Enter password set by school',
            helpText: 'Login issue? Please contact the school office.'
        }
    };

    const currentConfig = pageConfig[role as Role];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await authenticateUser(role as Role, username, password);

            if (user) {
                dispatch({ type: 'LOGIN', payload: { user } });
                navigate(`/${role}/dashboard`);
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentConfig) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-12">
             <div className="text-center mb-6">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-purple hover:text-indigo-800">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Home
                </Link>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-gray-100">
                        {currentConfig.icon}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{currentConfig.title}</h1>
                    <p className="text-gray-500 mt-1">{currentConfig.subtitle}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{currentConfig.usernameLabel}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{currentConfig.passwordLabel}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                        {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">{currentConfig.helpText}</p>
            </div>
        </div>
    );
};

export default LoginPage;