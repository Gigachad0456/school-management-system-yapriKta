import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, AlertTriangle, Search } from 'lucide-react';

const Exams = () => {
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    // Quick Add Exam State
    const [isAddingExam, setIsAddingExam] = useState(false);
    const [newExamData, setNewExamData] = useState({ name: '', date: '', grade_class: '' });
    const [classes, setClasses] = useState([]);

    const [formData, setFormData] = useState({
        exam: '',
        student: '',
        subject: '',
        marks_obtained: '',
        max_marks: 100
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resMarks, resStudents, resSubjects, resExams, resClasses] = await Promise.all([
                axiosInstance.get('marks/'),
                axiosInstance.get('students/'),
                axiosInstance.get('subjects/'),
                axiosInstance.get('exams/'),
                axiosInstance.get('classes/')
            ]);
            setMarks(resMarks.data);
            setStudents(resStudents.data);
            setSubjects(resSubjects.data);
            setExams(resExams.data);
            setClasses(resClasses.data);
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

    const openModal = (mark = null) => {
        if (mark) {
            setEditingId(mark.id);
            setFormData({
                exam: mark.exam,
                student: mark.student,
                subject: mark.subject,
                marks_obtained: mark.marks_obtained,
                max_marks: mark.max_marks
            });
        } else {
            setEditingId(null);
            setFormData({
                exam: exams.length > 0 ? exams[0].id : '',
                student: students.length > 0 ? students[0].id : '',
                subject: subjects.length > 0 ? subjects[0].id : '',
                marks_obtained: '',
                max_marks: 100
            });
        }
        setIsAddingExam(false);
        setIsModalOpen(true);
    };

    const handleAddExam = async () => {
        if (!newExamData.name || !newExamData.date || !newExamData.grade_class) return;
        try {
            const res = await axiosInstance.post('exams/', newExamData);
            setExams([...exams, res.data]);
            setFormData(prev => ({ ...prev, exam: res.data.id }));
            setIsAddingExam(false);
            setNewExamData({ name: '', date: '', grade_class: '' });
        } catch (error) {
            alert("Failed to add exam.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.patch(`marks/${editingId}/`, formData);
            } else {
                await axiosInstance.post('marks/', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Failed to save marks. Ensure marks for this student/exam/subject combination don't already exist.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axiosInstance.delete(`marks/${deleteConfirmId}/`);
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            alert("Failed to delete marks.");
        }
    };

    const columns = [
        { header: 'Student', accessor: 'student_name' },
        { header: 'Exam', accessor: 'exam_name' },
        { header: 'Subject', accessor: 'subject_name' },
        { header: 'Marks Obtained', accessor: 'marks_obtained' },
        { header: 'Max Marks', accessor: 'max_marks' },
        { 
            header: 'Percentage', 
            cell: (row) => {
                const percentage = (row.marks_obtained / row.max_marks) * 100;
                return (
                    <span className="font-medium">
                        {percentage.toFixed(1)}%
                    </span>
                );
            } 
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

    const filteredMarks = marks.filter(mark => {
        const studentName = (mark.student_name || '').toLowerCase();
        return studentName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Exams & Marks</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Enter Marks
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by student name..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={filteredMarks} 
                loading={loading} 
                exportName="Exam_Marks"
            />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Marks" : "Enter Marks"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {!isAddingExam ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                            <div className="flex gap-2">
                                <select 
                                    name="exam" 
                                    value={formData.exam} 
                                    onChange={handleInputChange} 
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                                    required
                                >
                                    <option value="" disabled>Select Exam</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.grade_class_name})</option>)}
                                </select>
                                <button type="button" onClick={() => setIsAddingExam(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    New Exam
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">Create New Exam</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Exam Name</label>
                                    <input 
                                        type="text" 
                                        value={newExamData.name}
                                        onChange={(e) => setNewExamData({...newExamData, name: e.target.value})}
                                        className="w-full px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-navy-500"
                                        placeholder="e.g. Midterm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={newExamData.date}
                                        onChange={(e) => setNewExamData({...newExamData, date: e.target.value})}
                                        className="w-full px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-navy-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                                    <select 
                                        value={newExamData.grade_class}
                                        onChange={(e) => setNewExamData({...newExamData, grade_class: e.target.value})}
                                        className="w-full px-3 py-1.5 border rounded-lg text-sm outline-none bg-white focus:border-navy-500"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={handleAddExam} className="px-3 py-1.5 bg-navy-600 text-white rounded-lg text-sm font-medium hover:bg-navy-700">Add</button>
                                <button type="button" onClick={() => setIsAddingExam(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select 
                            name="student" 
                            value={formData.student} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name} ({s.admission_number})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                            <input 
                                required 
                                type="number" 
                                step="0.01"
                                name="marks_obtained" 
                                value={formData.marks_obtained} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                            <input 
                                required 
                                type="number" 
                                step="0.01"
                                name="max_marks" 
                                value={formData.max_marks} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Save Marks</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Marks?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. It will permanently remove these marks from the database.
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

export default Exams;
