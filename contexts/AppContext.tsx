
import React, { createContext, useReducer, Dispatch, ReactNode, useEffect, useState } from 'react';
import type { User, Student, Teacher, Announcement, SchoolEvent, TransportRoute, Exam, AttendanceRecord, Result } from '../types';
import * as api from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Role } from '../types';

interface AppState {
  appReady: boolean;
  user: User | null;
  students: Student[];
  teachers: Teacher[];
  announcements: Announcement[];
  events: SchoolEvent[];
  transportRoutes: TransportRoute[];
  exams: Exam[];
  attendance: { [date: string]: AttendanceRecord[] };
  results: Result[];
}

type Action =
  | { type: 'SET_INITIAL_DATA'; payload: Partial<AppState> }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string } // payload is studentId
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string } // payload is teacherId
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'UPDATE_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'DELETE_ANNOUNCEMENT'; payload: string }
  | { type: 'ADD_EVENT'; payload: SchoolEvent }
  | { type: 'UPDATE_EVENT'; payload: SchoolEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_ROUTE'; payload: TransportRoute }
  | { type: 'UPDATE_ROUTE'; payload: TransportRoute }
  | { type: 'DELETE_ROUTE'; payload: string }
  | { type: 'ADD_EXAM'; payload: Exam }
  | { type: 'UPDATE_EXAM'; payload: Exam }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'SAVE_ATTENDANCE'; payload: { date: string; records: AttendanceRecord[] } }
  | { type: 'SAVE_RESULTS'; payload: Result[] };

const initialState: AppState = {
  appReady: false,
  user: null,
  students: [],
  teachers: [],
  announcements: [],
  events: [],
  transportRoutes: [],
  exams: [],
  attendance: {},
  results: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
        return { ...state, ...action.payload, appReady: true };
    case 'LOGIN':
      return { ...state, user: action.payload.user };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STUDENT':
        return { ...state, students: state.students.filter(s => s.id !== action.payload) };
    case 'ADD_TEACHER':
        return { ...state, teachers: [...state.teachers, action.payload] };
    case 'UPDATE_TEACHER':
        return { ...state, teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TEACHER':
        return { ...state, teachers: state.teachers.filter(t => t.id !== action.payload) };
    case 'ADD_ANNOUNCEMENT':
        return { ...state, announcements: [action.payload, ...state.announcements] };
    case 'UPDATE_ANNOUNCEMENT':
        return { ...state, announcements: state.announcements.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ANNOUNCEMENT':
        return { ...state, announcements: state.announcements.filter(a => a.id !== action.payload) };
    case 'ADD_EVENT':
        return { ...state, events: [action.payload, ...state.events] };
    case 'UPDATE_EVENT':
        return { ...state, events: state.events.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EVENT':
        return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case 'ADD_ROUTE':
        return { ...state, transportRoutes: [...state.transportRoutes, action.payload] };
    case 'UPDATE_ROUTE':
        return { ...state, transportRoutes: state.transportRoutes.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_ROUTE':
        return { ...state, transportRoutes: state.transportRoutes.filter(r => r.id !== action.payload) };
    case 'ADD_EXAM':
        return { ...state, exams: [...state.exams, action.payload] };
    case 'UPDATE_EXAM':
        return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXAM':
        return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    case 'SAVE_ATTENDANCE':
        return { ...state, attendance: { ...state.attendance, [action.payload.date]: action.payload.records } };
    case 'SAVE_RESULTS': {
        const otherResults = state.results.filter(r => !action.payload.some(newR => newR.studentId === r.studentId && newR.examId === r.examId));
        return { ...state, results: [...otherResults, ...action.payload] };
    }
    default:
      return state;
  }
};

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [storedUser, setStoredUser] = useLocalStorage<User | null>('mmps-user', null);

    useEffect(() => {
        // On initial load, fetch all data from Supabase
        const fetchInitialData = async () => {
            try {
                const [students, teachers, announcements, events, transportRoutes, exams, results] = await Promise.all([
                    api.getStudents(),
                    api.getTeachers(),
                    api.getAnnouncements(),
                    api.getEvents(),
                    api.getTransportRoutes(),
                    api.getExams(),
                    api.getResults(),
                ]);
                dispatch({ type: 'SET_INITIAL_DATA', payload: { students, teachers, announcements, events, transportRoutes, exams, results } });
            } catch (error) {
                console.error("Failed to load initial data:", error);
                 dispatch({ type: 'SET_INITIAL_DATA', payload: {} }); // Still mark app as ready
            }
        };

        fetchInitialData();

        // Handle Supabase Auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                 const profile = await api.getProfile(session.user.id);
                 if (profile) {
                     const user: User = {
                         id: session.user.id,
                         name: profile.full_name || session.user.email || '',
                         username: profile.username || '',
                         role: profile.role as Role,
                     };
                     setStoredUser(user);
                     dispatch({ type: 'LOGIN', payload: { user }});
                 }
            } else if (event === 'SIGNED_OUT') {
                setStoredUser(null);
                dispatch({ type: 'LOGOUT' });
            }
        });
        
        // Restore user from local storage on initial load
        if (storedUser) {
            dispatch({ type: 'LOGIN', payload: { user: storedUser } });
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [setStoredUser]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {state.appReady ? children : <div className="flex items-center justify-center h-screen">Loading...</div>}
        </AppContext.Provider>
    );
};