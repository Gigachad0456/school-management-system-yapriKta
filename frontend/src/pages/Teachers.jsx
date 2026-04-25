import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const [formData, setFormData] = useState({
        username: '', password: '', first_name: '', last_name: '', email: '',
        subject: '', qualification: '', phone: '', address: '', status: true
    });

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('teachers/');
            setTeachers(response.data);
        } catch (error) {
            toast.error("Failed to fetch teachers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openModal = (teacher = null) => {
        if (teacher) {
            setEditingId(teacher.id);
            setFormData({
                username: teacher.user.username,
                password: '',
                first_name: teacher.user.first_name,
                last_name: teacher.user.last_name,
                email: teacher.user.email,
                subject: teacher.subject,
                qualification: teacher.qualification,
                phone: teacher.phone,
                address: teacher.address,
                status: teacher.status
            });
        } else {
            setEditingId(null);
            setFormData({
                username: '', password: '', first_name: '', last_name: '', email: '',
                subject: '', qualification: '', phone: '', address: '', status: true
            });
        }
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const teacher = teachers.find(t => t.id === deleteConfirmId);
            await axiosInstance.delete(`teachers/${deleteConfirmId}/`);
            if (teacher?.user?.id) {
                await axiosInstance.delete(`users/${teacher.user.id}/`);
            }
            setDeleteConfirmId(null);
            toast.success("Teacher deleted successfully");
            fetchTeachers();
        } catch (error) {
            toast.error("Error deleting teacher.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                role: 'TEACHER'
            };
            
            if (formData.password) {
                userData.password = formData.password;
            }

            let userId;

            if (editingId) {
                const teacher = teachers.find(t => t.id === editingId);
                await axiosInstance.patch(`users/${teacher.user.id}/`, userData);
                userId = teacher.user.id;
            } else {
                const userRes = await axiosInstance.post('users/', userData);
                userId = userRes.data.id;
            }

            const teacherData = {
                user_id: userId,
                subject: formData.subject,
                qualification: formData.qualification,
                phone: formData.phone,
                address: formData.address,
                status: formData.status
            };

            if (editingId) {
                await axiosInstance.patch(`teachers/${editingId}/`, teacherData);
            } else {
                await axiosInstance.post('teachers/', teacherData);
            }

            setIsModalOpen(false);
            toast.success(editingId ? "Teacher updated successfully" : "Teacher added successfully");
            fetchTeachers();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error saving teacher data. Make sure username is unique.");
        }
    };

    const columns = [
        { 
            header: 'Name', 
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-softgreen-100 text-softgreen-700 flex items-center justify-center font-bold text-xs">
                        {row.user?.first_name?.[0]}{row.user?.last_name?.[0]}
                    </div>
                    <span className="font-medium">{row.user?.first_name} {row.user?.last_name}</span>
                </div>
            )
        },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Qualification', accessor: 'qualification' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Email', cell: (row) => row.user?.email },
        { 
            header: 'Status', 
            cell: (row) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            ) 
        },
        {
            header: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openModal(row); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(row.id); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.user?.first_name} ${teacher.user?.last_name}`.toLowerCase();
        const subject = (teacher.subject || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || subject.includes(term);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Teacher
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or subject..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={filteredTeachers} 
                loading={loading} 
                itemsPerPage={8}
                exportName="Teachers"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Teacher" : "Add Teacher"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingId && '(Leave blank to keep)'}</label>
                            <input type="password" name="password" required={!editingId} value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <input required type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="w-4 h-4 text-navy-600 rounded border-gray-300 focus:ring-navy-500" />
                            <span className="text-sm font-medium text-gray-700">Active Status</span>
                        </label>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Save Teacher</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Teacher?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. This will permanently delete the teacher's profile and user account from the system.
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

export default Teachers;
