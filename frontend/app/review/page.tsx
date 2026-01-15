"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReviewCard } from "@/components/review/ReviewCard";
import { useEffect, useState } from "react";
import { ReviewNote, Video } from "@/types";
import { reviewService, videoService } from "@/services/api";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewNote[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reviewsData, videosData] = await Promise.all([
                    reviewService.getReviews(),
                    videoService.getVideos()
                ]);
                console.log("Reviews Response:", reviewsData);
                console.log("Videos Response:", videosData);

                if (Array.isArray(reviewsData)) {
                    setReviews(reviewsData);
                } else {
                    console.error("Reviews data is not an array:", reviewsData);
                    setReviews([]);
                }

                if (Array.isArray(videosData)) {
                    setVideos(videosData);
                } else {
                    console.error("Videos data is not an array:", videosData);
                    setVideos([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCardClick = (review: ReviewNote) => {
        // Navigate to main page with videoId and time params
        router.push(`/?videoId=${review.videoId}&time=${review.timestamp || ""}`);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0c10] text-white overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2 text-white">어도비 프리미어 프로</h1>
                    <p className="text-[#64748b] font-medium">복습 노트 ({reviews.length})</p>
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
                    {reviews.length === 0 ? (
                        <div className="text-center text-[#64748b] py-20">
                            <p>아직 작성된 복습 노트가 없습니다.</p>
                            <p className="text-sm mt-2">강의를 보며 궁금한 점을 질문해보세요!</p>
                        </div>
                    ) : (
                        reviews.map((review, index) => {
                            const video = videos.find(v => v.id === review.videoId);
                            const videoTitle = video ? video.title : `Video ${review.videoId}`;

                            return (
                                <div key={review.reviewId}>
                                    <ReviewCard
                                        index={index + 1}
                                        total={reviews.length}
                                        question={review.question}
                                        answer={review.answer}
                                        videoTitle={videoTitle}
                                        timeline={review.timestamp || "00:00"}
                                        videoId={review.videoId}
                                        sources={review.sources} // Pass sources
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
