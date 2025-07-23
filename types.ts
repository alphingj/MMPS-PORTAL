
export enum Role {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  avatar?: string;
  permissions?: TeacherPermissions;
}

export interface Student {
    id: string;
    rollNumber: string; // Used as the login username
    fullName: string;
    email: string; // Required for the auth user
    password?: string; // For setting/updating password from admin form
    class: string;
    section: string;
    parentName: string;
    parentPhone: string;
    address: string;
    dateOfBirth: string;
    admissionDate: string;
    status: 'active' | 'inactive';
    userId?: string;
}

export interface TeacherPermissions {
    manageStudents: boolean;
    manageTeachers: boolean;
    manageAnnouncements: boolean;
    manageEvents: boolean;
    manageExams: boolean;
    manageAttendance: boolean;
    viewAllResults: boolean;
    fullAdminAccess: boolean;
}

export interface Teacher {
    id: string;
    employeeId: string;
    username: string; // The login username
    fullName: string;
    email: string; // Required for the auth user
    password?: string; // For setting/updating password from admin form
    subject: string;
    phone: string;
    qualification: string;
    experience: number;
    joiningDate: string;
    status: 'active' | 'inactive';
    permissions: TeacherPermissions;
    userId?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    category: 'General' | 'Academic' | 'Fees' | 'Event' | 'Holiday' | 'Urgent';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    targetAudience: 'All' | 'Parents' | 'Teachers' | 'Students';
}

export interface SchoolEvent {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    status: 'active' | 'inactive';
}

export interface BusStop {
    id: string;
    name: string;
    time: string;
}

export interface TransportRoute {
    id: string;
    routeNumber: string;
    routeName: string;
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    monthlyFee: number;
    status: 'active' | 'inactive';
    stops: BusStop[];
}

export interface Exam {
    id: string;
    name: string;
    subject: string;
    class: string;
    section: string;
    date: string;
    maxMarks: number;
    type: 'Weekly Test' | 'Monthly Test' | 'Unit Test' | 'Quarterly Exam' | 'Half Yearly Exam' | 'Annual Exam';
    createdByTeacherId?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
    studentId: string;
    status: AttendanceStatus;
    remarks: string;
}

export interface Result {
    id: string;
    studentId: string;
    examId: string;
    marksObtained: number;
}