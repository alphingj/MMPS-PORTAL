
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FolderOpen, Save } from '../../components/ui/Icons';
import * as api from '../../services/api';
import { Result } from '../../types';

const TeacherResults: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user, exams, students, results } = state;
    const [selectedExamId, setSelectedExamId] = useState('');
    const [marks, setMarks] = useState<Record<string, number | string>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    const teacher = state.teachers.find(t => t.userId === user?.id);
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

    useEffect(() => {
        if (selectedExam) {
            const initialMarks: Record<string, number | string> = {};
            studentsForExam.forEach(student => {
                const existingResult = results.find(r => r.examId === selectedExam.id && r.studentId === student.id);
                initialMarks[student.id] = existingResult?.marksObtained ?? '';
            });
            setMarks(initialMarks);
        } else {
            setMarks({});
        }
    }, [selectedExam, results, studentsForExam]);

    const handleMarkChange = (studentId: string, value: string) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSaveResults = async () => {
        if (!selectedExam) return;
        setIsLoading(true);
        const resultsToSave: Omit<Result, 'id'>[] = Object.entries(marks)
            .filter(([, mark]) => mark !== '' && mark !== null)
            .map(([studentId, mark]) => ({
                examId: selectedExam.id,
                studentId: studentId,
                marksObtained: Number(mark),
            }));

        try {
            const savedResults = await api.saveResults(resultsToSave);
            dispatch({ type: 'SAVE_RESULTS', payload: savedResults });
            alert('Results saved successfully!');
        } catch (error) {
            console.error("Failed to save results:", error);
            alert(`Error: Could not save results. ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Upload Exam Results</h1>
                <p className="text-gray-600">Enter and publish marks for your subject: <span className="font-semibold">{teacherSubject}</span></p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Select Exam</h2>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Exams</label>
                    <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select an exam to enter results</option>
                        {teacherExams.map(e => <option key={e.id} value={e.id}>{e.name} - {e.class}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                {!selectedExam ? (
                     <div className="text-center py-10">
                        <FolderOpen size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Exam Selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Please select one of your exams to begin entering marks.</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Results for {selectedExam.name} ({selectedExam.class})</h2>
                            <button onClick={handleSaveResults} disabled={isLoading} className="inline-flex items-center px-4 py-2 bg-brand-purple text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                                <Save size={16} className="mr-2" /> {isLoading ? 'Saving...' : 'Save All Results'}
                            </button>
                        </div>
                         <div className="overflow-x-auto mt-4">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentsForExam.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 text-sm font-medium">{student.rollNumber}</td>
                                            <td className="px-6 py-4 text-sm">{student.fullName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <input 
                                                   type="number" 
                                                   max={selectedExam.maxMarks} 
                                                   className="w-24 p-1 border rounded-md" 
                                                   value={marks[student.id] || ''}
                                                   onChange={e => handleMarkChange(student.id, e.target.value)}
                                                />
                                                <span className="ml-2 text-gray-500">/ {selectedExam.maxMarks}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {studentsForExam.length === 0 && <p className="text-center text-gray-500 py-8">No students found for this class.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherResults;