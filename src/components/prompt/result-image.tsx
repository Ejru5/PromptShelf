import Image from "next/image";
import type { Media } from "@/content/schema";
import { cn } from "@/lib/cn";

/** next/image for result media: intrinsic size + blur placeholder from the content build. */
export function ResultImage({
  media,
  alt,
  sizes,
  fill,
  preload,
  className,
}: {
  media: Media;
  alt: string;
  sizes: string;
  fill?: boolean;
  preload?: boolean;
  className?: string;
}) {
  const common = {
    src: media.src,
    sizes,
    preload,
    placeholder: media.blurDataURL ? ("blur" as const) : ("empty" as const),
    blurDataURL: media.blurDataURL,
    className: cn("object-cover", className),
  };
  return fill ? (
    <Image {...common} alt={alt} fill />
  ) : (
    <Image {...common} alt={alt} width={media.width} height={media.height} />
  );
}
