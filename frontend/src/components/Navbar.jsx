import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white h-16 shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-10 relative">
            <div className="font-semibold text-gray-700 text-lg">
                {/* Title or Breadcrumbs could go here */}
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-softgreen-500 text-white flex items-center justify-center font-bold">
                            {user?.first_name?.[0] || 'U'}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium text-gray-700 leading-none">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
                            <button 
                                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4" /> Profile Settings
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
