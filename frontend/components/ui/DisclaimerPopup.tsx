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
        <>
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
            <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 animate-float">
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl p-6 max-w-md relative text-sm text-zinc-900">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-900 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="pr-4 space-y-4">
                        <p className="font-bold text-black text-lg leading-tight">
                            1. 잔상효과 어떻게 만들어?<br />
                            2. 한글 입력 때문에 단축키가 안 먹을 땐 어떻게 해야 해?<br />
                            3. 컷 편집할 때 자르기 도구/선택 도구 단축키는 뭐야?<br />
                            4. 영상 어떻게 저장해?<br />
                            5. 타임라인에서 클립을 더 길게/짧게 보이게 확대·축소하는 방법은 뭐가 있어?
                        </p>
                        <p className="text-zinc-600 font-medium text-base">
                            이런 질문을 하면 영상을 찾아줄 겁니다.
                        </p>
                        <p className="text-amber-700 text-sm bg-amber-50 p-3 rounded-md border border-amber-100 font-medium leading-relaxed">
                            하지만 지금 정확도가 많이 낮아 10~20초 후에 관련 내용이 나옵니다.
                            추후 더 개선하여 바로 재생될 수 있게 하겠습니다.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
