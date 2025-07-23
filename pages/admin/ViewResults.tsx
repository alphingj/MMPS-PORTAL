
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ALL_CLASSES } from '../../constants';
import { FolderOpen } from '../../components/ui/Icons';

const ViewResults: React.FC = () => {
    const { state } = useAppContext();
    const { exams, students, results } = state;
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const filteredResults = useMemo(() => {
        return results
            .filter(r => selectedExam ? r.examId === selectedExam : true)
            .map(result => {
                const student = students.find(s => s.id === result.studentId);
                const exam = exams.find(e => e.id === result.examId);
                return { ...result, student, exam };
            })
            .filter(r => r.student && r.exam) // Ensure we have student and exam info
            .filter(r => selectedClass ? r.student.class === selectedClass : true);
    }, [results, selectedExam, selectedClass, students, exams]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">View Results</h1>
                <p className="text-gray-600">Browse exam results by exam or class.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Filter Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Exam</label>
                        <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">All Exams</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.name} - {e.class}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">All Classes</option>
                            {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Exam Results ({filteredResults.length})</h2>
                {filteredResults.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredResults.map(result => (
                                    <tr key={result.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.student.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.student.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.exam.name} ({result.exam.subject})</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.student.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="font-semibold">{result.marksObtained}</span> / {result.exam.maxMarks}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <FolderOpen size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Results Found</h3>
                        <p className="mt-1 text-sm text-gray-500">No exam results match your current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewResults;