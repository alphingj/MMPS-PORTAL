

import { supabase } from './supabaseClient';
import type { Student, Teacher, Announcement, SchoolEvent, TransportRoute, Exam, Role, AttendanceRecord, BusStop, Result, TeacherPermissions } from '../types';

// Helper to convert Supabase data (snake_case) to our frontend types (camelCase)
const fromSupabase = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(item => fromSupabase(item));
    }
    const camelCaseObject: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
            camelCaseObject[camelKey] = fromSupabase(data[key]);
        }
    }
    return camelCaseObject;
};


// Helper to convert our frontend types (camelCase) to Supabase data (snake_case)
const toSupabase = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(item => toSupabase(item));
    }
    const snakeCaseObject: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            snakeCaseObject[snakeKey] = toSupabase(data[key]);
        }
    }
    return snakeCaseObject;
};


// --- Auth ---

export const loginUser = async (username: string, password: string) => {
    let email = '';

    // Securely find the email associated with the provided username
    if (username === 'principal') {
        // As per the setup guide, the admin user 'principal' has a known email.
        email = 'principal@mmps';
    } else {
        // Look for the username in teachers table
        const { data: teacher, error: teacherError } = await supabase.from('teachers').select('email').eq('username', username).single();
        if (teacher) {
            email = teacher.email;
        } else if (!teacherError || teacherError.code === 'PGRST116') { // PGRST116: No rows found
            // If not a teacher, look in students table
            const { data: student, error: studentError } = await supabase.from('students').select('email').eq('roll_number', username).single();
            if (student) {
                email = student.email;
            } else if (studentError && studentError.code !== 'PGRST116') {
                 throw studentError;
            }
        } else {
            throw teacherError;
        }
    }

    if (!email) {
        throw new Error("Username not found.");
    }

    // Attempt to sign in with the found email
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) throw new Error("Invalid username or password."); // Generic error for security
    return data.user;
};

export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return fromSupabase(data);
}

// --- Students ---

export const getStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as Student[];
};

export const addStudent = async (studentData: Partial<Student>): Promise<Student | null> => {
    if (!studentData.email || !studentData.password) {
        throw new Error("Email and password are required to create a new student login.");
    }

    // 1. Create the auth user securely via Edge Function
    const { data: authData, error: authError } = await supabase.functions.invoke('manage-user', {
        body: { action: 'CREATE', userData: { email: studentData.email, password: studentData.password } },
    });
    if (authError || authData.error) throw new Error(authError?.message || authData.error.message);
    const newAuthUser = authData;

    // 2. Create the student profile record
    const { password, ...publicStudentData } = studentData;
    const studentPayload = toSupabase({ ...publicStudentData, userId: newAuthUser.id });
    const { data, error } = await supabase.from('students').insert([studentPayload] as any).select().single();
    if (error) {
        // Cleanup failed user creation
        await supabase.functions.invoke('manage-user', { body: { action: 'DELETE', userData: { id: newAuthUser.id } } });
        throw error;
    }
    
    // 3. Create the generic profile record
    await supabase.from('profiles').insert([{ id: newAuthUser.id, username: studentData.rollNumber!, full_name: studentData.fullName!, role: 'student' as Role }] as any);

    return fromSupabase(data) as Student;
};

export const updateStudent = async (studentData: Student): Promise<Student | null> => {
    // 1. Update the auth user if password or email is changed
    if (studentData.password || studentData.email) {
        const { error: authError } = await supabase.functions.invoke('manage-user', {
            body: { action: 'UPDATE', userData: { id: studentData.userId, email: studentData.email, password: studentData.password } },
        });
        if (authError) throw authError;
    }
    
    // 2. Update the public student record
    const { password, ...publicStudentData } = studentData;
    const { data, error } = await supabase.from('students').update(toSupabase(publicStudentData) as any).eq('id', studentData.id).select().single();
    if (error) throw error;

    // 3. Update the profile record
    await supabase.from('profiles').update({ username: studentData.rollNumber, full_name: studentData.fullName } as any).eq('id', studentData.userId as string);

    return fromSupabase(data) as Student;
};

export const deleteStudent = async (student: Student) => {
    // 1. Delete the student record from the public table
    const { error: studentError } = await supabase.from('students').delete().eq('id', student.id);
    if (studentError) throw studentError;

    // 2. Delete the auth user via edge function (this will cascade delete the profile)
    if (student.userId) {
        const { error: authError } = await supabase.functions.invoke('manage-user', {
            body: { action: 'DELETE', userData: { id: student.userId } },
        });
        if (authError) throw authError;
    }
};

// --- Teachers ---

// Helper to convert a flat teacher object from Supabase to a nested Teacher type for the app
const dbTeacherToAppTeacher = (dbTeacher: any): Teacher => {
    const teacher = fromSupabase(dbTeacher);
    
    // Group flat can_... properties into a nested permissions object
    const permissions: TeacherPermissions = {
        manageStudents: teacher.canManageStudents || false,
        manageTeachers: teacher.canManageTeachers || false,
        manageAnnouncements: teacher.canManageAnnouncements || false,
        manageEvents: teacher.canManageEvents || false,
        manageExams: teacher.canCreateExams || false,
        manageAttendance: teacher.canManageAttendance || false,
        viewAllResults: teacher.canViewAllResults || false,
        fullAdminAccess: teacher.fullAdminAccess || false,
    };
    
    // Clean up the flat properties to avoid confusion
    delete teacher.canManageStudents;
    delete teacher.canManageTeachers;
    delete teacher.canManageAnnouncements;
    delete teacher.canManageEvents;
    delete teacher.canCreateExams;
    delete teacher.canManageAttendance;
    delete teacher.canViewAllResults;
    delete teacher.fullAdminAccess;

    return { ...teacher, permissions };
};

// Helper to flatten the app's Teacher object for Supabase
const appTeacherToDbPayload = (teacherData: Partial<Teacher>): any => {
    const { permissions, ...rest } = teacherData;
    const flattenedData = { ...rest, ...permissions };
    
    const dbPayload = {
      ...flattenedData,
      ...(permissions && {
          canManageStudents: permissions.manageStudents,
          canManageTeachers: permissions.manageTeachers,
          canManageAnnouncements: permissions.manageAnnouncements,
          canManageEvents: permissions.manageEvents,
          canCreateExams: permissions.manageExams,
          canManageAttendance: permissions.manageAttendance,
          canViewAllResults: permissions.viewAllResults,
          fullAdminAccess: permissions.fullAdminAccess,
      }),
    };
    
    // Remove the frontend-only permission keys
    delete dbPayload.manageStudents;
    delete dbPayload.manageTeachers;
    delete dbPayload.manageAnnouncements;
    delete dbPayload.manageEvents;
    delete dbPayload.manageExams;
    delete dbPayload.manageAttendance;
    delete dbPayload.viewAllResults;
    delete dbPayload.fullAdminAccess;

    return toSupabase(dbPayload);
};


export const getTeachers = async (): Promise<Teacher[]> => {
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) throw error;
    if (!data) return [];
    return data.map(dbTeacherToAppTeacher);
};

export const addTeacher = async (teacherData: Partial<Teacher>): Promise<Teacher | null> => {
     if (!teacherData.email || !teacherData.password) {
        throw new Error("Email and password are required to create a new teacher login.");
    }
    const { data: authData, error: authError } = await supabase.functions.invoke('manage-user', {
        body: { action: 'CREATE', userData: { email: teacherData.email, password: teacherData.password } },
    });
    if (authError || authData.error) throw new Error(authError?.message || authData.error.message);
    const newAuthUser = authData;

    const { password, ...publicTeacherData } = teacherData;
    const teacherPayload = appTeacherToDbPayload({ ...publicTeacherData, userId: newAuthUser.id });

    const { data, error } = await supabase.from('teachers').insert([teacherPayload] as any).select().single();
    if (error) {
        await supabase.functions.invoke('manage-user', { body: { action: 'DELETE', userData: { id: newAuthUser.id } } });
        throw error;
    }
    
    await supabase.from('profiles').insert([{ id: newAuthUser.id, username: teacherData.username!, full_name: teacherData.fullName!, role: 'teacher' as Role }] as any);

    return dbTeacherToAppTeacher(data);
};

