"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react"; // Assuming lucide-react is available, or use a simple SVG

export function DisclaimerPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show popup after a short delay on mount
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl p-5 max-w-sm relative text-sm text-zinc-900">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-900 transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="pr-4 space-y-3">
                    <p className="font-bold text-black text-base leading-tight">
                        음악 넣으려면 어떻게 해?<br />
                        영상 글자 글꼴 바꾸려면 어떻게 해?
                    </p>
                    <p className="text-zinc-600 font-medium">
                        이런 질문을 하면 영상을 찾아줄 겁니다.
                    </p>
                    <p className="text-amber-700 text-xs bg-amber-50 p-2.5 rounded-md border border-amber-100 font-medium leading-relaxed">
                        하지만 지금 정확도가 많이 낮아 10~20초 후에 관련 내용이 나옵니다.
                        추후 더 개선하여 바로 재생될 수 있게 하겠습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
