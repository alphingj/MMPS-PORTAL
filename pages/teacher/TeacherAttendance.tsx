import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ALL_CLASSES, ATTENDANCE_STATUSES } from '../../constants';
import { AttendanceRecord, Student } from '../../types';
import { Save } from '../../components/ui/Icons';

const AttendanceStat = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className={`p-4 rounded-lg text-center ${color}`}>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
    </div>
);

const TeacherAttendance: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { students, attendance } = state;
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loadedStudents, setLoadedStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    const handleLoadStudents = () => {
        const studentsInClass = students.filter(s => 
            s.class === selectedClass && 
            (selectedSection ? s.section.toLowerCase() === selectedSection.toLowerCase() : true)
        );
        setLoadedStudents(studentsInClass);
        
        const existingRecords = attendance[selectedDate] || [];
        const recordsForClass = studentsInClass.map(student => {
            const existing = existingRecords.find(r => r.studentId === student.id);
            return existing || { studentId: student.id, status: ATTENDANCE_STATUSES[0], remarks: '' };
        });
        setAttendanceRecords(recordsForClass);
    };
    
    const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
        setAttendanceRecords(prev => prev.map(rec => rec.studentId === studentId ? { ...rec, status } : rec));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAttendanceRecords(prev => prev.map(rec => rec.studentId === studentId ? { ...rec, remarks } : rec));
    };
    
    const handleSaveAttendance = () => {
        dispatch({ type: 'SAVE_ATTENDANCE', payload: { date: selectedDate, records: attendanceRecords }});
        alert('Attendance saved successfully!');
    };
    
    const attendanceSummary = useMemo(() => {
        const summary = { total: loadedStudents.length, present: 0, absent: 0, late: 0, excused: 0 };
        attendanceRecords.forEach(rec => {
            if (rec.status === 'Present') summary.present++;
            else if (rec.status === 'Absent') summary.absent++;
            else if (rec.status === 'Late') summary.late++;
            else if (rec.status === 'Excused') summary.excused++;
        });
        return summary;
    }, [attendanceRecords, loadedStudents]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
                <p className="text-gray-600">Take daily attendance for any class.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Select Class and Date</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Select Class</option>
                            {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section (Optional)</label>
                        <input type="text" placeholder="e.g. A, B, C" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <button onClick={handleLoadStudents} disabled={!selectedClass || !selectedDate} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-400">
                        Load Students
                    </button>
                </div>
            </div>

            {loadedStudents.length > 0 && (
                 <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold">
                            Attendance for {selectedClass} {selectedSection} - {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleSaveAttendance} className="inline-flex items-center px-4 py-2 bg-brand-purple text-white font-semibold rounded-lg hover:bg-indigo-700">
                            <Save size={16} className="mr-2" /> Save Attendance
                        </button>
                    </div>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <AttendanceStat label="Total" value={attendanceSummary.total} color="bg-blue-100 text-blue-800" />
                        <AttendanceStat label="Present" value={attendanceSummary.present} color="bg-green-100 text-green-800" />
                        <AttendanceStat label="Absent" value={attendanceSummary.absent} color="bg-red-100 text-red-800" />
                        <AttendanceStat label="Late" value={attendanceSummary.late} color="bg-yellow-100 text-yellow-800" />
                        <AttendanceStat label="Excused" value={attendanceSummary.excused} color="bg-gray-200 text-gray-800" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loadedStudents.map(student => {
                                    const record = attendanceRecords.find(r => r.studentId === student.id);
                                    if (!record) return null;
                                    return (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.rollNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.fullName}</td>
                                            <td className="px-6 py-4">
                                                <select value={record.status} onChange={e => handleStatusChange(student.id, e.target.value as AttendanceRecord['status'])} className="w-full p-1 border border-gray-300 rounded-md">
                                                    {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="text" value={record.remarks} onChange={e => handleRemarksChange(student.id, e.target.value)} placeholder="Optional remarks" className="w-full p-1 border border-gray-300 rounded-md" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default TeacherAttendance;