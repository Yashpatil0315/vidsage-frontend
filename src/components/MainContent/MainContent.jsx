import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ChevronDown, Plus, Search, Star, ArrowLeft, Bold, Italic, Underline,
    Strikethrough, Heading1, List, ListOrdered, Code2, Trash2, FileText
} from 'lucide-react';
import api from '../../lib/api';

// ── YouTube helpers ──
function toEmbedUrl(rawUrl) {
    if (!rawUrl) return "";
    let videoId = "";
    try {
        const urlObj = new URL(rawUrl);
        if (urlObj.hostname.includes("youtu.be")) {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.searchParams.get("v")) {
            videoId = urlObj.searchParams.get("v");
        } else if (urlObj.pathname.includes("/embed/")) {
            return rawUrl;
        }
    } catch {
        return rawUrl;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl;
}

// ── Notes helpers ──
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

export default function MainContent({ onNotFound }) {
    // ── Video state ──
    const [url, setUrl] = useState("");
    const searchParams = useSearchParams();
    const jobId = searchParams.get("jobId");

    useEffect(() => {
        if (!jobId) return;
        let interval;
        const fetchStatus = async () => {
            try {
                const res = await api.get(`/job/${jobId}`);
                setUrl(toEmbedUrl(res.data.url));
                if (res.data.url) clearInterval(interval);
            } catch (err) {
                if (err.response?.status === 404) {
                    clearInterval(interval);
                    if (onNotFound) onNotFound();
                } else {
                    console.error("Error fetching job status:", err);
                }
            }
        };
        fetchStatus();
        interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [jobId, onNotFound]);

    // ── Notes state ──
    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [saveStatus, setSaveStatus] = useState("saved");
    const [mobileView, setMobileView] = useState("list");
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const saveTimerRef = useRef(null);

    useEffect(() => { setNotes(loadNotes()); }, []);

    const selectedNote = notes.find((n) => n.id === selectedId) || null;

    const filteredNotes = notes
        .filter((n) => (filter === "favorites" ? n.favorite : true))
        .filter((n) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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
        if (selectedId === id) { setSelectedId(null); setMobileView("list"); }
        persistNotes(updated);
    };

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        const note = notes.find((n) => n.id === id);
        if (note) updateNote(id, { favorite: !note.favorite });
    };

    const execCmd = (cmd, value = null) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
    };

    const handleEditorInput = () => {
        if (selectedNote && editorRef.current) {
            updateNote(selectedNote.id, { content: editorRef.current.innerHTML });
        }
    };

    useEffect(() => {
        if (selectedNote && editorRef.current) {
            if (editorRef.current.innerHTML !== selectedNote.content) {
                editorRef.current.innerHTML = selectedNote.content || "";
            }
        }
    }, [selectedNote?.id]);

    return (
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto scrollbar-hide">

            {/* ── Video Player ── */}
            <div className="w-full max-w-5xl mx-auto mb-6 relative group cursor-pointer">
                <div
                    className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 bg-black"
                    style={{ aspectRatio: "16/9" }}
                >
                    {url ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={url}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin" />
                                <p className="text-sm text-gray-400">Loading video…</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Collapsible Notes Section ── */}
            <div className="w-full max-w-5xl mx-auto">
                {/* Toggle Header */}
                <button
                    onClick={() => setNotesOpen(!notesOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-white dark:bg-[#16181d] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg">
                            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">My Notes</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                {notes.length} {notes.length === 1 ? "note" : "notes"}
                            </span>
                        </div>
                    </div>
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-300 ${notesOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {/* Collapsible Body */}
                <div
                    className={`overflow-hidden transition-all duration-400 ease-in-out ${notesOpen ? "max-h-[700px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}`}
                >
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#16181d] shadow-sm overflow-hidden flex flex-col lg:flex-row"
                        style={{ height: notesOpen ? "600px" : "0px" }}
                    >
                        {/* ── LEFT: Notes List ── */}
                        <div className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 border-r border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0`}>

                            {/* Header */}
                            <div className="p-4 pb-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Notes</h2>
                                <button
                                    onClick={createNote}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                    <span className="hidden sm:inline">New</span>
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-4 py-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search notes..."
                                        className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Filter pills */}
                            <div className="px-4 pb-2 flex gap-2">
                                {[{ key: "all", label: "All" }, { key: "favorites", label: "★ Favorites" }].map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${filter === f.key
                                            ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                                            : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Notes list */}
                            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                                {filteredNotes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                                        <FileText size={28} className="mb-2 opacity-40" />
                                        <p className="text-xs font-medium">No notes yet</p>
                                        <p className="text-[10px] mt-0.5">Create your first note!</p>
                                    </div>
                                ) : (
                                    filteredNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => { setSelectedId(note.id); setMobileView("editor"); }}
                                            className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer group ${selectedId === note.id
                                                ? "bg-indigo-50 dark:bg-indigo-950/50 border-l-2 border-indigo-600 dark:border-indigo-400"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-sm font-semibold truncate ${selectedId === note.id ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-white"}`}>
                                                        {note.title || "Untitled"}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                                                        {note.content ? note.content.replace(/<[^>]*>/g, "").slice(0, 60) : "Empty note"}
                                                    </p>
                                                </div>
                                                <button onClick={(e) => toggleFavorite(note.id, e)} className="p-1 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Star size={13} className={note.favorite ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatDate(note.updatedAt)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Note Editor ── */}
                        <div className={`${mobileView === "editor" ? "flex" : "hidden"} lg:flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#09090b]`}>
                            {selectedNote ? (
                                <>
                                    {/* Editor Header */}
                                    <div className="p-4 pb-0 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setMobileView("list")} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <ArrowLeft size={18} className="text-gray-500" />
                                            </button>
                                            <input
                                                ref={titleRef}
                                                value={selectedNote.title}
                                                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                                                className="flex-1 text-lg font-extrabold text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-300"
                                                placeholder="Note title..."
                                            />
                                            <button
                                                onClick={() => deleteNote(selectedNote.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                                title="Delete note"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                                            <span>{formatDate(selectedNote.updatedAt)}</span>
                                            <span>•</span>
                                            <span>{wordCount(selectedNote.content?.replace(/<[^>]*>/g, "") || "")} words</span>
                                        </div>
                                    </div>

                                    {/* Toolbar */}
                                    <div className="px-4 py-2">
                                        <div className="flex items-center gap-0.5 p-1 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 rounded-lg overflow-x-auto">
                                            {[
                                                { icon: Bold, cmd: "bold" },
                                                { icon: Italic, cmd: "italic" },
                                                { icon: Underline, cmd: "underline" },
                                                { icon: Strikethrough, cmd: "strikeThrough" },
                                            ].map(({ icon: Icon, cmd }) => (
                                                <button key={cmd} onClick={() => execCmd(cmd)} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0" title={cmd}>
                                                    <Icon size={14} />
                                                </button>
                                            ))}
                                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 flex-shrink-0" />
                                            {[
                                                { icon: Heading1, cmd: () => execCmd("formatBlock", "<h2>") },
                                                { icon: List, cmd: () => execCmd("insertUnorderedList") },
                                                { icon: ListOrdered, cmd: () => execCmd("insertOrderedList") },
                                            ].map(({ icon: Icon, cmd }, i) => (
                                                <button key={i} onClick={cmd} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                                                    <Icon size={14} />
                                                </button>
                                            ))}
                                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 flex-shrink-0" />
                                            <button onClick={() => execCmd("formatBlock", "<pre>")} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                                                <Code2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Editor area */}
                                    <div className="flex-1 overflow-y-auto px-4 pb-3">
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleEditorInput}
                                            className="min-h-[200px] text-sm text-gray-700 dark:text-gray-200 leading-relaxed outline-none prose prose-sm dark:prose-invert max-w-none [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-gray-50 [&_pre]:dark:bg-zinc-900 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:font-mono"
                                        />
                                    </div>

                                    {/* Save Status */}
                                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                                        {saveStatus === "saved" ? (
                                            <>
                                                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">Saved locally</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">Saving…</span>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                                        <FileText size={24} className="opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium">Select a note or create one</p>
                                    <p className="text-xs mt-1">Notes are saved locally on this device</p>
                                    <button onClick={createNote} className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors">
                                        <Plus size={14} strokeWidth={3} />
                                        New Note
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
