"use client";

export function VideoPlayer({ seekTime, videoId = "OX5gGnn0j6k" }: { seekTime?: number, videoId?: string }) {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
        modestbranding: "1",
        rel: "0",
        autoplay: "0",
    });

    if (seekTime) {
        params.set("start", seekTime.toString());
        params.set("autoplay", "1");
    }

    const src = `${baseUrl}?${params.toString()}`;

    return (
        <div className="relative w-full max-h-[70vh] aspect-video mx-auto bg-black rounded-xl overflow-hidden shadow-lg">
            <iframe
                key={videoId} // Force re-render on video change
                className="w-full h-full"
                src={src}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
        </div>
    );
}
