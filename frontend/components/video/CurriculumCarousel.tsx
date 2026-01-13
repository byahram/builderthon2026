"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoService } from "@/services/api";
import { Video } from "@/types";

interface CurriculumCarouselProps {
    onVideoSelect: (videoId: string) => void;
    currentVideoId: string;
}

export function CurriculumCarousel({ onVideoSelect, currentVideoId }: CurriculumCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await videoService.getVideos();
                setVideos(data);
            } catch (error) {
                console.error("Failed to load videos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

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

    const getYouTubeId = (url: string) => {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : "";
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
                    {loading ? (
                        <div className="text-white text-sm p-4">Loading videos...</div>
                    ) : (
                        videos.map((item) => {
                            const videoId = getYouTubeId(item.videoUrl);
                            const isCurrent = videoId === currentVideoId;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onVideoSelect(videoId)}
                                    className={cn(
                                        "flex-none w-[280px] p-4 rounded-xl cursor-pointer transition-all snap-start border",
                                        isCurrent
                                            ? "bg-[#222222] border-blue-500/50"
                                            : "bg-[#111111] border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a]"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-xs font-semibold px-2 py-0.5 rounded",
                                            isCurrent ? "bg-blue-900/30 text-blue-400" : "bg-gray-800 text-gray-400"
                                        )}>
                                            Video
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-500 mb-1">{new Date(item.createdAt).toLocaleDateString()}</div>
                                    <h3 className={cn(
                                        "font-medium text-sm line-clamp-2 mb-3 h-10",
                                        isCurrent ? "text-white" : "text-gray-300"
                                    )}>
                                        {item.title}
                                    </h3>

                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <PlayCircle className="w-3 h-3" />
                                        <span>{item.duration}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
