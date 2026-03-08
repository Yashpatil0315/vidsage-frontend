"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play, Bot, Users } from "lucide-react";
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
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    api.get("/user/me")
      .then(() => {
        setAuthChecking(false);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const jobIdFromUrl = searchParams.get("jobId");

  // Restore jobId from sessionStorage if not in URL (e.g., user navigated to /notes and came back)
  const savedJobId = typeof window !== "undefined" ? sessionStorage.getItem("vidsage_active_jobId") : null;
  const initialJobId = jobIdFromUrl || savedJobId || null;
  const [hasVideo, setHasVideo] = useState(!!initialJobId);
  const [jobId, setJobId] = useState(initialJobId);

  // If we restored from sessionStorage but URL doesn't have jobId, fix the URL
  useEffect(() => {
    if (!jobIdFromUrl && initialJobId) {
      router.replace(`/dashbord?jobId=${initialJobId}`);
    }
  }, [jobIdFromUrl, initialJobId, router]);

  const handleVideoProcessed = (url, newJobId) => {
    setJobId(newJobId);
    setHasVideo(true);
    sessionStorage.setItem("vidsage_active_jobId", newJobId);
    router.replace(`/dashbord?jobId=${newJobId}`);
  };
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleJobNotFound = () => {
    setHasVideo(false);
    setJobId(null);
    sessionStorage.removeItem("vidsage_active_jobId");
    setShowErrorToast(true);
    router.replace("/dashbord");
    setTimeout(() => setShowErrorToast(false), 4000);
  };

  const handleExitVideo = () => {
    setHasVideo(false);
    setJobId(null);
    sessionStorage.removeItem("vidsage_active_jobId");
    router.replace("/dashbord");
  };

  // ── Mobile tab state ──
  // On mobile, only one panel is visible at a time (Video, AI Chat, or Study Room)
  // On desktop (lg:), all three are visible simultaneously via the ResizableSidebar
  const [mobileTab, setMobileTab] = useState("video");

  // ── AI Chat messages (lifted here so they persist across tab switches & screen resizes) ──
  const [aiMessages, setAiMessages] = useState(() => {
    const defaultMsg = [{ from: "ai", text: "Hello! I'm your AI tutor. I'm tracking the video context. Feel free to ask me anything about the lesson.", time: "Just now" }];
    if (typeof window === "undefined" || !initialJobId) return defaultMsg;
    try {
      const saved = sessionStorage.getItem(`vidsage_ai_msgs_${initialJobId}`);
      return saved ? JSON.parse(saved) : defaultMsg;
    } catch {
      return defaultMsg;
    }
  });

  // Save AI messages to sessionStorage whenever they change
  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(`vidsage_ai_msgs_${jobId}`, JSON.stringify(aiMessages));
    }
  }, [aiMessages, jobId]);

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
        <TopBar onExitVideo={hasVideo ? handleExitVideo : null} />
        <div className="flex-1 flex flex-row overflow-hidden relative bg-gray-50/50 dark:bg-[#0f1117]">

          {!hasVideo ? (
            <UrlAccepter onSubmit={handleVideoProcessed} />
          ) : (
            <>
              {/* === DESKTOP LAYOUT (lg: and up) === */}
              {/* MainContent is always visible on desktop */}
              <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
                <MainContent onNotFound={handleJobNotFound} />
              </div>
              <ResizableSidebar>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <AiChatBox messages={aiMessages} setMessages={setAiMessages} />
                </div>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <StudyRoom />
                </div>
              </ResizableSidebar>

              {/* === MOBILE LAYOUT (below lg:) === */}
              {/* Show the active tab's content */}
              <div className="flex lg:hidden flex-1 flex-col overflow-hidden pb-16">
                {mobileTab === "video" && (
                  <MainContent onNotFound={handleJobNotFound} />
                )}
                {mobileTab === "chat" && (
                  <div className="flex-1 flex flex-col p-3 overflow-hidden">
                    <AiChatBox messages={aiMessages} setMessages={setAiMessages} />
                  </div>
                )}
                {mobileTab === "study" && (
                  <div className="flex-1 flex flex-col p-3 overflow-hidden">
                    <StudyRoom />
                  </div>
                )}
              </div>

              {/* === MOBILE BOTTOM TAB BAR === */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#16181d] border-t border-gray-200 dark:border-gray-800 flex items-center justify-around py-2 z-40 safe-bottom">
                <button
                  onClick={() => setMobileTab("video")}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${mobileTab === "video"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  <Play size={20} className={mobileTab === "video" ? "fill-current" : ""} />
                  <span className="text-[10px] font-semibold">Video</span>
                </button>
                <button
                  onClick={() => setMobileTab("chat")}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${mobileTab === "chat"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  <Bot size={20} />
                  <span className="text-[10px] font-semibold">AI Chat</span>
                </button>
                <button
                  onClick={() => setMobileTab("study")}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${mobileTab === "study"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  <Users size={20} />
                  <span className="text-[10px] font-semibold">Study Room</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Error Toast Notification */}
      <div
        className={`fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 transform ${showErrorToast ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
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

