
import React from 'react';

export const ALL_CLASSES = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const EXAM_TYPES = ['Weekly Test', 'Monthly Test', 'Unit Test', 'Quarterly Exam', 'Half Yearly Exam', 'Annual Exam'] as const;

export const ANNOUNCEMENT_CATEGORIES = ['General', 'Academic', 'Fees', 'Event', 'Holiday', 'Urgent'];
export const ANNOUNCEMENT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const ANNOUNCEMENT_AUDIENCES = ['All', 'Parents', 'Teachers', 'Students'];

export const EVENT_CATEGORIES = ['Academic', 'Sports', 'Celebration', 'Meeting', 'Competition'];

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Excused'] as const;

export const PERMISSIONS_LIST = [
    { id: 'manageStudents', label: 'Manage Students' },
    { id: 'manageTeachers', label: 'Manage Teachers' },
    { id: 'manageAnnouncements', label: 'Manage Announcements' },
    { id: 'manageEvents', label: 'Manage Events' },
    { id: 'viewAllResults', label: 'View All Results' },
    { id: 'manageAttendance', label: 'Manage Attendance' },
    { id: 'createExams', label: 'Create Exams' },
    { id: 'fullAdminAccess', label: 'Full Admin Access' },
];