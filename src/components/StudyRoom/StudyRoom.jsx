"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function StudyRoom() {

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/user/me").then(res => setUser(res.data.user)).catch(console.error);
  }, []);

  // ✅ FIX 1: Initialize messages from sessionStorage to allow cross-page persistence
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined" || !jobId) return [];
    try {
      const saved = sessionStorage.getItem(`vidsage_socket_msgs_${jobId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (jobId && messages.length > 0) {
      sessionStorage.setItem(`vidsage_socket_msgs_${jobId}`, JSON.stringify(messages));
    }
  }, [messages, jobId]);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // ✅ NEW: State for "Copied!" tooltip on the Invite button
  const [copied, setCopied] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Socket.IO connection lifecycle ──
  useEffect(() => {
    // ✅ FIX 2: Guard — don't connect at all if there's no jobId.
    // Without a jobId we don't know which room to join, so connecting
    // would be pointless and could cause errors on the backend.
    if (!jobId) return;

    // Dynamically determine socket URL (localhost vs network IP)
    const getSocketUrl = () => {
      if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:3001`;
      }
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    };

    const socket = io(getSocketUrl(), {
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
    });
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      // ✅ FIX 3: Emit "join_room" INSIDE the "connect" handler,
      // and pass the actual jobId value as the payload.
      //
      // WHY inside "connect"?  Because socket.emit() before the socket
      // is connected will silently queue the event, and if the connection
      // fails or reconnects, the join_room may never reach the server.
      // Emitting inside "connect" guarantees the socket is live.
      //
      // WHY pass jobId?  The backend needs to know WHICH room to put
      // this user into.  Before, the code was passing a callback
      // instead of the jobId string, which the backend couldn't use.
      socket.emit("join-room", jobId);
      console.log("Requested to join room:", jobId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // ── Incoming events ──
    // Receive a chat message broadcast by the backend
    // Backend sends: { user: { id, email }, message, time }
    socket.on("chat-message", (data) => {
      // Don't show our own messages again (we already added them optimistically)
      if (data.user?.id === socket.id) return;
      setMessages((prev) => [
        ...prev,
        {
          from: data.user?.name || "Anonymous",
          color: "bg-gray-200 text-gray-800",
          text: data.message,
          isMe: false,
        },
      ]);
    });

    // Optional: track how many users are in the room
    socket.on("online_count", (count) => {
      setOnlineCount(count);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };

    // ✅ FIX 4: Add jobId to the dependency array.
    //
    // WHY? If the user navigates to a different jobId (unlikely but possible),
    // this effect needs to re-run: disconnect from the old room's socket
    // and create a new socket that joins the new room.
    // Before, the dependency array was [], meaning the effect only ran once
    // on mount — if jobId changed, the socket would stay in the old room.
  }, [jobId]);

  // ── Send a message ──
  // ✅ FIX 5: Removed the unused (jobId, message) parameters.
  //
  // WHY? handleSend is called from onClick and handleKeyDown with no arguments.
  // The old signature (jobId, message) was misleading — neither parameter was
  // used inside the function; it reads `msg` from state and `jobId` from the
  // outer scope instead. Removing them avoids confusion.
  const handleSend = () => {
    const text = msg.trim();
    if (!text || !socketRef.current) return;

    // Send with the exact shape the backend expects: { jobId, message }
    // The backend does: io.to(jobId).emit("chat-message", { user, message, time })
    const payload = { jobId, message: text };
    socketRef.current.emit("chat-message", payload);

    // Optimistically append our own message so it appears instantly
    // without waiting for a server round-trip
    setMessages((prev) => [
      ...prev,
      {
        from: "You",
        color: "bg-indigo-200 text-indigo-800",
        text,
        isMe: true,
      },
    ]);
    setMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ FIX 7: Invite button copies the shareable URL to clipboard.
  //
  // WHY? The whole point is that User A can share their session with User B.
  // This builds a URL like "https://yoursite.com/dashbord?jobId=abc123"
  // and copies it so User A can paste it in a chat / DM / email.
  const handleInvite = async () => {
    const shareUrl = `${window.location.origin}/dashbord?jobId=${jobId}`;
    try {
      // Modern secure contexts (localhost or HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for insecure contexts (HTTP on local network)
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        // Move outside of screen to make it invisible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error("Fallback copy failed", error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          {/* <div className="flex -space-x-1.5">
            {["bg-amber-300", "bg-orange-300", "bg-rose-300", "bg-sky-300"].map((c, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white dark:border-[#09090b]`} />
            ))}
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 border-2 border-white dark:border-[#09090b] flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
              {onlineCount > 0 ? `+${onlineCount}` : "+4"}
            </div>
          </div> */}
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              Study Room
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} title={isConnected ? "Connected" : "Disconnected"} />
            </div>
          </div>
        </div>

        {/* ✅ FIX 7 continued: Invite button with copy-to-clipboard + "Copied!" feedback */}
        <button
          onClick={handleInvite}
          className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all"
        >
          {copied ? "Copied!" : "Invite"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.isMe || m.from === "You";
          const displayName = isMe ? (user?.name || "User") : (m.from || "Anonymous");
          return (
            <div key={i} className={`flex gap-2 ${m.isMe ? "flex-row-reverse" : ""}`}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isMe ? 'c7d2fe' : 'e5e7eb'}&color=${isMe ? '3730a3' : '1f2937'}&rounded=true`}
                alt={displayName}
                className="w-7 h-7 rounded-full flex-shrink-0"
              />
              <div className={`flex flex-col gap-0.5 max-w-[82%] ${m.isMe ? "items-end" : ""}`}>
                {!m.isMe && <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1">{m.from}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.isMe ? "bg-indigo-50 dark:bg-indigo-600 text-indigo-900 dark:text-white" : "bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200"
                  }`}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              placeholder="Message group..."
            />
            <button onClick={handleSend} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}