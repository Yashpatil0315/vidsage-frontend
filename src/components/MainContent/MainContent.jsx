import React from 'react';
import { Share2, Bookmark, Play, FileText, AlignLeft, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';

// Converts any YouTube URL to embed format
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
            return rawUrl; // already an embed URL
        }
    } catch {
        return rawUrl;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl;
}

export default function MainContent({ onNotFound }) {

    const [url, setUrl] = useState("");
    const searchParams = useSearchParams();
    const jobId = searchParams.get("jobId");
    const [status, setStatus] = useState("pending");
    const [summary, setSummary] = useState(null);
    const [quiz, setQuiz] = useState(null);

    useEffect(() => {
        if (!jobId) return;
        let interval;

        const fetchStatus = async () => {
            try {
                const res = await api.get(`/job/${jobId}`);
                setStatus(res.data.status);
                setUrl(toEmbedUrl(res.data.url));

                // Once we have the URL, stop polling — no need to keep hitting the API
                if (res.data.url) {
                    clearInterval(interval);
                }
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

    return (
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto scrollbar-hide">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-0 mb-4 md:mb-6 w-full max-w-5xl mx-auto">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight flex-1">
                    Neural Networks: Backpropagation Explained
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 md:ml-6 self-start w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white transition-all">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md shadow-indigo-600/20 dark:shadow-indigo-900 hover:bg-indigo-700 transition-all">
                        <Bookmark size={16} className="fill-current" />
                        Save
                    </button>
                </div>
            </div>

            {/* Video Player Placeholder */}
            <div className="w-full max-w-5xl mx-auto mb-8 relative group cursor-pointer">
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
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin"></div>
                                <p className="text-sm text-gray-400">Loading video…</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs Section */}
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm">

                {/* Tabs */}
                <div className="flex items-center gap-4 sm:gap-6 md:gap-8 border-b border-gray-100 dark:border-white/10 mb-4 sm:mb-6 md:mb-8 pb-[-1px] overflow-x-auto">
                    <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 pb-4 px-2 -mb-[2px] z-10">
                        <FileText size={18} />
                        Overview
                    </button>

                    <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium pb-4 px-2 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <AlignLeft size={18} />
                        Transcript
                    </button>

                    <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium pb-4 px-2 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <HelpCircle size={18} />
                        Quizzes
                        <span className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ml-1 border border-indigo-100 dark:border-indigo-800">
                            2
                        </span>
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this lesson</h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                        In this lesson, we dive deep into the mathematics behind backpropagation, the
                        core algorithm used to train neural networks. We'll cover the chain rule, gradient
                        descent optimization, and how weights are updated layer by layer.
                    </p>
                </div>

            </div>

        </main>
    );
}
