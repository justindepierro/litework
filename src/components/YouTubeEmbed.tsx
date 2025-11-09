"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Alert } from "@/components/ui/Alert";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // youtube.com/watch?v=VIDEO_ID
    if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname === "/watch"
    ) {
      return urlObj.searchParams.get("v");
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1); // Remove leading slash
    }

    // youtube.com/embed/VIDEO_ID or youtube.com/v/VIDEO_ID
    if (urlObj.hostname.includes("youtube.com")) {
      const match = urlObj.pathname.match(/\/(embed|v)\/([^/?]+)/);
      if (match) {
        return match[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function YouTubeEmbed({
  url,
  title = "Exercise demonstration",
  autoplay = false,
  className = "",
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <Alert variant="error" title="Invalid YouTube URL">
        <p className="text-xs">
          Please provide a valid YouTube link (e.g., https://youtu.be/VIDEO_ID)
        </p>
      </Alert>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${autoplay ? "autoplay=1&" : ""}rel=0&modestbranding=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className={`relative ${className}`}>
      {/* 16:9 aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Loading video...</p>
            </div>
          </div>
        )}

        <iframe
          className={`absolute top-0 left-0 w-full h-full rounded-lg shadow-md ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Open in YouTube link */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>{title}</span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open in YouTube
        </a>
      </div>
    </div>
  );
}

/**
 * Utility function to detect if a string contains a YouTube URL
 */
export function containsYouTubeUrl(text: string): boolean {
  const youtubeRegex =
    /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^\s]+/gi;
  return youtubeRegex.test(text);
}

/**
 * Utility function to extract all YouTube URLs from text
 */
export function extractYouTubeUrls(text: string): string[] {
  const youtubeRegex =
    /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^\s]+/gi;
  const matches = text.match(youtubeRegex);
  return matches || [];
}
