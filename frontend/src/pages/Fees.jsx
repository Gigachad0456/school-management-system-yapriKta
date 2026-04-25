import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, AlertTriangle, Search } from 'lucide-react';

const Fees = () => {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    const [formData, setFormData] = useState({
        student: '',
        fee_category: '',
        paid_amount: 0,
        status: 'UNPAID',
        payment_date: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resPayments, resStudents, resCategories] = await Promise.all([
                axiosInstance.get('fee-payments/'),
                axiosInstance.get('students/'),
                axiosInstance.get('fee-categories/')
            ]);
            setPayments(resPayments.data);
            setStudents(resStudents.data);
            setCategories(resCategories.data);
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

    const openModal = (payment = null) => {
        if (payment) {
            setEditingId(payment.id);
            setFormData({
                student: payment.student,
                fee_category: payment.fee_category,
                paid_amount: payment.paid_amount,
                status: payment.status,
                payment_date: payment.payment_date || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingId(null);
            setFormData({
                student: students.length > 0 ? students[0].id : '',
                fee_category: categories.length > 0 ? categories[0].id : '',
                paid_amount: 0,
                status: 'UNPAID',
                payment_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.patch(`fee-payments/${editingId}/`, formData);
            } else {
                await axiosInstance.post('fee-payments/', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Failed to save fee payment.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axiosInstance.delete(`fee-payments/${deleteConfirmId}/`);
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            alert("Failed to delete fee payment.");
        }
    };

    const columns = [
        { header: 'Student', accessor: 'student_name' },
        { header: 'Fee Category', accessor: 'fee_category_name' },
        { header: 'Paid Amount', cell: (row) => `$${row.paid_amount}` },
        { header: 'Payment Date', accessor: 'payment_date' },
        { 
            header: 'Status', 
            cell: (row) => {
                const colors = {
                    PAID: 'bg-green-100 text-green-700',
                    PARTIAL: 'bg-yellow-100 text-yellow-700',
                    UNPAID: 'bg-red-100 text-red-700'
                };
                return (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[row.status]}`}>
                        {row.status}
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

    const filteredPayments = payments.filter(payment => {
        const studentName = (payment.student_name || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return studentName.includes(term);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Fees Management</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Collect Fee
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
                data={filteredPayments} 
                loading={loading} 
                exportName="Fee_Payments"
            />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Fee Payment" : "Collect Fee"}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
                        <select 
                            name="fee_category" 
                            value={formData.fee_category} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name} (${c.amount})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount ($)</label>
                            <input 
                                required 
                                type="number" 
                                step="0.01"
                                name="paid_amount" 
                                value={formData.paid_amount} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleInputChange} 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none bg-white"
                            >
                                <option value="PAID">Paid</option>
                                <option value="PARTIAL">Partial</option>
                                <option value="UNPAID">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                        <input 
                            required 
                            type="date" 
                            name="payment_date" 
                            value={formData.payment_date} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-lg hover:bg-navy-700">Save Payment</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Payment Record?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This action cannot be undone. It will permanently remove this transaction from the financial records.
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

export default Fees;
