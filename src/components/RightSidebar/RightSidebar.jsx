import React from 'react';
import { MoreHorizontal, ArrowUp, Send } from 'lucide-react';

export default function RightSidebar() {
    return (
        <aside className="w-[400px] h-[calc(100vh-80px)] bg-sidebar-bg border-l border-sidebar-border overflow-y-auto flex flex-col p-6 sticky top-20">

            {/* AI Tutor Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                        AI
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-none">AI Tutor</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#22c55e]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
                            <span>Online • Context Aware</span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* AI Tutor Chat */}
            <div className="flex flex-col gap-4 mb-4">

                {/* AI Message */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#a78bfa] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        AI
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                        Hello Alex! I'm tracking the video context. Feel free to ask about the <strong>chain rule derivation</strong> shown at 12:45.
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 text-center -mt-2">Just now</div>

                {/* User Message */}
                <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a7324] flex-shrink-0 shadow-md"></div>
                    <div className="bg-primary text-white rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed shadow-md">
                        Can you explain why we need the derivative of the activation function here?
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 text-right pr-12 -mt-2">2m ago</div>

                {/* AI Message 2 */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#a78bfa] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        AI
                    </div>
                    <div className="bg-[#f8f9fc] rounded-2xl rounded-tl-sm p-4 text-sm text-gray-700 leading-relaxed max-h-32 overflow-hidden relative">
                        Great question! The derivative of the activation function is crucial because it tells us how sensitive the neuron's output is to its input. Without it, we wouldn't know how to adjust the weights to minimise the error.
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#f8f9fc] to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* AI Input */}
            <div className="relative mb-8 pt-2">
                <input
                    type="text"
                    placeholder="Ask AI about the video..."
                    className="w-full bg-[#f8f9fc] text-sm text-gray-700 rounded-full py-3.5 pl-5 pr-12 border border-transparent focus:border-sidebar-border focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-hover shadow-md transition-colors">
                    <ArrowUp size={16} strokeWidth={3} />
                </button>
            </div>

            {/* Study Room Header */}
            <div className="border-t border-gray-100 pt-6 mt-2 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-[#d4af37] border-2 border-white relative z-20"></div>
                            <div className="w-8 h-8 rounded-full bg-[#b39e6a] border-2 border-white relative z-10"></div>
                            <div className="w-8 h-8 rounded-full bg-[#e5e7eb] border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 relative z-0">+4</div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Study Room</h3>
                            <p className="text-[10px] text-gray-500">ML Study Group A</p>
                        </div>
                    </div>
                    <button className="text-primary text-xs font-semibold hover:underline">Invite</button>
                </div>
            </div>

            {/* Study Room Chat */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide flex flex-col gap-6 relative">

                {/* Message 1 */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#c0bba6] flex-shrink-0 mt-1"></div>
                    <div>
                        <div className="text-xs font-bold text-gray-900 mb-1">John Doe</div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-700 shadow-sm leading-relaxed">
                            Is anyone else stuck on the gradient descent part?
                        </div>
                    </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d8b85b] flex-shrink-0 mt-1"></div>
                    <div>
                        <div className="text-xs font-bold text-gray-900 mb-1">Emily R.</div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-700 shadow-sm leading-relaxed">
                            Yeah, I think I need to re-watch the previous module on partial derivatives.
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-4 my-2">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <div className="text-[9px] font-bold text-gray-400 tracking-wider">NEW MESSAGES</div>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 flex-row-reverse mb-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a7324] flex-shrink-0 mt-1"></div>
                    <div className="bg-[#eaebfa] rounded-2xl rounded-tr-sm p-3.5 text-sm text-gray-800 shadow-sm leading-relaxed">
                        I just asked the AI Tutor, it cleared it up for me. The key is applying the chain rule backwards.
                    </div>
                </div>

                {/* Sticky Input */}
                <div className="absolute bottom-0 left-0 w-full bg-white bg-opacity-90 pt-2 pb-4 backdrop-blur-sm -mx-1 px-1">
                    <div className="relative flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold pb-0.5 ml-2 cursor-pointer hover:bg-gray-400 transition-colors">+</div>
                        <input
                            type="text"
                            placeholder="Message group..."
                            className="flex-1 bg-[#f3f4f6] text-sm text-gray-700 rounded-full py-2.5 px-4 outline-none placeholder:text-gray-400"
                        />
                        <button className="text-primary hover:text-primary-hover mr-2 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>

            </div>

        </aside>
    );
}
