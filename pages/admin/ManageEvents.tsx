import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SchoolEvent } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Search, Plus, Edit, Trash2, Calendar } from '../../components/ui/Icons';
import { EVENT_CATEGORIES } from '../../constants';

const EventForm = ({ event, onSave, onCancel }: { event?: SchoolEvent | null, onSave: (data: Partial<SchoolEvent>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<SchoolEvent>>(
        event || {
            title: '',
            category: EVENT_CATEGORIES[0],
            date: '',
            time: '',
            venue: '',
            description: '',
            status: 'active'
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Event Title" name="title" value={formData.title} onChange={handleChange} required />
                <Select label="Category" name="category" value={formData.category} onChange={handleChange} options={EVENT_CATEGORIES} />
                <Input label="Event Date" name="date" type="date" value={formData.date} onChange={handleChange} />
                <Input label="Time" name="time" placeholder="e.g., 10:00 AM - 12:00 PM" value={formData.time} onChange={handleChange} />
            </div>
            <Input label="Venue" name="venue" placeholder="e.g., School Auditorium, Sports Ground" value={formData.venue} onChange={handleChange} />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Event</button>
            </div>
        </form>
    );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
        <input {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
    </div>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[] }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
        <select {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm">
            {props.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ManageEvents: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { events } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = useMemo(() => {
        return events.filter(e =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.venue.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [events, searchQuery]);

    const handleAdd = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (event: SchoolEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            dispatch({ type: 'DELETE_EVENT', payload: id });
        }
    };
    
    const handleSave = (data: Partial<SchoolEvent>) => {
        if (editingEvent) {
            dispatch({ type: 'UPDATE_EVENT', payload: { ...editingEvent, ...data } as SchoolEvent });
        } else {
            const newEvent: SchoolEvent = {
                id: `evt${Date.now()}`,
                status: 'active',
                ...data
            } as SchoolEvent;
            dispatch({ type: 'ADD_EVENT', payload: newEvent });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
                <p className="text-gray-600">Create and manage school events and activities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, category, or venue..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                        <Plus size={20} className="mr-2" />
                        Create Event
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                {['Event Title', 'Category', 'Date & Time', 'Venue', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredEvents.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(event.date).toLocaleDateString('en-CA')} {event.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.venue}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuItem onClick={() => handleEdit(event)}><Edit size={16} className="mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-red-600"><Trash2 size={16} className="mr-2" /> Delete Permanently</DropdownMenuItem>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredEvents.length === 0 && <p className="text-center text-gray-500 py-8">No events found.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Create New Event'} size="lg">
                <EventForm event={editingEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ManageEvents;
