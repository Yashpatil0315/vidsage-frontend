"use client";
import React, { useState, useRef, useEffect } from "react";

export default function ResizableSidebar({ children }) {
    const [width, setWidth] = useState(320);
    const isResizing = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            // Calculate width from the right edge of the screen
            const newWidth = window.innerWidth - e.clientX;
            // Restrict minimum and maximum widths
            if (newWidth >= 280 && newWidth <= window.innerWidth * 0.6) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "auto";
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div
            className="relative flex-shrink-0 bg-slate-50/50 shadow-[-4px_0_15px_rgba(0,0,0,0.02)] hidden lg:flex flex-col h-full border-l border-gray-200/60"
            style={{ width }}
        >
            {/* Draggable Handle */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1.5 -ml-[3px] cursor-col-resize z-50 hover:bg-indigo-300 transition-colors opacity-70"
                onMouseDown={(e) => {
                    e.preventDefault();
                    isResizing.current = true;
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                }}
                title="Drag to resize"
            />

            {/* Sidebar Content wrapper */}
            <div className="flex-1 flex flex-col min-h-0 p-3 gap-3 overflow-y-auto w-full h-full">
                {children}
            </div>
        </div>
    );
}

