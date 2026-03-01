"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../../lib/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import TopBar from "../../components/TopBar/TopBar";
import MainContent from "../../components/MainContent/MainContent";
import AiChatBox from "../../components/AiChatBox/AiChatBox";
import StudyRoom from "../../components/StudyRoom/StudyRoom";
import ResizableSidebar from "../../components/ResizableSidebar/ResizableSidebar";
import UrlAccepter from "../../components/UrlAccepter/UrlAccepter";


export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Auth guard ──
  // Check if the user is logged in by calling /user/me.
  // The backend will validate the session cookie and return user data
  // or a 401 if not authenticated → redirect to /login.
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    api.get("/user/me")
      .then(() => {
        // Cookie is valid — user is authenticated
        setAuthChecking(false);
      })
      .catch(() => {
        // No valid session — send them to login
        router.replace("/login");
      });
  }, [router]);

  // If there's a jobId in the URL, show content immediately (shared link)
  const jobIdFromUrl = searchParams.get("jobId");
  const [hasVideo, setHasVideo] = useState(!!jobIdFromUrl);
  const [jobId, setJobId] = useState(jobIdFromUrl || null);

  const handleVideoProcessed = (url, newJobId) => {
    setJobId(newJobId);
    setHasVideo(true);
    // Update the URL with the jobId so it becomes shareable and child components can access it
    router.replace(`/dashbord?jobId=${newJobId}`);
  };
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleJobNotFound = () => {
    setHasVideo(false);
    setJobId(null);
    setShowErrorToast(true);
    router.replace("/dashbord");

    // Auto-hide the toast after 4 seconds
    setTimeout(() => setShowErrorToast(false), 4000);
  };

  // Show a loading spinner while we verify the session
  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50 dark:bg-[#0f1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        <div className="flex-1 flex flex-row overflow-hidden relative bg-gray-50/50 dark:bg-[#0f1117]">

          {!hasVideo ? (
            <UrlAccepter onSubmit={handleVideoProcessed} />
          ) : (
            <>
              <MainContent onNotFound={handleJobNotFound} />
              <ResizableSidebar>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <AiChatBox />
                </div>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <StudyRoom />
                </div>
              </ResizableSidebar>
            </>
          )}

        </div>
      </div>

      {/* Error Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 transform ${showErrorToast ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
          }`}
      >
        <div className="bg-red-500/20 text-red-400 p-1.5 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-semibold text-white tracking-wide">
          Study room does not exist or URL is invalid.
        </p>
        <button
          onClick={() => setShowErrorToast(false)}
          className="ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
