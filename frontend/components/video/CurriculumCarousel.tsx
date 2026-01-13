"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurriculumItem {
    id: number;
    part: string;
    chapter: string;
    title: string;
    duration: string;
    isCompleted?: boolean;
    isCurrent?: boolean;
}

const CURRICULUM_DATA: CurriculumItem[] = [
    { id: 1, part: "PART 01", chapter: "Chapter 01", title: "AI 영화 제작의 기초: 개요 및 툴 소개", duration: "12:45", isCompleted: true },
    { id: 2, part: "PART 01", chapter: "Chapter 02", title: "시나리오 작성: ChatGPT 활용법", duration: "15:20", isCompleted: true },
    { id: 3, part: "PART 02", chapter: "Chapter 01", title: "다큐멘터리 영화 기획 과정", duration: "06:06", isCurrent: true },
    { id: 4, part: "PART 02", chapter: "Chapter 02", title: "이미지 생성: Midjourney 프롬프트 엔지니어링", duration: "25:30" },
    { id: 5, part: "PART 02", chapter: "Chapter 03", title: "영상 생성: Runway Gen-2 마스터하기", duration: "18:45" },
    { id: 6, part: "PART 02", chapter: "Chapter 04", title: "음성 합성: ElevenLabs로 내레이션 만들기", duration: "10:15" },
    { id: 7, part: "PART 03", chapter: "Chapter 01", title: "편집 및 후반 작업: Premiere Pro 워크플로우", duration: "32:10" },
    { id: 8, part: "PART 03", chapter: "Chapter 02", title: "사운드 디자인과 배경음악", duration: "14:50" },
];

export function CurriculumCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = 300;
        scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    };

    return (
        <div className="mt-8 relative group">
            <h2 className="text-lg font-bold text-white mb-4 px-1">강의 목차</h2>

            <div className="relative">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 rounded-full text-white hover:bg-black transition-all -translate-x-1/2 border border-gray-800"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {CURRICULUM_DATA.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "flex-none w-[280px] p-4 rounded-xl cursor-pointer transition-all snap-start border",
                                item.isCurrent
                                    ? "bg-[#222222] border-blue-500/50"
                                    : "bg-[#111111] border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-xs font-semibold px-2 py-0.5 rounded",
                                    item.isCurrent ? "bg-blue-900/30 text-blue-400" : "bg-gray-800 text-gray-400"
                                )}>
                                    {item.part}
                                </span>
                                {item.isCompleted && (
                                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 mb-1">{item.chapter}</div>
                            <h3 className={cn(
                                "font-medium text-sm line-clamp-2 mb-3 h-10",
                                item.isCurrent ? "text-white" : "text-gray-300"
                            )}>
                                {item.title}
                            </h3>

                            <div className="flex items-center text-xs text-gray-500 gap-2">
                                <PlayCircle className="w-3 h-3" />
                                <span>{item.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 rounded-full text-white hover:bg-black transition-all translate-x-1/2 border border-gray-800"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
