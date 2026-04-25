import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

const COLORS = ['#1e40af', '#4ade80', '#facc15', '#f87171', '#c084fc'];

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, attendanceRate: 0, activeStudents: 0 });

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const [resAttendance, resFees, resStudents] = await Promise.all([
                    axiosInstance.get('attendance/'),
                    axiosInstance.get('fee-payments/'),
                    axiosInstance.get('students/')
                ]);

                const attendance = resAttendance.data;
                const fees = resFees.data;
                const students = resStudents.data;

                // 1. Process Attendance
                let present = 0, absent = 0, late = 0;
                attendance.forEach(record => {
                    if (record.status === 'PRESENT') present++;
                    else if (record.status === 'ABSENT') absent++;
                    else if (record.status === 'LATE') late++;
                });
                
                const totalAttendance = present + absent + late;
                const rate = totalAttendance > 0 ? ((present / totalAttendance) * 100).toFixed(1) : 0;
                
                setAttendanceStats([
                    { name: 'Present', value: present },
                    { name: 'Absent', value: absent },
                    { name: 'Late', value: late }
                ]);

                // 2. Process Gender Distribution
                let male = 0, female = 0, other = 0;
                let active = 0;
                students.forEach(s => {
                    if (s.status) active++;
                    if (s.gender === 'MALE') male++;
                    else if (s.gender === 'FEMALE') female++;
                    else other++;
                });

                setGenderData([
                    { name: 'Male', value: male },
                    { name: 'Female', value: female },
                    { name: 'Other', value: other }
                ]);

                // 3. Process Revenue (Group by month for simplicity, using payment_date)
                const revMap = {};
                let totalRev = 0;
                fees.forEach(f => {
                    if (f.status === 'PAID' || f.status === 'PARTIAL') {
                        const amount = parseFloat(f.paid_amount);
                        totalRev += amount;
                        if (f.payment_date) {
                            const month = new Date(f.payment_date).toLocaleString('default', { month: 'short' });
                            revMap[month] = (revMap[month] || 0) + amount;
                        }
                    }
                });

                const formattedRevenue = Object.keys(revMap).map(month => ({
                    name: month,
                    Revenue: revMap[month]
                }));

                // Fallback dummy data if no dates available to make chart look good
                if (formattedRevenue.length === 0) {
                    formattedRevenue.push({ name: 'Current', Revenue: totalRev });
                }

                setRevenueData(formattedRevenue);
                setSummary({ totalRevenue: totalRev, attendanceRate: rate, activeStudents: active });

            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-96 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-center items-center">
                <p className="text-gray-500 font-medium animate-pulse">Generating Reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics & Reports</h1>
                <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
                    <FileText className="w-4 h-4" />
                    Export PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Average Attendance</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.attendanceRate}%</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="p-4 rounded-lg bg-green-50 text-green-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue Collected</p>
                        <h3 className="text-2xl font-bold text-gray-900">${summary.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="p-4 rounded-lg bg-purple-50 text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{summary.activeStudents}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue Overview</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
                                <RechartsTooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="Revenue" fill="#1e40af" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Overall Attendance Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendanceStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gender Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Student Demographics (Gender)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genderData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
                                <RechartsTooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#4ade80" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
