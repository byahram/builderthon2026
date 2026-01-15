"use client";

import { PlayCircle } from "lucide-react";
import { useState } from "react";

interface ReviewCardProps {
    index: number;
    total: number;
    question: string;
    answer: string;
    videoTitle: string;
    timeline: string;
    videoId?: string;
}

export function ReviewCard({ index, total, question, answer, videoTitle, timeline, videoId }: ReviewCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(true);
    };

    const timeToSeconds = (timeStr: string) => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return 0;
    };

    return (
        <div className="bg-[#1e2337] rounded-2xl p-6 sm:p-8 mb-6 border border-white/5 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[#aeb1cc] font-medium text-lg">질문</h3>
                <span className="text-[#5b617c] text-sm font-medium">
                    {index} / {total}
                </span>
            </div>

            <div className="mb-8">
                <p className="text-white text-xl font-semibold leading-relaxed mb-6">
                    {question}
                </p>

                <div className="bg-[#161927] p-4 rounded-xl text-[#d0d3e3] leading-relaxed mb-8 border-l-4 border-blue-500">
                    {answer}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#aeb1cc]">
                    <PlayCircle className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-base">{videoTitle}</span>
                    <button
                        onClick={handlePlay}
                        className="text-sm bg-[#161927] px-2 py-0.5 rounded text-blue-400 font-mono hover:bg-[#23273a] transition-colors"
                    >
                        {timeline}
                    </button>
                </div>

                {/* Video Clip or Player */}
                {isPlaying && videoId ? (
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?start=${timeToSeconds(timeline)}&autoplay=1&modestbranding=1&rel=0`}
                            title={videoTitle}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div
                        onClick={handlePlay}
                        className="w-full aspect-video bg-[#3b3f54] rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
                    >
                        {videoId ? (
                            <img
                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                alt={videoTitle}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="text-[#6e7491] font-medium">영상 정보 없음</div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/90 drop-shadow-xl transform group-hover:scale-110 transition-all duration-300 ease-out" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
