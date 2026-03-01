<div align="center">
  <div style="background-color: #4f46e5; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  </div>
  
  # Vidsage
  
  **Transform Any YouTube Video into an Interactive Learning Experience**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=for-the-badge&logo=next.js)](#)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933.svg?style=for-the-badge&logo=node.js)](#)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg?style=for-the-badge&logo=socket.io)](#)
  [![OpenAI](https://img.shields.io/badge/AI-Tutor-412991.svg?style=for-the-badge&logo=openai)](#)
</div>

---

## 🚀 Overview

**Vidsage** is an AI-powered educational platform designed to supercharge the way people study online. By simply pasting a YouTube video link, Vidsage analyzes the content to instantly provide a comprehensive context-aware dashboard featuring a real-time AI Tutor, synchronized transcripts, adaptive quizzes, and collaborative study rooms.

Designed with a stunning **stark black/white high-contrast theme** and fluid animations, Vidsage offers a premium, immersive user experience tailored for modern learners, students, and professionals alike.

![Vidsage UI Preview](https://via.placeholder.com/1000x500/0f1117/ffffff?text=Vidsage+Platform+Preview) *<br>Note to recruiter: Insert actual project screenshot above for maximum impact.*

---

## ✨ Core Features

- 🧠 **Context-Aware AI Tutor:** Ask questions, clarify doubts, and converse with an AI that watches the video alongside you.
- 📹 **Smart Content Processing:** Paste any YouTube URL. Vidsage automatically validates, embeds, and processes the video using job-queue architecture. 
- 🤝 **Live Study Rooms:** Real-time multi-user collaboration using `Socket.IO`. Share your session URL and instantly chat synchronously with your peers watching the exact same content. Includes an `onlineCount` and rich message presence.
- 📝 **Auto-Generated Tooling:** Instant access to video overviews, full categorized transcripts, and dynamically generated quizzes to test your knowledge retention.
- 🌓 **Premium UI / Dark Mode:** Custom-built with `Tailwind CSS v4` showcasing glassmorphism highlights, modern micro-animations, resizable sidebars, and true `#000000` / `#ffffff` theme swapping.
- 🔐 **Secure Authentication:** Complete JWT cookie-based login/registration system protecting user dashboards and routing.

---

## 🛠️ Technology Stack

Vidsage uses a decoupled, high-performance architecture:

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS v4 (with custom `@custom-variant dark` support)
- **Icons:** Lucide React
- **State Management:** React Hooks (`useState`, `useEffect`, `useRef`) paired with Optimistic UI updates.
- **Real-Time Client:** Socket.IO Client

### Backend
- **Runtime:** Node.js / Express.js
- **Real-Time Server:** Socket.IO
- **Authentication:** JWT (JSON Web Tokens) over highly secure, HTTP-only cookies, combined with `bcrypt` for password hashing.
- **APIs:** Extensive job-polling logic for AI video processing queues.

---

## 💡 Technical Highlights & Problem Solving

For Recruiters & Engineers reviewing this codebase:

1. **Robust Real-Time Synchronization:** Overcame complex websocket race-conditions. Implemented strict `jobId` room chunking in `StudyRoom` using `socket.to(jobId).emit` on the backend to guarantee messages broadcast to the correct session instantly, preventing duplicate payload renders on the sender's client through optimistic UI practices.
2. **Advanced Layout Architecture:** Developed a fluid `ResizableSidebar` using native `mousemove` hooks, replacing static pixel constraints with flex-box fluid heights (`flex-1 min-h-0`) allowing nested components like the `AIChatBox` and `StudyRoom` to scale dynamically across all screen resolutions without overflowing. 
3. **Graceful Error Handling:** Handled missing/expired videos via 404 intercepts. Rather than breaking the app or throwing native window alerts, the frontend elegantly detects invalid states and presents users with a custom floating toast notification while halting unneeded backend polling intervals.
4. **Custom Tailwind V4 Configuration:** Engineered a bespoke dark-mode toggle that persists state via `localStorage` and manipulates the root DOM tree securely, ensuring instant 0-load paint times on dark themes.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/vidsage.git
   cd vidsage
   ```

2. **Setup Backend:**
   ```bash
   cd Vidsage-Backend
   npm install
   # Add your .env file with JWT_SECRET, PORT, API keys, etc.
   npm run start
   ```

3. **Setup Frontend:**
   ```bash
   cd vidsage-frontend
   npm install
   # Make sure your backend runs on port 3001, or update NEXT_PUBLIC_API_URL in .env
   npm run dev
   ```

4. **Experience Vidsage:** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Contributing

We welcome contributions! Please open an issue or submit a Pull Request on Github. For major changes, kindly open an issue first to discuss the proposed change.

## 📄 License

This project is open-sourced software licensed under the **[MIT License](LICENSE)**.

<div align="center">
  <p>Built with ❤️ by a passionate engineer focused on advancing EdTech.</p>
</div>
