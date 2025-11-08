/**
 * Image Optimization Utilities
 *
 * Best practices for image loading in LiteWork:
 * - Use Next.js Image component for automatic optimization
 * - Lazy load below-the-fold images
 * - Provide proper width/height to prevent layout shift
 * - Use responsive sizes for different screen sizes
 */

import Image from "next/image";
import { ComponentProps } from "react";

/**
 * Optimized Image component with lazy loading
 * Automatically lazy loads images that are not in the initial viewport
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/workout.jpg"
 *   alt="Workout"
 *   width={800}
 *   height={600}
 *   priority={false} // Lazy load
 * />
 * ```
 */
export function OptimizedImage({
  priority = false,
  loading,
  ...props
}: ComponentProps<typeof Image>) {
  return (
    <Image
      {...props}
      priority={priority}
      loading={loading || (priority ? undefined : "lazy")}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    />
  );
}

/**
 * Avatar image with optimized settings
 * Perfect for user profile pictures
 */
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = "",
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    />
  );
}

/**
 * Exercise thumbnail with responsive sizes
 * Optimized for exercise library and workout cards
 */
export function ExerciseThumbnail({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={320}
      height={180}
      className="w-full h-auto object-cover rounded-lg"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading={priority ? undefined : "lazy"}
      priority={priority}
    />
  );
}

/**
 * Background image with blur effect
 * Perfect for hero sections and feature cards
 */
export function BackgroundImage({
  src,
  alt,
  className = "",
  overlay = true,
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      />
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}
    </div>
  );
}

/**
 * Image loading priorities guide:
 *
 * PRIORITY (Load immediately):
 * - Hero images above the fold
 * - Logo in header
 * - Critical visual content in viewport
 *
 * LAZY (Load on scroll):
 * - Images below the fold
 * - Exercise thumbnails in lists
 * - User avatars in feed
 * - Gallery images
 * - Footer images
 *
 * EAGER (Default, but optimize):
 * - Small icons
 * - UI elements
 */

/**
 * Responsive image sizes by breakpoint
 * Use with sizes prop on Next.js Image
 */
export const IMAGE_SIZES = {
  avatar: "(max-width: 768px) 48px, 64px",
  thumbnail: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  hero: "100vw",
  card: "(max-width: 768px) 100vw, 50vw",
  icon: "32px",
} as const;

/**
 * Image quality settings by use case
 */
export const IMAGE_QUALITY = {
  thumbnail: 75,
  highQuality: 90,
  avatar: 80,
  background: 70,
} as const;
