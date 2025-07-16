
import React, { createContext, useReducer, Dispatch, ReactNode } from 'react';
import type { User, Student, Teacher, Announcement, SchoolEvent, TransportRoute, Exam, AttendanceRecord } from '../types';
import { Role } from '../types';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_ADMIN, MOCK_ANNOUNCEMENTS, MOCK_EVENTS, MOCK_TRANSPORT_ROUTES, MOCK_EXAMS, MOCK_ATTENDANCE } from '../data/mock';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppState {
  user: User | null;
  students: Student[];
  teachers: Teacher[];
  announcements: Announcement[];
  events: SchoolEvent[];
  transportRoutes: TransportRoute[];
  exams: Exam[];
  attendance: { [date: string]: AttendanceRecord[] };
}

type Action =
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
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
  | { type: 'SAVE_ATTENDANCE'; payload: { date: string; records: AttendanceRecord[] } };


const initialState: AppState = {
  user: null,
  students: MOCK_STUDENTS,
  teachers: MOCK_TEACHERS,
  announcements: MOCK_ANNOUNCEMENTS,
  events: MOCK_EVENTS,
  transportRoutes: MOCK_TRANSPORT_ROUTES,
  exams: MOCK_EXAMS,
  attendance: MOCK_ATTENDANCE,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
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
    default:
      return state;
  }
};

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [storedState, setStoredState] = useLocalStorage<AppState>('mmps-app-state', initialState);

    const reducer = (state: AppState, action: Action): AppState => {
        const newState = appReducer(state, action);
        if (action.type === 'LOGIN') {
            setStoredState({ ...newState, user: action.payload.user });
        } else if (action.type === 'LOGOUT') {
            setStoredState({ ...initialState, user: null});
        } else {
            setStoredState(newState);
        }
        return newState;
    };
  
    const [state, dispatch] = useReducer(reducer, storedState);
  
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
  };
