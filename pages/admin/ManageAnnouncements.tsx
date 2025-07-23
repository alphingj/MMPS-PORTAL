
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Announcement } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Plus, Edit, Trash2 } from '../../components/ui/Icons';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_AUDIENCES } from '../../constants';
import * as api from '../../services/api';

const AnnouncementForm = ({ announcement, onSave, onCancel }: { announcement?: Announcement | null, onSave: (data: Partial<Announcement>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Announcement>>(
        announcement || {
            title: '',
            content: '',
            category: 'General',
            priority: 'Medium',
            targetAudience: 'All',
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
            <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={4} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Category" name="category" value={formData.category} onChange={handleChange} options={ANNOUNCEMENT_CATEGORIES} />
                <Select label="Priority" name="priority" value={formData.priority} onChange={handleChange} options={ANNOUNCEMENT_PRIORITIES} />
                <Select label="Target Audience" name="targetAudience" value={formData.targetAudience} onChange={handleChange} options={ANNOUNCEMENT_AUDIENCES} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Announcement</button>
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

const ManageAnnouncements: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { announcements } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const handleAdd = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await api.deleteAnnouncement(id);
                dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: id });
            } catch (error) {
                console.error("Failed to delete announcement:", error);
                alert("Error: Could not delete announcement.");
            }
        }
    };

    const handleSave = async (data: Partial<Announcement>) => {
        try {
            if (editingAnnouncement) {
                const updated = await api.updateAnnouncement(editingAnnouncement.id, data);
                if (updated) dispatch({ type: 'UPDATE_ANNOUNCEMENT', payload: updated });
            } else {
                const newAnnouncement = await api.addAnnouncement({
                    date: new Date().toISOString().split('T')[0],
                    ...data
                });
                if (newAnnouncement) dispatch({ type: 'ADD_ANNOUNCEMENT', payload: newAnnouncement });
            }
            setIsModalOpen(false);
        } catch(error) {
             console.error("Failed to save announcement:", error);
             alert("Error: Could not save announcement.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Announcements</h1>
                    <p className="text-gray-600">Create, publish, and manage school-wide announcements.</p>
                </div>
                <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                    <Plus size={20} className="mr-2" />
                    New Announcement
                </button>
            </div>

            <div className="space-y-4">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{ann.title}</h2>
                            <p className="text-sm text-gray-500">
                                {new Date(ann.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {ann.category} &middot; {ann.priority}
                            </p>
                            <p className="mt-2 text-gray-600">{ann.content}</p>
                            <p className="mt-2 text-xs font-medium text-gray-500">For: {ann.targetAudience}</p>
                        </div>
                         <div className="flex-shrink-0 ml-4">
                            <DropdownMenu>
                                <DropdownMenuItem onClick={() => handleEdit(ann)}>
                                    <Edit size={16} className="mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(ann.id)} className="text-red-600">
                                    <Trash2 size={16} className="mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
                 {announcements.length === 0 && <p className="text-center text-gray-500 py-8">No announcements found.</p>}
            </div>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                size="lg"
            >
                <AnnouncementForm
                    announcement={editingAnnouncement}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default ManageAnnouncements;