export const updateTeacher = async (teacherData: Teacher): Promise<Teacher | null> => {
    if (teacherData.password || teacherData.email) {
        const { error: authError } = await supabase.functions.invoke('manage-user', {
            body: { action: 'UPDATE', userData: { id: teacherData.userId, email: teacherData.email, password: teacherData.password } },
        });
        if (authError) throw authError;
    }

    const { password, ...publicTeacherData } = teacherData;
    const teacherPayload = appTeacherToDbPayload(publicTeacherData);

    const { data, error } = await supabase.from('teachers').update(teacherPayload as any).eq('id', teacherData.id).select().single();
    if (error) throw error;

    await supabase.from('profiles').update({ username: teacherData.username, full_name: teacherData.fullName } as any).eq('id', teacherData.userId as string);

    return dbTeacherToAppTeacher(data);
};

export const deleteTeacher = async (teacher: Teacher) => {
    const { error: teacherError } = await supabase.from('teachers').delete().eq('id', teacher.id);
    if (teacherError) throw teacherError;

    if (teacher.userId) {
        const { error: authError } = await supabase.functions.invoke('manage-user', {
            body: { action: 'DELETE', userData: { id: teacher.userId } },
        });
        if (authError) throw authError;
    }
};

// --- Announcements ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as Announcement[];
};

export const addAnnouncement = async (announcementData: Partial<Announcement>): Promise<Announcement | null> => {
    const { data, error } = await supabase.from('announcements').insert([toSupabase(announcementData)] as any).select().single();
    if (error) throw error;
    return fromSupabase(data) as Announcement;
};

export const updateAnnouncement = async (id: string, announcementData: Partial<Announcement>): Promise<Announcement | null> => {
    const { data, error } = await supabase.from('announcements').update(toSupabase(announcementData) as any).eq('id', id).select().single();
    if (error) throw error;
    return fromSupabase(data) as Announcement;
};

export const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
};


// --- Events ---
export const getEvents = async (): Promise<SchoolEvent[]> => {
    const { data, error } = await supabase.from('events').select('*').order('date_time', { ascending: true });
    if (error) throw error;
    if (!data) return [];
    const events = (fromSupabase(data) as any[]).map(e => {
        // Split timestamp into date and time for frontend
        if (e.dateTime) {
            const dt = new Date(e.dateTime);
            e.date = dt.toISOString().split('T')[0];
            e.time = dt.toTimeString().split(' ')[0].substring(0, 5);
        }
        return e as SchoolEvent;
    });
    return events;
};

export const addEvent = async (eventData: Partial<SchoolEvent>): Promise<SchoolEvent | null> => {
    const payload = { ...eventData };
    if (payload.date && payload.time) {
        (payload as any).dateTime = `${payload.date}T${payload.time}:00`;
        delete payload.date;
        delete payload.time;
    }
    const { data, error } = await supabase.from('events').insert([toSupabase(payload)] as any).select().single();
    if (error) throw error;
    return fromSupabase(data) as SchoolEvent;
};

export const updateEvent = async (id: string, eventData: Partial<SchoolEvent>): Promise<SchoolEvent | null> => {
    const payload = { ...eventData };
    if (payload.date && payload.time) {
        (payload as any).dateTime = `${payload.date}T${payload.time}:00`;
        delete payload.date;
        delete payload.time;
    }
    const { data, error } = await supabase.from('events').update(toSupabase(payload) as any).eq('id', id).select().single();
    if (error) throw error;
    return fromSupabase(data) as SchoolEvent;
};

export const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
};

// --- Transport Routes ---
export const getTransportRoutes = async (): Promise<TransportRoute[]> => {
    const { data, error } = await supabase.from('transport_routes').select('*, stops:bus_stops(*)');
    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as TransportRoute[];
};

