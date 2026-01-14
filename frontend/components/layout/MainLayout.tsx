"use client";

import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoHeader } from "@/components/video/VideoHeader";
import { useState } from "react";
import { CurriculumCarousel } from "@/components/video/CurriculumCarousel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";



const timeToSeconds = (timeStr: string) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
};

import { videoService } from "@/services/api";
import { useEffect } from "react";

export function MainLayout() {
    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
    const [currentVideoId, setCurrentVideoId] = useState<string>("");

    useEffect(() => {
        const initVideo = async () => {
            const videos = await videoService.getVideos();
            if (videos.length > 0) {
                setCurrentVideoId(videos[0].id);
            }
        };
        initVideo();
    }, []);

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
