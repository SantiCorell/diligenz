"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function BlogPostImage({ src, alt, className = "", fill, ...rest }: Props) {
  const [error, setError] = useState(false);
  const isExternal =
    typeof src === "string" &&
    (src.startsWith("http://") || src.startsWith("https://"));

  if (error) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[var(--brand-bg-lavender)]"
        aria-hidden
      >
        <span className="text-xs text-[var(--brand-primary)] opacity-50">
          Imagen no disponible
        </span>
      </div>
    );
  }

  if (isExternal && fill) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        loading="eager"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        sizes={rest.sizes}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      unoptimized={isExternal}
      fill={fill}
      className={className}
      {...rest}
    />
  );
}
