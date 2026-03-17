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
