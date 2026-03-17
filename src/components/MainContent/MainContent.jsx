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

        </main>
    );
}
