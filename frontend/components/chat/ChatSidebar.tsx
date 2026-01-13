import { X, Send, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { ChatMessage } from "./ChatMessage";
import { VideoRecommendation } from "./VideoRecommendation";

export function ChatSidebar({ onSeek }: { onSeek: (time: string) => void }) {
    return (
        <div className="flex flex-col h-full bg-[#121212] border-l border-[#303030]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#303030]">
                <div className="font-semibold text-white">AI 학습 도우미 (Fast-Brain)</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                <ChatMessage
                    role="user"
                    content="상태 관리 라이브러리 비교해줘"
                />

                <ChatMessage
                    role="ai"
                    content="Redux는 복잡하지만 강력하고, Recoil은 가볍습니다. 관련 구간을 찾았습니다."
                >
                    <VideoRecommendation
                        title="영상 A: Redux의 이해"
                        count={2}
                        isExpanded={true}
                        segments={[
                            { time: "04:20", label: "Redux 개념" },
                            { time: "08:15", label: "Redux 장단점" }
                        ]}
                        onSeek={onSeek}
                    />
                    <VideoRecommendation
                        title="영상 B: Recoil 시작하기"
                        count={1}
                        segments={[
                            { time: "01:30", label: "Recoil 기초" }
                        ]}
                        onSeek={onSeek}
                    />
                </ChatMessage>


            </div>

            {/* Review Note Button */}
            <div className="p-4 border-t border-[#303030]">
                <Link
                    href="/review"
                    className="flex justify-center items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-xl text-sm font-bold transition-colors w-full"
                >
                    <BookOpen className="w-4 h-4" />
                    복습노트 열기
                </Link>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="궁금한 내용을 물어보세요..."
                        className="w-full bg-[#2a2a2a] border border-[#333] text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#3a3a3a] hover:bg-blue-600 rounded-lg transition-colors group">
                        <Send className="h-4 w-4 text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
