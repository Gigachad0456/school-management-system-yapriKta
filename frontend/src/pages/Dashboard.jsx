import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, DollarSign, Bell, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
        <div className={`p-4 rounded-lg ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('dashboard/');
                setStats(response.data);
            } catch (error) {
                toast.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-96 flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.first_name}!</h1>
            
            {user?.role === 'ADMIN' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={stats.total_students} icon={Users} colorClass="bg-blue-500" />
                    <StatCard title="Total Teachers" value={stats.total_teachers} icon={UserCheck} colorClass="bg-green-500" />
                    <StatCard title="Total Classes" value={stats.total_classes} icon={BookOpen} colorClass="bg-purple-500" />
                    <StatCard title="Total Revenue" value={`$${stats.total_revenue}`} icon={DollarSign} colorClass="bg-yellow-500" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link to="/students" className="p-4 border border-gray-200 rounded-lg hover:border-navy-500 hover:text-navy-600 hover:bg-navy-50 transition-all flex flex-col items-center justify-center gap-2 group">
                            <Users className="w-6 h-6 text-gray-400 group-hover:text-navy-600 transition-colors" />
                            <span className="text-sm font-medium">Students</span>
                        </Link>
                        <Link to="/fees" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 group">
                            <DollarSign className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                            <span className="text-sm font-medium">Collect Fees</span>
                        </Link>
                        <Link to="/notices" className="p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-all flex flex-col items-center justify-center gap-2 group">
                            <Bell className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                            <span className="text-sm font-medium">New Notice</span>
                        </Link>
                        <Link to="/reports" className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2 group">
                            <PieChart className="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span className="text-sm font-medium">Reports</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-navy-600" />
                        Recent Notices
                    </h2>
                    <div className="space-y-4">
                        {stats?.recent_notices?.length > 0 ? (
                            stats.recent_notices.map(notice => (
                                <div key={notice.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <h3 className="text-sm font-semibold text-gray-900">{notice.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notice.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent notices.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
