
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Megaphone, ChevronLeft } from '../../components/ui/Icons';
import { Link } from 'react-router-dom';

const AnnouncementsPage: React.FC = () => {
    const { state } = useAppContext();
    const { announcements } = state;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center py-8">
                <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-orange-100">
                    <Megaphone className="w-8 h-8 text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
                <p className="text-lg text-gray-600 mt-2">Latest news and updates from the school.</p>
                 <div className="mt-6">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-purple hover:text-indigo-800">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <div className="space-y-6">
                {announcements.length > 0 ? (
                    announcements.map(ann => (
                        <div key={ann.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-purple">
                            <p className="text-sm text-gray-500 mb-1">{new Date(ann.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; <span className="font-semibold">{ann.category}</span></p>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{ann.title}</h2>
                            <p className="text-gray-600">{ann.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">No announcements found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;
