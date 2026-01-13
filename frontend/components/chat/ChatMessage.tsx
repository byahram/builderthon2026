import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "ai";
    content: string;
    children?: React.ReactNode;
}

export function ChatMessage({ role, content, children }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[85%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    isUser ? "bg-blue-600 hidden" : "bg-gradient-to-br from-purple-500 to-blue-500"
                )}>
                    {!isUser && <Bot className="h-5 w-5 text-white" />}
                </div>

                <div className="flex flex-col gap-2">
                    {content && (
                        <div className={cn(
                            "px-4 py-3 text-sm leading-relaxed",
                            isUser
                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                : "bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-tl-sm border border-[#333]"
                        )}>
                            {content}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
