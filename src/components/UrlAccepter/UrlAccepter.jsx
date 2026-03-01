import React, { useState } from 'react';
import { Sparkles, ArrowRight, Link as LinkIcon, Loader2 } from 'lucide-react';
import api from "../../lib/api";

export default function UrlAccepter({ onSubmit }) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resData, setResData] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const res = await api.post("/processAudio", { url });
            console.log(res.data);
            setResData(res.data);
            // Backend responded successfully — reveal the dashboard content
            onSubmit(url, res.data.jobId);
        } catch (err) {
            console.error(err);
            setError('Failed to process video. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full h-full relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-xl w-full flex flex-col items-center z-10">
                <div className="w-16 h-16 bg-white dark:bg-[#09090b] rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center mb-8 border border-white dark:border-white/10">
                    <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-4 tracking-tight">
                    Learn smarter with <span className="text-indigo-600 dark:text-indigo-400">Vidsage</span>
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-10 max-w-lg leading-relaxed">
                    Paste any educational YouTube video link below. Our AI will analyze the content, and act as your personal tutor.
                </p>

                <form onSubmit={handleSubmit} className="w-full relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <LinkIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>

                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-12 pr-36 py-4 bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 ring-4 ring-transparent focus:border-indigo-500 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 rounded-2xl text-gray-700 dark:text-gray-200 shadow-sm transition-all outline-none"
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !url.trim()}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-200"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing
                            </>
                        ) : (
                            <>
                                Start Learning
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 outline outline-2 outline-green-100 dark:outline-green-900/50"></span> Context Aware</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 outline outline-2 outline-blue-100 dark:outline-blue-900/50"></span> Instant Quizzes</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 outline outline-2 outline-purple-100 dark:outline-purple-900/50"></span> 24/7 AI Tutor</span>
                </div>
            </div>
        </div>
    );
}
