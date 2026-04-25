import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const [formData, setFormData] = useState({
        username: '', password: '', first_name: '', last_name: '', email: '',
        admission_number: '', grade_class: '', section: '', gender: 'MALE',
        parent_name: '', phone_number: '', address: '', status: true
    });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const [resStudents, resClasses, resSections] = await Promise.all([
                axiosInstance.get('students/'),
                axiosInstance.get('classes/'),
                axiosInstance.get('sections/')
            ]);
            setStudents(resStudents.data);
            setClasses(resClasses.data);
            setSections(resSections.data);
        } catch (error) {
            toast.error("Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openModal = (student = null) => {
        if (student) {
            setEditingId(student.id);
            setFormData({
                username: student.user.username,
                password: '', 
                first_name: student.user.first_name,
                last_name: student.user.last_name,
                email: student.user.email,
                admission_number: student.admission_number,
                grade_class: student.grade_class || '',
                section: student.section || '',
                gender: student.gender,
                parent_name: student.parent_name,
                phone_number: student.phone_number,
                address: student.address,
                status: student.status
            });
        } else {
            setEditingId(null);
            setFormData({
                username: '', password: '', first_name: '', last_name: '', email: '',
                admission_number: `YAP${Math.floor(Math.random() * 10000)}`,
                grade_class: classes.length > 0 ? classes[0].id : '',
                section: sections.length > 0 ? sections[0].id : '',
                gender: 'MALE', parent_name: '', phone_number: '', address: '', status: true
            });
        }
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const student = students.find(s => s.id === deleteConfirmId);
            await axiosInstance.delete(`students/${deleteConfirmId}/`);
            if (student?.user?.id) {
                await axiosInstance.delete(`users/${student.user.id}/`);
            }
            setDeleteConfirmId(null);
            toast.success("Student deleted successfully");
            fetchStudents();
        } catch (error) {
            toast.error("Error deleting student.");
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
                role: 'STUDENT'
            };
            
            if (formData.password) {
                userData.password = formData.password;
            }

            let userId;

            if (editingId) {
                const student = students.find(s => s.id === editingId);
                await axiosInstance.patch(`users/${student.user.id}/`, userData);
                userId = student.user.id;
            } else {
                const userRes = await axiosInstance.post('users/', userData);
                userId = userRes.data.id;
            }

            const studentData = {
                user_id: userId,
                admission_number: formData.admission_number,
                grade_class: formData.grade_class || null,
                section: formData.section || null,
                gender: formData.gender,
                parent_name: formData.parent_name,
                phone_number: formData.phone_number,
                address: formData.address,
                status: formData.status
            };

            if (editingId) {
                await axiosInstance.patch(`students/${editingId}/`, studentData);
            } else {
                await axiosInstance.post('students/', studentData);
            }

            setIsModalOpen(false);
            toast.success(editingId ? "Student updated successfully" : "Student added successfully");
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error saving student data. Make sure username/admission number is unique.");
        }
    };

    const columns = [
        { header: 'Admission No', accessor: 'admission_number' },
        { 
            header: 'Name', 
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-xs">
                        {row.user?.first_name?.[0]}{row.user?.last_name?.[0]}
                    </div>
                    <span className="font-medium">{row.user?.first_name} {row.user?.last_name}</span>
                </div>
            )
        },
        { header: 'Class', accessor: 'grade_class_name' },
        { header: 'Section', accessor: 'section_name' },
        { header: 'Gender', accessor: 'gender' },
        { header: 'Parent', accessor: 'parent_name' },
        { header: 'Phone', accessor: 'phone_number' },
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

    const filteredStudents = students.filter(student => {
        const fullName = `${student.user?.first_name} ${student.user?.last_name}`.toLowerCase();
        const admNo = (student.admission_number || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        
        const matchesSearch = fullName.includes(term) || admNo.includes(term);
        const matchesClass = selectedClass === 'All' || student.grade_class_name === selectedClass;
        
        return matchesSearch && matchesClass;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
            </div>

            {/* Class Categories / Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <button 
                        onClick={() => setSelectedClass('All')}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedClass === 'All' 
                            ? 'bg-navy-50 text-navy-700 border border-navy-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        All Classes
                    </button>
                    {classes.map(c => (
                        <button 
                            key={c.id}
                            onClick={() => setSelectedClass(c.name)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedClass === c.name 
                                ? 'bg-navy-50 text-navy-700 border border-navy-200' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 flex-shrink-0">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={filteredStudents} 
                loading={loading}
                itemsPerPage={8}
                exportName="Students"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Student" : "Add Student"}>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admission No.</label>
                            <input required type="text" name="admission_number" value={formData.admission_number} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white">
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select name="grade_class" value={formData.grade_class} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white">
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select name="section" value={formData.section} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white">
                                {sections.filter(s => s.grade_class == formData.grade_class).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                            <input required type="text" name="parent_name" value={formData.parent_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input required type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" />
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
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Save Student</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. This will permanently delete the student's profile and user account from the system.
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

export default Students;
