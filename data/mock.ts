import type { Student, Teacher, Announcement, SchoolEvent, TransportRoute, Exam, AttendanceRecord } from '../types';
import { Role } from '../types';

export const MOCK_STUDENTS: Student[] = [
    { id: 's1', rollNumber: '2024001', fullName: 'Arjun Nair', class: 'Class 10', section: 'A', parentName: 'Rajesh Nair', parentPhone: '+91 9876543210', address: '123 Palm Grove, Kerala', dateOfBirth: '2008-05-15', admissionDate: '2015-06-01', status: 'active' },
    { id: 's2', rollNumber: '2024002', fullName: 'Priya Sharma', class: 'Class 9', section: 'B', parentName: 'Suresh Sharma', parentPhone: '+91 9876543211', address: '456 Lake View, Kerala', dateOfBirth: '2009-02-20', admissionDate: '2016-06-01', status: 'active' },
    { id: 's3', rollNumber: '2024003', fullName: 'Siddharth Kumar', class: 'Class 8', section: 'B', parentName: 'Anjali Kumar', parentPhone: '+91 9876543212', address: '789 Temple Street, Kadaplamattom', dateOfBirth: '2010-03-10', admissionDate: '2017-06-01', status: 'active' },
    { id: 's4', rollNumber: '2024004', fullName: 'Kiran Kumar', class: 'Class 8', section: 'A', parentName: 'Mohan Kumar', parentPhone: '+91 9876543213', address: '321 River Side, Kerala', dateOfBirth: '2010-07-22', admissionDate: '2017-06-01', status: 'active' },
];

export const MOCK_TEACHERS: Teacher[] = [
    {
        id: 't1',
        employeeId: 'T001',
        fullName: 'Anil George',
        subject: 'Physical Education',
        phone: '+91 9876543220',
        email: 'anil.george@mmps.edu',
        qualification: 'B.P.Ed',
        experience: 8,
        joiningDate: '2020-06-01',
        username: 'anil.pe',
        status: 'active',
        permissions: {
            manageStudents: false,
            manageTeachers: false,
            manageAnnouncements: false,
            manageEvents: false,
            manageExams: true,
            manageAttendance: true,
            viewAllResults: false,
            fullAdminAccess: false,
        },
    },
];

export const MOCK_ADMIN = {
    id: 'a1',
    name: 'Moby Mathew',
    role: Role.Admin,
    username: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin'
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann1', title: 'Welcome to New Academic Year 2025-26', content: 'We welcome all students and parents to the new academic year.', date: '2025-07-08', category: 'General', priority: 'High', targetAudience: 'All' },
    { id: 'ann2', title: 'Science Fair Postponed', content: 'The annual science fair has been postponed to next Friday.', date: '2025-07-05', category: 'Academic', priority: 'Medium', targetAudience: 'Students' },
];

export const MOCK_EVENTS: SchoolEvent[] = [
    { id: 'evt1', title: 'Annual Sports Day', description: 'Inter-house sports competition with various track and field events for all classes.', category: 'Sports', date: '2025-02-15', time: '8:00 AM - 4:00 PM', venue: 'School Sports Ground', status: 'active' },
    { id: 'evt2', title: 'Republic Day Celebration', description: 'Flag hoisting ceremony and cultural programs to celebrate Republic Day.', category: 'Celebration', date: '2025-01-26', time: '9:00 AM - 10:00 AM', venue: 'School Playground', status: 'active' },
    { id: 'evt3', title: 'Parent-Teacher Meeting', description: 'Quarterly meeting to discuss student progress and concerns.', category: 'Meeting', date: '2025-01-25', time: '9:00 AM - 12:00 PM', venue: 'Individual Classrooms', status: 'active' },
];

export const MOCK_TRANSPORT_ROUTES: TransportRoute[] = [
    {
        id: 'tr1', routeNumber: 'R002', routeName: 'Ettumanoor - Kottayam Route', driverName: 'Sunil Kumar', driverPhone: '+91 9876543231', vehicleNumber: 'KL-05-CD-5678', monthlyFee: 1500, status: 'active',
        stops: [
            { id: 's1', name: 'Ettumanoor', time: '07:10 AM' },
            { id: 's2', name: 'Kumarakom', time: '07:25 AM' },
            { id: 's3', name: 'Kottayam Town', time: '07:40 AM' },
            { id: 's4', name: 'MMPS School', time: '07:50 AM' },
        ]
    },
    {
        id: 'tr2', routeNumber: '01', routeName: 'Kadaplamattom - Cherpunkal', driverName: 'Name1', driverPhone: '+91 9876543230', vehicleNumber: 'KL-05-AB-1234', monthlyFee: 900, status: 'active',
        stops: [
            { id: 'st1', name: 'Kadaplamattom', time: '07:45 AM' },
            { id: 'st2', name: 'Cherpunkal', time: '08:10 AM' },
            { id: 'st3', name: 'MMPS School', time: '08:20 AM' },
        ]
    },
];

export const MOCK_EXAMS: Exam[] = [];

export const MOCK_ATTENDANCE: { [date: string]: AttendanceRecord[] } = {
    '2025-07-15': [
        { studentId: 's3', status: 'Present', remarks: '' },
        { studentId: 's4', status: 'Present', remarks: '' }
    ]
};