export const addTransportRoute = async (routeData: Partial<TransportRoute>): Promise<TransportRoute | null> => {
    const { stops, ...routeDetails } = routeData;
    const { data: newRoute, error: routeError } = await supabase.from('transport_routes').insert([toSupabase(routeDetails)] as any).select().single();
    if (routeError) throw routeError;

    if (stops && newRoute) {
        const stopsToInsert = stops.map(s => toSupabase({ stopName: s.name, stopTime: s.time, routeId: newRoute.id }));
        const { error: stopsError } = await supabase.from('bus_stops').insert(stopsToInsert as any);
        if (stopsError) throw stopsError;
    }
    const {data: finalData, error: finalError} = await supabase.from('transport_routes').select('*, stops:bus_stops(*)').eq('id', newRoute.id).single();
    if(finalError) throw finalError;
    return fromSupabase(finalData) as TransportRoute;
};

export const updateTransportRoute = async (id: string, routeData: Partial<TransportRoute>): Promise<TransportRoute | null> => {
    const { stops, ...routeDetails } = routeData;
    const { data: updatedRoute, error: routeError } = await supabase.from('transport_routes').update(toSupabase(routeDetails) as any).eq('id', id).select().single();
    if (routeError) throw routeError;

    if (stops && updatedRoute) {
        // Simple approach: delete old stops and insert new ones
        await supabase.from('bus_stops').delete().eq('route_id', id);
        const stopsToInsert = stops.map(s => toSupabase({ stopName: s.name, stopTime: s.time, routeId: id }));
        const { error: stopsError } = await supabase.from('bus_stops').insert(stopsToInsert as any);
        if (stopsError) throw stopsError;
    }
    const {data: finalData, error: finalError} = await supabase.from('transport_routes').select('*, stops:bus_stops(*)').eq('id', updatedRoute.id).single();
    if(finalError) throw finalError;
    return fromSupabase(finalData) as TransportRoute;
};

export const deleteTransportRoute = async (id: string) => {
    const { error } = await supabase.from('transport_routes').delete().eq('id', id); // Cascade delete will handle stops
    if (error) throw error;
};


// --- Exams ---
export const getExams = async (): Promise<Exam[]> => {
    const { data, error } = await supabase.from('exams').select('*');
    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as Exam[];
};

export const addExam = async (examData: Partial<Exam>): Promise<Exam | null> => {
    const { data, error } = await supabase.from('exams').insert([toSupabase(examData)] as any).select().single();
    if (error) throw error;
    return fromSupabase(data) as Exam;
};

export const updateExam = async (id: string, examData: Partial<Exam>): Promise<Exam | null> => {
    const { data, error } = await supabase.from('exams').update(toSupabase(examData) as any).eq('id', id).select().single();
    if (error) throw error;
    return fromSupabase(data) as Exam;
};

export const deleteExam = async (id: string) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
};

// --- Attendance ---
export const getAttendance = async (date: string, studentIds: string[]): Promise<AttendanceRecord[]> => {
    if (studentIds.length === 0) return [];
    const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status, remarks')
        .eq('date', date)
        .in('student_id', studentIds);

    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as AttendanceRecord[];
};

export const saveAttendance = async (date: string, records: AttendanceRecord[]) => {
    const payload = records.map(r => toSupabase({ ...r, date, studentId: r.studentId }));
    const { error } = await supabase.from('attendance').upsert(payload as any, { onConflict: 'student_id, date' });
    if (error) throw error;
};

// --- Results ---
export const getResults = async (): Promise<Result[]> => {
    const { data, error } = await supabase.from('results').select('*');
    if (error) throw error;
    if (!data) return [];
    return fromSupabase(data) as Result[];
};

export const saveResults = async (resultsData: Omit<Result, 'id'>[]): Promise<Result[]> => {
    const payload = resultsData.map(r => toSupabase(r));
    const { data, error } = await supabase.from('results').upsert(payload as any, { onConflict: 'student_id, exam_id' }).select();
    if (error) throw error;
    return fromSupabase(data) as Result[];
};