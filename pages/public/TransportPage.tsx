
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Bus, Clock, User, ChevronLeft } from '../../components/ui/Icons';
import { Link } from 'react-router-dom';

const TransportPage: React.FC = () => {
    const { state } = useAppContext();
    const { transportRoutes } = state;

    return (
        <div className="max-w-6xl mx-auto">
            <header className="text-center py-8">
                 <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-blue-100">
                    <Bus className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">School Transport</h1>
                <p className="text-lg text-gray-600 mt-2">Bus routes, timings, and contact information.</p>
                <div className="mt-6">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-brand-purple hover:text-indigo-800">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {transportRoutes.map(route => (
                    <div key={route.id} className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800">{`Route ${route.routeNumber}`}</h2>
                        <p className="text-md text-gray-500 mb-4">{route.routeName}</p>
                        
                        <div className="space-y-2 text-sm mb-6">
                            <p className="flex items-center text-gray-600"><strong className="w-24">Vehicle:</strong> {route.vehicleNumber}</p>
                            <p className="flex items-center text-gray-600"><strong className="w-24">Driver:</strong> {route.driverName}</p>
                            <p className="flex items-center text-gray-600"><strong className="w-24">Phone:</strong> {route.driverPhone}</p>
                            <p className="flex items-center text-gray-600"><strong className="w-24">Monthly Fee:</strong> ₹{route.monthlyFee}</p>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-3">Bus Stops & Timings</h3>
                        <div className="relative">
                            <div className="absolute left-2.5 h-full border-l-2 border-dashed border-gray-300"></div>
                            <ul className="space-y-4">
                                {route.stops.map(stop => (
                                    <li key={stop.id} className="flex items-center">
                                        <div className="w-5 h-5 bg-white border-2 border-brand-purple rounded-full z-10"></div>
                                        <span className="ml-4 font-medium text-gray-700 flex-1">{stop.name}</span>
                                        <span className="flex items-center text-sm text-gray-500">
                                            <Clock size={14} className="mr-1.5" />
                                            {stop.time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransportPage;
