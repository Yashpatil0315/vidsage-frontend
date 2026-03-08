"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import TopBar from "../../components/TopBar/TopBar";
import {
    Plus, Search, Star, ArrowLeft, Bold, Italic, Underline, Strikethrough,
    Heading1, List, ListOrdered, CheckSquare, Link2, Code2, Trash2
} from "lucide-react";

const STORAGE_KEY = "vidsage_notes";

function loadNotes() {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function wordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function NotesPage() {
    const router = useRouter();
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        api.get("/user/me")
            .then(() => setAuthChecking(false))
            .catch(() => router.replace("/login"));
    }, [router]);

    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [saveStatus, setSaveStatus] = useState("saved");
    const [mobileView, setMobileView] = useState("list"); // "list" or "editor"
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const saveTimerRef = useRef(null);

    // Load notes from localStorage on mount
    useEffect(() => {
        setNotes(loadNotes());
    }, []);

    const selectedNote = notes.find((n) => n.id === selectedId) || null;

    // Filter & search
    const filteredNotes = notes
        .filter((n) => {
            if (filter === "favorites") return n.favorite;
            return true;
        })
        .filter((n) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Auto-save with debounce
    const persistNotes = (updatedNotes) => {
        setSaveStatus("saving");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveNotes(updatedNotes);
            setSaveStatus("saved");
        }, 500);
    };

    const createNote = () => {
        const newNote = {
            id: Date.now().toString(),
            title: "Untitled Note",
            content: "",
            favorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        setSelectedId(newNote.id);
        setMobileView("editor");
        persistNotes(updated);
        // Focus title after render
        setTimeout(() => titleRef.current?.focus(), 100);
    };

    const updateNote = (id, changes) => {
        const updated = notes.map((n) =>
            n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
        );
        setNotes(updated);
        persistNotes(updated);
    };

    const deleteNote = (id) => {
        const updated = notes.filter((n) => n.id !== id);
        setNotes(updated);
        if (selectedId === id) {
            setSelectedId(null);
            setMobileView("list");
        }
        persistNotes(updated);
    };

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        const note = notes.find((n) => n.id === id);
        if (note) updateNote(id, { favorite: !note.favorite });
    };

    const selectNote = (id) => {
        setSelectedId(id);
        setMobileView("editor");
    };

    const goBackToList = () => {
        setMobileView("list");
    };

    // Toolbar formatting commands
    const execCmd = (cmd, value = null) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
    };

    // Sync contentEditable to note
    const handleEditorInput = () => {
        if (selectedNote && editorRef.current) {
            updateNote(selectedNote.id, { content: editorRef.current.innerHTML });
        }
    };

    // Fix editor reverse-typing: only inject HTML when the selected note switches
    // This makes the contentEditable uncontrolled during typing, preserving caret position.
    useEffect(() => {
        if (selectedNote && editorRef.current) {
            if (editorRef.current.innerHTML !== selectedNote.content) {
                editorRef.current.innerHTML = selectedNote.content || "";
            }
        }
    }, [selectedNote?.id]);

    // Auth loading
    if (authChecking) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-50 dark:bg-[#0f1117]">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-800"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar />
                <div className="flex-1 flex overflow-hidden bg-gray-50/50 dark:bg-[#0f1117]">

                    {/* ============ LEFT PANEL — Notes List ============ */}
                    <div className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#16181d] overflow-hidden flex-shrink-0`}>

                        {/* Header */}
                        <div className="p-4 pb-3 flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">My Notes</h2>
                            <button
                                onClick={createNote}
                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                            >
                                <Plus size={14} strokeWidth={3} />
                                <span className="hidden sm:inline">New Note</span>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 pb-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notes..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="px-4 pb-3 flex gap-2">
                            {[
                                { key: "all", label: "All" },
                                { key: "favorites", label: "Favorites" },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f.key
                                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                                        : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Notes list */}
                        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                            {filteredNotes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                                    <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    <p className="text-sm font-medium">No notes yet</p>
                                    <p className="text-xs mt-1">Create your first note!</p>
                                </div>
                            ) : (
                                filteredNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => selectNote(note.id)}
                                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer group ${selectedId === note.id
                                            ? "bg-indigo-50 dark:bg-indigo-950/50 border-l-2 border-indigo-600 dark:border-indigo-400"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-sm font-semibold truncate ${selectedId === note.id ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-white"
                                                    }`}>
                                                    {note.title || "Untitled"}
                                                </h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                                                    {note.content ? note.content.replace(/<[^>]*>/g, "").slice(0, 80) : "Empty note"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => toggleFavorite(note.id, e)}
                                                className="p-1 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Star
                                                    size={14}
                                                    className={note.favorite
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-gray-300 dark:text-gray-600"
                                                    }
                                                />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                                            {formatDate(note.updatedAt)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ============ RIGHT PANEL — Note Editor ============ */}
                    <div className={`${mobileView === "editor" ? "flex" : "hidden"} lg:flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#09090b]`}>
                        {selectedNote ? (
                            <>
                                {/* Editor Header */}
                                <div className="p-4 md:p-6 pb-0 md:pb-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        {/* Back button — mobile only */}
                                        <button
                                            onClick={goBackToList}
                                            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <ArrowLeft size={20} className="text-gray-500" />
                                        </button>
                                        <input
                                            ref={titleRef}
                                            value={selectedNote.title}
                                            onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                                            className="flex-1 text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-300"
                                            placeholder="Note title..."
                                        />
                                        <button
                                            onClick={() => deleteNote(selectedNote.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                            title="Delete note"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 ml-0 lg:ml-0">
                                        <span>{formatDate(selectedNote.updatedAt)}</span>
                                        <span>•</span>
                                        <span>{wordCount(selectedNote.content?.replace(/<[^>]*>/g, "") || "")} words</span>
                                    </div>
                                </div>

                                {/* Toolbar */}
                                <div className="px-4 md:px-6 py-3">
                                    <div className="flex items-center gap-0.5 p-1 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-x-auto">
                                        {[
                                            { icon: Bold, cmd: "bold", size: 15 },
                                            { icon: Italic, cmd: "italic", size: 15 },
                                            { icon: Underline, cmd: "underline", size: 15 },
                                            { icon: Strikethrough, cmd: "strikeThrough", size: 15 },
                                        ].map(({ icon: Icon, cmd, size }) => (
                                            <button
                                                key={cmd}
                                                onClick={() => execCmd(cmd)}
                                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                                                title={cmd}
                                            >
                                                <Icon size={size} />
                                            </button>
                                        ))}

                                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 flex-shrink-0" />

                                        {[
                                            { icon: Heading1, cmd: () => execCmd("formatBlock", "<h2>"), size: 15 },
                                            { icon: List, cmd: () => execCmd("insertUnorderedList"), size: 15 },
                                            { icon: ListOrdered, cmd: () => execCmd("insertOrderedList"), size: 15 },
                                        ].map(({ icon: Icon, cmd, size }, i) => (
                                            <button
                                                key={i}
                                                onClick={cmd}
                                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                                            >
                                                <Icon size={size} />
                                            </button>
                                        ))}

                                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 flex-shrink-0" />

                                        <button
                                            onClick={() => execCmd("formatBlock", "<pre>")}
                                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                                        >
                                            <Code2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Editor Area */}
                                <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4">
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={handleEditorInput}
                                        className="min-h-[300px] text-sm text-gray-700 dark:text-gray-200 leading-relaxed outline-none prose prose-sm dark:prose-invert max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-gray-50 [&_pre]:dark:bg-zinc-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:font-mono"
                                    />
                                </div>

                                {/* Save Status */}
                                <div className="px-4 md:px-6 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                                    {saveStatus === "saved" ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Saved to local storage</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Saving…</span>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                </div>
                                <p className="text-sm font-medium">Select a note or create a new one</p>
                                <p className="text-xs mt-1">Your notes are saved locally on this device</p>
                                <button
                                    onClick={createNote}
                                    className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                    New Note
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
