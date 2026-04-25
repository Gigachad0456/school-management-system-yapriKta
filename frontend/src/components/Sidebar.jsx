import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, BookOpen, UserCheck, 
    CalendarCheck, CreditCard, ClipboardList, Bell, Settings, PieChart
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'TEACHER'] },
        { name: 'Teachers', path: '/teachers', icon: UserCheck, roles: ['ADMIN'] },
        { name: 'Classes', path: '/classes', icon: BookOpen, roles: ['ADMIN'] },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['ADMIN', 'TEACHER'] },
        { name: 'Fees', path: '/fees', icon: CreditCard, roles: ['ADMIN', 'STUDENT'] },
        { name: 'Exams & Marks', path: '/exams', icon: ClipboardList, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { name: 'Notices', path: '/notices', icon: Bell, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { name: 'Reports', path: '/reports', icon: PieChart, roles: ['ADMIN'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-64 bg-navy-900 text-white flex flex-col min-h-screen shadow-lg">
            <div className="h-16 flex items-center px-6 border-b border-navy-700 font-bold text-xl tracking-wider">
                Yapri KTA
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive ? "bg-navy-700 text-white" : "text-gray-300 hover:bg-navy-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
