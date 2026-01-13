
import { ReactNode } from "react";

interface VideoHeaderProps {
    children?: ReactNode;
}

export function VideoHeader({ children }: VideoHeaderProps) {
    return (
        <div className="flex items-center justify-between py-5 px-4 bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-10 w-full mb-6 border-b border-[#333333] shadow-sm">
            <h1 className="text-xl font-bold text-white truncate max-w-full">
                어도비 프리미어 프로
            </h1>
            {children}
        </div>
    );
}
