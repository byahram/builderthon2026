"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReviewCard } from "@/components/review/ReviewCard";

const REVIEWS = [
    {
        id: 1,
        question: "프리미어 프로에서 자동 자막 기능을 사용할 때, 특정 화자의 목소리만 자막으로 생성하려면 어떤 설정을 조정해야 하나요?",
        answer: "텍스트 패널의 '캡션' 탭에서 '화자 표시' 옵션을 활성화하고, 불필요한 트랙의 오디오를 음소거하거나 특정 트랙만 선택하여 자막 생성을 진행하면 됩니다. 또한, '설정 편집'에서 특정 화자를 식별하여 이름을 지정할 수도 있습니다.",
        videoTitle: "프리미어 프로 기초 강좌 - 자막 마스터하기",
        timeline: "04:32"
    },
    {
        id: 2,
        question: "루미트리 컬러(Lumetri Color) 패널에서 영상의 특정 색상만 변경하고 싶을 때 사용하는 기능은 무엇인가요?",
        answer: "루미트리 컬러 패널의 'HSL 보조(HSL Secondary)' 섹션을 사용하면 됩니다. 스포이드 도구로 변경하려는 색상을 선택한 후, 색조(Hue), 채도(Saturation), 밝기(Luma)를 조절하여 마스크를 생성하고 교정 섹션에서 색상을 변경할 수 있습니다.",
        videoTitle: "프리미어 프로 색보정 꿀팁",
        timeline: "12:15"
    }
];

export default function ReviewPage() {
    return (
        <main className="min-h-screen bg-[#0a0c10] text-white overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2 text-white">어도비 프리미어 프로</h1>
                    <p className="text-[#64748b] font-medium">복습 노트</p>
                </div>

                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-[#94a3b8] hover:text-white transition-colors text-sm font-medium hover:bg-white/5 px-3 py-2 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        강의로 돌아가기
                    </Link>
                </div>

                {/* Review Cards */}
                <div className="space-y-6">
                    {REVIEWS.map((review, index) => (
                        <ReviewCard
                            key={review.id}
                            index={index + 1}
                            total={REVIEWS.length}
                            {...review}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
