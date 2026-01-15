"use client";

import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoHeader } from "@/components/video/VideoHeader";
import { useState } from "react";
import { CurriculumCarousel } from "@/components/video/CurriculumCarousel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";



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

import { videoService } from "@/services/api";
import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MainLayoutContent() {
    const searchParams = useSearchParams();
    const initialVideoId = searchParams.get("videoId");
    const initialTime = searchParams.get("time");

    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
    const [currentVideoId, setCurrentVideoId] = useState<string>("");

    useEffect(() => {
        const initVideo = async () => {
            const videos = await videoService.getVideos();
            if (videos.length > 0) {
                if (initialVideoId) {
                    setCurrentVideoId(initialVideoId);
                } else {
                    setCurrentVideoId(videos[0].id);
                }

                if (initialTime) {
                    setSeekTime(timeToSeconds(initialTime));
                }
            }
        };
        initVideo();
    }, [initialVideoId, initialTime]);

    const handleSeek = (time: string, videoId?: string) => {
        const seconds = timeToSeconds(time);
        if (videoId && videoId !== currentVideoId) {
            setCurrentVideoId(videoId);
        }
        setSeekTime(seconds);
    };

    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
        setSeekTime(0);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-black">
            {/* Main Content (Video) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0f0f0f]">
                <VideoHeader />
                <div className="w-full mx-auto px-6 pb-10 pt-2">
                    <VideoPlayer seekTime={seekTime} videoId={currentVideoId} />
                    <CurriculumCarousel onVideoSelect={handleVideoSelect} currentVideoId={currentVideoId} />
                </div>
            </div>

            {/* Sidebar (Chat) */}
            <div className="w-[400px] shrink-0 hidden lg:block h-full">
                <ChatSidebar onSeek={handleSeek} />
            </div>
        </div>
    );
}

export function MainLayout() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MainLayoutContent />
        </Suspense>
    );
}
