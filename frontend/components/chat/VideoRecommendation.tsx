import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoSegment {
    time: string;
    label: string;
}

interface VideoRecommendationProps {
    title: string;
    count: number;
    segments: VideoSegment[];
    isExpanded?: boolean;
    onSeek: (time: string) => void;
}

export function VideoRecommendation({ title, count, segments, isExpanded = false, onSeek }: VideoRecommendationProps) {
    return (
        <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden mt-3 mb-1">
            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📺</span>
                    <span className="text-sm font-medium text-white">{title} <span className="text-gray-400">({count}개 구간)</span></span>
                </div>
                {/* Chevron could go here */}
            </div>

            {isExpanded && (
                <div className="border-t border-[#333]">
                    {segments.map((segment, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                            onClick={() => onSeek(segment.time)}
                        >
                            <PlayCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-blue-400 font-mono text-xs">{segment.time}</span>
                            <span className="text-sm text-gray-300">{segment.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
