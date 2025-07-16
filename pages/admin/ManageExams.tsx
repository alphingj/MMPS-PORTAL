import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Exam } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Search, Plus, Edit, Trash2 } from '../../components/ui/Icons';
import { ALL_CLASSES, EXAM_TYPES } from '../../constants';

const ExamForm = ({ exam, onSave, onCancel }: { exam?: Exam | null, onSave: (data: Partial<Exam>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Exam>>(
        exam || {
            name: '',
            subject: '',
            class: '',
            section: '',
            date: '',
            maxMarks: 100,
            type: EXAM_TYPES[0],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData({ ...formData, [name]: parseInt(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Exam Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
                <Select label="Class" name="class" value={formData.class} onChange={handleChange} options={ALL_CLASSES} required />
                <Input label="Section" name="section" placeholder="e.g. A, B" value={formData.section} onChange={handleChange} />
                <Input label="Exam Date" name="date" type="date" value={formData.date} onChange={handleChange} />
                <Input label="Maximum Marks" name="maxMarks" type="number" value={formData.maxMarks} onChange={handleChange} />
            </div>
            <Select label="Exam Type" name="type" value={formData.type} onChange={handleChange} options={EXAM_TYPES} />
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Exam</button>
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

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: readonly string[] }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
        <select {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm">
            <option value="">Select {props.label}</option>
            {props.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ManageExams: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { exams } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExams = useMemo(() => {
        return exams.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.class.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [exams, searchQuery]);

    const handleAdd = () => {
        setEditingExam(null);
        setIsModalOpen(true);
    };

    const handleEdit = (exam: Exam) => {
        setEditingExam(exam);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this exam? This might affect existing results.')) {
            dispatch({ type: 'DELETE_EXAM', payload: id });
        }
    };
    
    const handleSave = (data: Partial<Exam>) => {
        if (editingExam) {
            dispatch({ type: 'UPDATE_EXAM', payload: { ...editingExam, ...data } as Exam });
        } else {
            const newExam: Exam = {
                id: `exam${Date.now()}`,
                ...data,
            } as Exam;
            dispatch({ type: 'ADD_EXAM', payload: newExam });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Exams</h1>
                <p className="text-gray-600">Create exams and upload/edit student marks.</p>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow">
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by exam name, subject, or class..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                        <Plus size={20} className="mr-2" />
                        Create Exam
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                {['Exam Name', 'Subject', 'Class', 'Date', 'Max Marks', 'Type', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredExams.map(exam => (
                                <tr key={exam.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${exam.class} ${exam.section}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.maxMarks}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuItem onClick={() => handleEdit(exam)}><Edit size={16} className="mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {}}><Plus size={16} className="mr-2" /> Enter Marks</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(exam.id)} className="text-red-600"><Trash2 size={16} className="mr-2" /> Delete</DropdownMenuItem>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredExams.length === 0 && <p className="text-center text-gray-500 py-8">No exams found.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExam ? 'Edit Exam' : 'Create New Exam'} size="lg">
                <ExamForm exam={editingExam} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ManageExams;