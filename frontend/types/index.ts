export interface Video {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    createdAt: string;
}

export interface ReviewNote {
    reviewId: number;
    question: string;
    answer: string;
    videoId: string;
    timestamp: string | null;
    sources?: {
        videoId: string;
        title: string;
        timestamp: string;
        thumbnail?: string;
    }[];
}
