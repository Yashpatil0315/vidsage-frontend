"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
    LayoutDashboard,
    Library,
    Users,
    BarChart2,
    Settings,
    Moon,
    Sun,
    LogOut,
    ChevronDown,
    X,
    Menu,
    Sparkles,
} from "lucide-react";

export default function Sidebar() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const [user, setUser] = useState(null);

    // Theme state — reads from localStorage so it persists across reloads
    const [isDark, setIsDark] = useState(false);

    // On mount: check if dark mode was previously saved
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    // Toggle between dark and light
    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    // Logout — call the backend to clear the cookie, then redirect to login
    const handleLogout = async () => {
        try {
            await api.post("/user/logout");
        } catch (err) {
            console.error("Logout error:", err);
        }
        router.replace("/login");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const res = await api.get("/user/me");
            setUser(res.data.user);
            console.log(res.data.user);
        };
        fetchUser();
    }, []);

    return (
        <>
            {/* Hamburger button — always visible */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-5 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={20} className="text-gray-700 dark:text-gray-200" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar drawer */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#16181d] border-r border-gray-100 dark:border-gray-800 shadow-xl z-50 flex flex-col justify-between py-6 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Top Section */}
                <div>
                    {/* Close button */}
                    <div className="flex items-center justify-between px-4 mb-8">
                        <div className="flex items-center gap-2 mt-2">
                            <div className="bg-indigo-600 text-white p-1.5 mt-[-1px] rounded-full">
                                <Sparkles size={18} />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Vidsage</span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 cursor-pointer px-4 pb-6 border-b border-gray-100 dark:border-gray-800 mb-4">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                            alt="Alex Morgan"
                            className="w-9 h-9 rounded-full bg-[#fdf3e6]"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</span>
                            <span className="text-xs text-gray-400">{user?.role}</span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 ml-auto" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 px-3">
                        <a
                            href="/dashbord"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = "/dashbord";
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                            <Library size={20} />
                            <span>Library</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                            <Users size={20} />
                            <span>Community</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                            <BarChart2 size={20} />
                            <span>Analytics</span>
                        </a>
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="px-3 flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left font-medium">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left font-medium"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors w-full text-left font-medium"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
