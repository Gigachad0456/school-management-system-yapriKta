import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

const Classes = () => {
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    // Quick Add Class State inside Modal
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        grade_class: '',
        class_teacher: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resSections, resClasses, resTeachers] = await Promise.all([
                axiosInstance.get('sections/'),
                axiosInstance.get('classes/'),
                axiosInstance.get('teachers/')
            ]);
            setSections(resSections.data);
            setClasses(resClasses.data);
            setTeachers(resTeachers.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (section = null) => {
        if (section) {
            setEditingId(section.id);
            setFormData({
                name: section.name,
                grade_class: section.grade_class,
                class_teacher: section.class_teacher || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                grade_class: classes.length > 0 ? classes[0].id : '',
                class_teacher: ''
            });
        }
        setIsAddingClass(false);
        setNewClassName('');
        setIsModalOpen(true);
    };

    const handleAddClass = async () => {
        if (!newClassName.trim()) return;
        try {
            const res = await axiosInstance.post('classes/', { name: newClassName });
            setClasses([...classes, res.data]);
            setFormData(prev => ({ ...prev, grade_class: res.data.id }));
            setIsAddingClass(false);
            setNewClassName('');
        } catch (error) {
            alert("Failed to add class.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                grade_class: formData.grade_class,
                class_teacher: formData.class_teacher || null
            };

            if (editingId) {
                await axiosInstance.patch(`sections/${editingId}/`, payload);
            } else {
                await axiosInstance.post('sections/', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Failed to save section.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axiosInstance.delete(`sections/${deleteConfirmId}/`);
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            alert("Failed to delete section.");
        }
    };

    const columns = [
        { header: 'Class', accessor: 'grade_class_name' },
        { header: 'Section', accessor: 'name' },
        { header: 'Class Teacher', cell: (row) => row.class_teacher_name || 'Unassigned' },
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
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Classes & Sections</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>

            <DataTable 
                columns={columns} 
                data={sections} 
                loading={loading} 
            />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Section" : "Add Section"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        {!isAddingClass ? (
                            <div className="flex gap-2">
                                <select 
                                    name="grade_class" 
                                    value={formData.grade_class} 
                                    onChange={handleInputChange} 
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                                    required
                                >
                                    <option value="" disabled>Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsAddingClass(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    New Class
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="e.g. Grade 1"
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none"
                                />
                                <button type="button" onClick={handleAddClass} className="px-3 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Add
                                </button>
                                <button type="button" onClick={() => setIsAddingClass(false)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                        <input 
                            required 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="e.g. A, B, North"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                        <select 
                            name="class_teacher" 
                            value={formData.class_teacher} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                        >
                            <option value="">-- Unassigned --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name} ({t.subject})</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Save Section</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Section?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. Any students assigned to this section will lose their section assignment.
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

export default Classes;
