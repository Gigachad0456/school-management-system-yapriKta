import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import Modal from '../components/Modal';
import { Plus, Calendar, Users, Edit2, Trash2, AlertTriangle } from 'lucide-react';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        audience: 'ALL'
    });

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('notices/');
            setNotices(response.data);
        } catch (error) {
            console.error("Failed to fetch notices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (notice = null) => {
        if (notice) {
            setEditingId(notice.id);
            setFormData({
                title: notice.title,
                description: notice.description,
                audience: notice.audience
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                audience: 'ALL'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.patch(`notices/${editingId}/`, formData);
            } else {
                await axiosInstance.post('notices/', formData);
            }
            setIsModalOpen(false);
            fetchNotices();
        } catch (error) {
            alert("Failed to save notice.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axiosInstance.delete(`notices/${deleteConfirmId}/`);
            setDeleteConfirmId(null);
            fetchNotices();
        } catch (error) {
            alert("Failed to delete notice.");
        }
    };

    if (loading) {
        return <div className="animate-pulse flex space-y-4 flex-col"><div className="h-32 bg-gray-200 rounded-xl w-full"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Notice Board</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Notice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(notice)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(notice.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex justify-between items-start mb-4 pr-16">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{notice.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 flex-1">{notice.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 mt-auto">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(notice.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                <Users className="w-3.5 h-3.5" />
                                {notice.audience}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {notices.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
                    <p className="text-gray-500">No notices available.</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Notice" : "New Notice"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            required 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            required 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none resize-none" 
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                        <select 
                            name="audience" 
                            value={formData.audience} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                        >
                            <option value="ALL">All Users</option>
                            <option value="TEACHERS">Teachers Only</option>
                            <option value="STUDENTS">Students & Parents Only</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Publish Notice</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Notice?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. The notice will be permanently removed from the notice board.
                    </p>
                    <div className="flex justify-center gap-3 w-full">
                        <button 
                            onClick={() => setDeleteConfirmId(null)} 
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Notices;
