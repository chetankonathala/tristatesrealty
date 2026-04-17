"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { FadeIn } from "@/components/motion/fade-in";

interface CommunityVideosProps {
  youtubeVideoIds: string[];
  customVideoUrls: string[];
  communityName: string;
}

export function CommunityVideos({
  youtubeVideoIds,
  customVideoUrls,
  communityName,
}: CommunityVideosProps) {
  if (youtubeVideoIds.length === 0 && customVideoUrls.length === 0) {
    return null;
  }

  return (
    <FadeIn>
      <section>
        <h2 className="font-[var(--font-display)] text-2xl lg:text-[28px] font-bold text-foreground mb-6">
          Community Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {youtubeVideoIds.map((videoId) => (
            <div
              key={videoId}
              className="rounded-lg overflow-hidden border border-border aspect-video"
            >
              <LiteYouTubeEmbed
                id={videoId}
                title={`${communityName} — Schell Brothers Community Tour`}
                poster="maxresdefault"
              />
            </div>
          ))}
          {customVideoUrls.map((url, index) => (
            <div
              key={`custom-${index}`}
              className="rounded-lg overflow-hidden border border-border"
            >
              <video
                controls
                preload="metadata"
                className="w-full aspect-video bg-black"
                aria-label={`${communityName} community tour video`}
              >
                <source src={url} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
