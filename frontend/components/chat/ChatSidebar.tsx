import { useState } from "react";
import { X, Send, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { ChatMessage } from "./ChatMessage";
import { VideoRecommendation } from "./VideoRecommendation";
import { chatService } from "@/services/api";

type Message = {
    role: "user" | "ai";
    content: string;
    sources?: any[];
};

export function ChatSidebar({ onSeek }: { onSeek: (time: string, videoId?: string) => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(userMessage);

            // The format from backend is { notes: [ { summary: "...", sources: [] } ] }
            // We'll take the first note's summary as the answer.
            if (data.notes && data.notes.length > 0) {
                const note = data.notes[0];
                setMessages(prev => [...prev, {
                    role: "ai",
                    content: note.summary,
                    sources: note.sources
                }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", content: "죄송합니다. 답변을 생성하지 못했습니다." }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "ai", content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] border-l border-[#303030]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#303030]">
                <div className="font-semibold text-white">영상 내용 질문하기</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="bg-[#1e1e1e] text-gray-300 text-sm p-4 rounded-xl leading-relaxed max-w-[90%]">
                            본 AI는 수강 중인 영상 내용만 답변하며,<br />
                            해당 영상의 제목과 타임라인을 제공합니다.<br />
                            영상에 없는 질문에는 답변하지 않습니다.
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <ChatMessage key={idx} role={msg.role} content={msg.content}>
                                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {/* Group sources by video title if needed, or just map them */}
                                        {msg.sources.map((src: any, sIdx: number) => (
                                            <VideoRecommendation
                                                key={sIdx}
                                                title={src.title}
                                                count={1}
                                                isExpanded={true}
                                                segments={[
                                                    { time: src.timestamp, label: "관련 구간" }
                                                ]}
                                                onSeek={(time) => onSeek(time, src.videoId)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ChatMessage>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                답변을 생성하는 중...
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Review Note Button */}
            <div className="p-4 border-t border-[#303030]">
                <Link
                    href="/review"
                    className="flex justify-center items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-xl text-sm font-bold transition-colors w-full"
                >
                    <BookOpen className="w-4 h-4" />
                    복습노트열기
                </Link>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-0">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="수강 영상 내용에 대해 질문해 보세요"
                        className="w-full bg-[#2a2a2a] border border-[#333] text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#3a3a3a] hover:bg-blue-600 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4 text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
