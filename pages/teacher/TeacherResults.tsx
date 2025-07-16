import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FolderOpen } from '../../components/ui/Icons';

const TeacherResults: React.FC = () => {
    const { state } = useAppContext();
    const { user, exams, students } = state;
    const [selectedExamId, setSelectedExamId] = useState('');
    
    const teacher = state.teachers.find(t => t.id === user?.id);
    const teacherSubject = teacher?.subject || '';

    const teacherExams = useMemo(() => {
        if (!teacherSubject) return [];
        return exams.filter(e => e.subject === teacherSubject);
    }, [exams, teacherSubject]);

    const selectedExam = useMemo(() => {
        return exams.find(e => e.id === selectedExamId);
    }, [exams, selectedExamId]);
    
    const studentsForExam = useMemo(() => {
        if (!selectedExam) return [];
        return students.filter(s => s.class === selectedExam.class && (!selectedExam.section || s.section === selectedExam.section));
    }, [students, selectedExam]);

    // In a real app, you would manage this state for each student
    // const [marks, setMarks] = useState({});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
                <p className="text-gray-600">View results for your subject: <span className="font-semibold">{teacherSubject}</span></p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Select Exam</h2>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Exams</label>
                    <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select an exam to view results</option>
                        {teacherExams.map(e => <option key={e.id} value={e.id}>{e.name} - {e.class}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                {!selectedExam ? (
                     <div className="text-center py-10">
                        <FolderOpen size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Exam Selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Create an exam first to view results.</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Results for {selectedExam.name} ({selectedExam.class})</h2>
                        {/* Here you would map `studentsForExam` and show inputs for marks */}
                        <p className="text-gray-600">Functionality to upload and view marks for "{selectedExam.name}" would be displayed here.</p>
                         <div className="overflow-x-auto mt-4">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentsForExam.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 text-sm font-medium">{student.rollNumber}</td>
                                            <td className="px-6 py-4 text-sm">{student.fullName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <input type="number" max={selectedExam.maxMarks} className="w-24 p-1 border rounded-md" />
                                                <span className="ml-2 text-gray-500">/ {selectedExam.maxMarks}</span>
                                            </td>
                                             <td className="px-6 py-4 text-sm"><button className="text-sm text-brand-purple font-medium">Save</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherResults;
