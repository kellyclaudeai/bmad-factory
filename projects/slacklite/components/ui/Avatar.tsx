import { HTMLAttributes, useState } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  src,
  alt,
  fallbackText,
  size = "md",
  className = "",
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from fallbackText or alt
  const getInitials = (text: string): string => {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const displayText = fallbackText || alt;
  const initials = getInitials(displayText);

  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const shouldShowImage = src && !imageError;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center overflow-hidden
        rounded-full bg-gradient-to-br from-primary-brand to-primary-dark
        ${sizeStyles[size]} ${className}
      `}
      {...props}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-semibold text-white">{initials}</span>
      )}
    </div>
  );
}
