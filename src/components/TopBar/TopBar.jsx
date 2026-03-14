import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, Search, X } from 'lucide-react';
import api from '../../lib/api';

export default function TopBar({ onExitVideo }) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await api.get("/user/me");
            setUser(res.data.user);
            console.log(res.data.user);
        };
        fetchUser();
    }, []);

    return (
        <header className="h-14 md:h-20 w-full flex items-center justify-between px-3 sm:px-4 md:px-8 bg-white dark:bg-[#16181d] border-b border-gray-100/80 dark:border-gray-800 z-10 sticky top-0 shadow-sm">

            {/* Logo area - padded left to avoid hamburger menu */}
            <div className="flex items-center gap-2 md:gap-3 pl-8 md:pl-10 cursor-pointer">
                <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900">
                    <Sparkles className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Vidsage</h1>
            </div>

            {/* Global Search Bar (Center) */}
            <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                    type="text"
                    placeholder="Search courses, videos, or study groups..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1c1e26] hover:bg-gray-100 dark:hover:bg-[#23262f] border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-[#1c1e26] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 md:gap-6 ml-auto">
                {/* Exit Video Button */}
                {onExitVideo && (
                    <button
                        onClick={onExitVideo}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg font-semibold text-xs md:text-sm transition-colors border border-rose-100 dark:border-rose-900/50"
                        title="Close Video Session"
                    >
                        <X size={16} />
                        <span className="hidden sm:inline">Close Video</span>
                    </button>
                )}

                {/* Notification Bell */}
                {/* <button className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-full transition-colors">
                    <Bell size={20} className="fill-current" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#16181d]"></span>
                </button> */}

                {/* User Profile Dropdown */}
                <div className="flex items-center gap-3 cursor-pointer pl-5 border-l border-gray-100 dark:border-gray-800">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4f46e5&color=fff&rounded=true`}
                        alt={user?.name || "User"}
                        className="w-9 h-9 rounded-full border border-indigo-100 dark:border-indigo-900"
                    />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{user?.role}</span>
                    </div>
                </div>
            </div>

        </header>
    );
}
