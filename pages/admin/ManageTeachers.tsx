
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Teacher, TeacherPermissions } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Search, Plus, Edit, Trash2 } from '../../components/ui/Icons';
import { PERMISSIONS_LIST } from '../../constants';
import * as api from '../../services/api';

const TeacherForm = ({ teacher, onSave, onCancel }: { teacher?: Teacher | null, onSave: (teacher: Partial<Teacher>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Teacher>>(
        teacher || { 
            status: 'active',
            username: '',
            fullName: '',
            email: '',
            permissions: {
                manageStudents: false,
                manageTeachers: false,
                manageAnnouncements: false,
                manageEvents: false,
                manageExams: true,
                manageAttendance: true,
                viewAllResults: false,
                fullAdminAccess: false,
            }
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...(prev.permissions as TeacherPermissions),
                [name]: checked,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const getInputValue = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
                <Input label="Employee ID" name="employeeId" value={formData.employeeId || ''} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                <Input label="Subject" name="subject" value={formData.subject || ''} onChange={handleChange} />
                <Input label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                <Input label="Qualification" name="qualification" value={formData.qualification || ''} onChange={handleChange} />
                <Input label="Experience (years)" name="experience" type="number" value={formData.experience || 0} onChange={handleChange} />
                <Input label="Joining Date" name="joiningDate" type="date" value={getInputValue(formData.joiningDate)} onChange={handleChange} />
            </div>

            <div className="border-t pt-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Credentials & Permissions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Username" name="username" value={formData.username || ''} onChange={handleChange} required />
                    <Input 
                        label="Login Password" 
                        name="password" 
                        type="password"
                        placeholder={teacher ? "Leave blank to keep unchanged" : "Set initial password"}
                        value={formData.password || ''} 
                        onChange={handleChange} 
                    />
                </div>
                 <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Assign Permissions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PERMISSIONS_LIST.map(permission => (
                             <label key={permission.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    name={permission.id}
                                    checked={!!formData.permissions?.[permission.id as keyof TeacherPermissions]}
                                    onChange={handlePermissionChange}
                                    className="h-4 w-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple"
                                />
                                <span className="ml-2 text-sm text-gray-600">{permission.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Teacher</button>
            </div>
        </form>
    );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
        <input {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
    </div>
);

const ManageTeachers: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { teachers } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTeachers = useMemo(() => {
        return teachers.filter(t => 
            t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [teachers, searchQuery]);

    const handleAddTeacher = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDeleteTeacher = async (teacher: Teacher) => {
        if(window.confirm('Are you sure you want to permanently delete this teacher record and their login access?')) {
            try {
                await api.deleteTeacher(teacher);
                dispatch({ type: 'DELETE_TEACHER', payload: teacher.id });
            } catch (error) {
                console.error("Failed to delete teacher:", error);
                alert(`Error: Could not delete teacher. ${(error as Error).message}`);
            }
        }
    };
    
    const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
        try {
            if (editingTeacher) {
                const updatedTeacher = await api.updateTeacher({...editingTeacher, ...teacherData});
                if (updatedTeacher) {
                    dispatch({ type: 'UPDATE_TEACHER', payload: updatedTeacher });
                }
            } else {
                const newTeacher = await api.addTeacher(teacherData);
                if (newTeacher) {
                    dispatch({ type: 'ADD_TEACHER', payload: newTeacher });
                }
            }
            setIsModalOpen(false);
            setEditingTeacher(null);
        } catch (error) {
            console.error("Failed to save teacher:", error);
            alert(`Error: Could not save teacher data. ${(error as Error).message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Teachers</h1>
                <p className="text-gray-600">Add, edit, and set permissions for teachers.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or subject..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleAddTeacher} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                        <Plus size={20} className="mr-2" />
                        Add Teacher
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Employee ID', 'Name', 'Subject', 'Phone', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {teacher.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                                                <Edit size={16} className="mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteTeacher(teacher)} className="text-red-600">
                                                <Trash2 size={16} className="mr-2" /> Delete Permanently
                                            </DropdownMenuItem>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredTeachers.length === 0 && <p className="text-center text-gray-500 py-8">No teachers found.</p>}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                size="xl"
            >
                <TeacherForm
                    teacher={editingTeacher}
                    onSave={handleSaveTeacher}
                    onCancel={() => { setIsModalOpen(false); setEditingTeacher(null); }}
                />
            </Modal>
        </div>
    );
};

export default ManageTeachers;
