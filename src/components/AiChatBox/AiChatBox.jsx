"use client"
import { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import { useSearchParams } from "next/navigation";

export default function AIChatBox({ messages, setMessages }) {

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/user/me").then(res => setUser(res.data.user)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const pollTranscript = async () => {
      try {
        const res = await api.get(`/job/${jobId}`);
        const { transcript, status } = res.data;

        // Once transcript is non-empty, remove the loader
        if (transcript && transcript !== "") {
          setLoading(false);
        }

        // Stop polling only when the job is fully completed
        if (status === "completed") {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error("Error polling transcript:", err);
      }
    };

    // Initial fetch + poll every 3 seconds
    pollTranscript();
    intervalRef.current = setInterval(pollTranscript, 3000);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input, time: "Just now" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await api.post("/ai/ask", { jobId: jobId, question: userMessage.text });
      const aiMessage = { from: "ai", text: res.data.answer, time: null };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { from: "ai", text: "Sorry, I'm having trouble connecting right now.", time: null };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };





  // messages & setMessages are now received from the parent to persist across tab switches and screen resizes

  return (
    <>
      {!loading ? (
        <div className="flex flex-col bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">AI Tutor</div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online • Context Aware
                </div>
              </div>
            </div>
            <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                {m.from === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AI</div>
                )}
                {m.from === "user" && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=fcd34d&color=92400e&rounded=true`}
                    alt="User"
                    className="w-7 h-7 rounded-full flex-shrink-0"
                  />
                )}
                <div className={`max-w-[78%] ${m.from === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === "ai"
                    ? "bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200"
                    : "bg-indigo-600 text-white"
                    }`}>
                    {m.bold ? (
                      <span>{m.text}<strong>{m.bold}</strong>{m.after}</span>
                    ) : m.text}
                  </div>
                  {m.time && <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">{m.time}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                placeholder="Ask AI about the video..."
              />
              <button onClick={handleSend} className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          {/* Animated spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-indigo-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }}></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preparing AI Tutor</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">Generating transcript...</p>
          </div>
        </div>
      )}
    </>
  );
}
