"use client";

import { PlayCircle } from "lucide-react";

interface ReviewCardProps {
    index: number;
    total: number;
    question: string;
    answer: string;
    videoTitle: string;
    timeline: string;
}

export function ReviewCard({ index, total, question, answer, videoTitle, timeline }: ReviewCardProps) {
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
                    <span className="text-sm bg-[#161927] px-2 py-0.5 rounded text-blue-400 font-mono">
                        {timeline}
                    </span>
                </div>

                {/* Video Clip Placeholder */}
                <div className="w-full aspect-video bg-[#3b3f54] rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-[#444960] transition-colors">
                    <div className="text-[#6e7491] font-medium">영상 클립</div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
