import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Save, X, Edit3 } from 'lucide-react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '' // Only sent if changed
    });

    if (!user) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel edit, reset form
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                username: user.username || '',
                email: user.email || '',
                password: ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            await axiosInstance.patch(`users/${user.id}/`, payload);
            
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            
            if (formData.password || formData.username !== user.username) {
                toast("Please log in again with your new credentials.", { icon: '🔄', duration: 4000 });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // If just name/email changed, reload to update AuthContext globally
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to update profile. Username might be taken.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
                {!isEditing && (
                    <button 
                        onClick={toggleEdit}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-6 relative">
                    <div className="w-20 h-20 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-3xl font-bold shadow-inner">
                        {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
                        <p className="text-gray-500 capitalize flex items-center gap-2 mt-1">
                            <Shield className="w-4 h-4 text-navy-600" />
                            {user.role?.toLowerCase()} Account
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Personal Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                {isEditing ? (
                                    <input 
                                        required type="text" name="first_name" 
                                        value={formData.first_name} onChange={handleInputChange} 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                                        {user.first_name}
                                    </div>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                {isEditing ? (
                                    <input 
                                        required type="text" name="last_name" 
                                        value={formData.last_name} onChange={handleInputChange} 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                                        {user.last_name}
                                    </div>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            required type="text" name="username" 
                                            value={formData.username} onChange={handleInputChange} 
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900">{user.username}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            required type="email" name="email" 
                                            value={formData.email} onChange={handleInputChange} 
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900">{user.email || 'Not provided'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password (Only visible in edit mode) */}
                            {isEditing && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password <span className="text-gray-400 font-normal">(Leave blank to keep current password)</span>
                                    </label>
                                    <input 
                                        type="password" name="password" 
                                        value={formData.password} onChange={handleInputChange} 
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none" 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={toggleEdit}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg font-medium text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg font-medium text-sm text-white bg-navy-600 hover:bg-navy-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                                >
                                    <Save className="w-4 h-4" />
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
