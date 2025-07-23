
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TransportRoute, BusStop } from '../../types';
import Modal from '../../components/ui/Modal';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Search, Plus, Edit, Trash2 } from '../../components/ui/Icons';
import * as api from '../../services/api';

const RouteForm = ({ route, onSave, onCancel }: { route?: TransportRoute | null, onSave: (data: Partial<TransportRoute>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<TransportRoute>>(
        route || {
            routeNumber: '',
            routeName: '',
            driverName: '',
            driverPhone: '',
            vehicleNumber: '',
            monthlyFee: 0,
            status: 'active',
            stops: [{ id: `stop${Date.now()}`, name: '', time: '' }],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData({ ...formData, [name]: parseInt(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleStopChange = (index: number, field: keyof Omit<BusStop, 'id'>, value: string) => {
        const updatedStops = [...(formData.stops || [])];
        const stopToUpdate = { ...updatedStops[index] };
        (stopToUpdate as any)[field] = value;
        updatedStops[index] = stopToUpdate;
        setFormData({ ...formData, stops: updatedStops });
    };

    const addStop = () => {
        const newStop: BusStop = { id: `stop${Date.now()}`, name: '', time: '' };
        setFormData({ ...formData, stops: [...(formData.stops || []), newStop] });
    };

    const removeStop = (index: number) => {
        const updatedStops = [...(formData.stops || [])];
        updatedStops.splice(index, 1);
        setFormData({ ...formData, stops: updatedStops });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Route Number" name="routeNumber" value={formData.routeNumber} onChange={handleChange} required />
                <Input label="Route Name" name="routeName" value={formData.routeName} onChange={handleChange} />
                <Input label="Driver Name" name="driverName" value={formData.driverName} onChange={handleChange} />
                <Input label="Driver Phone" name="driverPhone" value={formData.driverPhone} onChange={handleChange} />
                <Input label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} />
                <Input label="Monthly Fee (₹)" name="monthlyFee" type="number" value={formData.monthlyFee} onChange={handleChange} />
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bus Stops & Timings</h3>
                <div className="space-y-2">
                {(formData.stops || []).map((stop, index) => (
                    <div key={stop.id || index} className="flex items-center gap-2">
                        <input type="text" placeholder="Stop name" value={stop.name} onChange={e => handleStopChange(index, 'name', e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="text" placeholder="e.g., 7:30 AM" value={stop.time} onChange={e => handleStopChange(index, 'time', e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-md" />
                        <button type="button" onClick={() => removeStop(index)} className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">Remove</button>
                    </div>
                ))}
                </div>
                <button type="button" onClick={addStop} className="mt-2 px-3 py-1 border border-dashed border-gray-400 text-sm text-gray-600 rounded-md hover:bg-gray-100">Add Stop</button>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-indigo-700">Save Route</button>
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


const ManageTransport: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { transportRoutes } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRoutes = useMemo(() => {
        return transportRoutes.filter(r =>
            r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.driverName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transportRoutes, searchQuery]);

    const handleAdd = () => {
        setEditingRoute(null);
        setIsModalOpen(true);
    };

    const handleEdit = (route: TransportRoute) => {
        setEditingRoute(route);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this transport route?')) {
            try {
                await api.deleteTransportRoute(id);
                dispatch({ type: 'DELETE_ROUTE', payload: id });
            } catch (error) {
                console.error("Failed to delete route:", error);
                alert("Error: Could not delete route.");
            }
        }
    };
    
    const handleSave = async (data: Partial<TransportRoute>) => {
        try {
            if (editingRoute) {
                const updated = await api.updateTransportRoute(editingRoute.id, data);
                if (updated) dispatch({ type: 'UPDATE_ROUTE', payload: updated });
            } else {
                const newRoute = await api.addTransportRoute(data);
                if (newRoute) dispatch({ type: 'ADD_ROUTE', payload: newRoute });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save route:", error);
            alert("Error: Could not save route.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Transport</h1>
                <p className="text-gray-600">Manage school bus routes, drivers, and schedules.</p>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow">
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by route number, name, or driver..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">
                        <Plus size={20} className="mr-2" />
                        Add Route
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                {['Route No.', 'Route Name', 'Driver', 'Vehicle', 'Fee', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredRoutes.map(route => (
                                <tr key={route.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.routeNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.routeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{route.driverName}</div>
                                        <div className="text-xs text-gray-400">{route.driverPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vehicleNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{route.monthlyFee}/month</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {route.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuItem onClick={() => handleEdit(route)}><Edit size={16} className="mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(route.id)} className="text-red-600"><Trash2 size={16} className="mr-2" /> Delete</DropdownMenuItem>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredRoutes.length === 0 && <p className="text-center text-gray-500 py-8">No transport routes found.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoute ? 'Edit Route' : 'Add New Route'} size="xl">
                <RouteForm route={editingRoute} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ManageTransport;
