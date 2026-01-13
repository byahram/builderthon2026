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

export function MainLayout() {
    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);

    const handleSeek = (time: string) => {
        const seconds = timeToSeconds(time);
        setSeekTime(seconds);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-black">
            {/* Main Content (Video) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0f0f0f]">
                <VideoHeader />
                <div className="w-full mx-auto px-6 pb-10 pt-2">
                    <VideoPlayer seekTime={seekTime} />
                    <CurriculumCarousel />
                </div>
            </div>

            {/* Sidebar (Chat) */}
            <div className="w-[400px] shrink-0 hidden lg:block h-full">
                <ChatSidebar onSeek={handleSeek} />
            </div>
        </div>
    );
}
