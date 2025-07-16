
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Student } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Search, Plus, Edit, Trash2 } from '../../components/ui/Icons';

const StudentForm = ({ student, onSave, onCancel }: { student?: Student | null, onSave: (student: Partial<Student>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Student>>(
        student || { status: 'active' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Format date correctly for state
        if (type === 'date') {
            const date = new Date(value);
            const formattedDate = date.toISOString().split('T')[0];
            setFormData({ ...formData, [name]: formattedDate });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    // Helper to format date for input value
    const getInputValue = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
                <Input label="Class" name="class" value={formData.class} onChange={handleChange} required />
                <Input label="Section" name="section" value={formData.section} onChange={handleChange} />
                <Input label="Parent's Name" name="parentName" value={formData.parentName} onChange={handleChange} />
                <Input label="Parent's Phone" name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
                <Input label="Login Password" name="loginPassword" type="password" placeholder="Set a password for parent login" value={formData.loginPassword} onChange={handleChange} />
                <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                <Input label="Date of Birth" name="dateOfBirth" type="date" value={getInputValue(formData.dateOfBirth)} onChange={handleChange} />
                <Input label="Admission Date" name="admissionDate" type="date" value={getInputValue(formData.admissionDate)} onChange={handleChange} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Student</button>
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

const ManageStudents: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { students } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNumber.includes(searchQuery) ||
            s.class.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const handleAddStudent = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDeleteStudent = (studentId: string) => {
        if(window.confirm('Are you sure you want to permanently delete this student?')) {
            dispatch({ type: 'DELETE_STUDENT', payload: studentId });
        }
    };
    
    const handleSaveStudent = (studentData: Partial<Student>) => {
        if (editingStudent) {
            dispatch({ type: 'UPDATE_STUDENT', payload: { ...editingStudent, ...studentData } });
        } else {
             const newStudent: Student = {
                id: `s${Date.now()}`,
                rollNumber: '',
                fullName: '',
                class: '',
                section: '',
                parentName: '',
                parentPhone: '',
                address: '',
                dateOfBirth: '',
                admissionDate: '',
                status: 'active',
                ...studentData,
            };
            dispatch({ type: 'ADD_STUDENT', payload: newStudent });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
                <p className="text-gray-600">View, add, edit, or remove student records.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, roll number, or class..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleAddStudent} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                        <Plus size={20} className="mr-2" />
                        Add Student
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Roll No.', 'Name', 'Class', 'Parent Name', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${student.class} ${student.section}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.parentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                                <Edit size={16} className="mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)} className="text-red-600">
                                                <Trash2 size={16} className="mr-2" /> Delete Permanently
                                            </DropdownMenuItem>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredStudents.length === 0 && <p className="text-center text-gray-500 py-8">No students found.</p>}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? 'Edit Student' : 'Add New Student'}
                size="xl"
            >
                <StudentForm
                    student={editingStudent}
                    onSave={handleSaveStudent}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default ManageStudents;
