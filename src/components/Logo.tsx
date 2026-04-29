import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "default" | "white";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  tintColor?: string;
  className?: string;
  onClick?: () => void;
}

const HEIGHT_CLASSES: Record<LogoSize, string> = {
  sm: "h-6 sm:h-7",
  md: "h-8 sm:h-10",
  lg: "h-10 sm:h-12",
};

const FULL_LOGO_MASK_URL = "/images/bizmis-logo-full-white-transparent.png";
const AVATAR_MASK_URL = "/images/bizmis-logo-white-transparent.png";

const FULL_LOGO_ASPECT = "1948 / 640";
const AVATAR_ASPECT = "1 / 1";

const VARIANT_TINT: Record<LogoVariant, string> = {
  white: "#ffffff",
  default: "hsl(var(--primary))",
};

const Logo = ({
  variant = "default",
  size = "md",
  showText = false,
  tintColor,
  className,
  onClick,
}: LogoProps) => {
  const Component = onClick ? "button" : "div";
  const maskUrl = showText ? FULL_LOGO_MASK_URL : AVATAR_MASK_URL;
  const aspectRatio = showText ? FULL_LOGO_ASPECT : AVATAR_ASPECT;
  const color = tintColor ?? VARIANT_TINT[variant];

  return (
    <Component
      onClick={onClick}
      aria-label="Bizmis"
      className={cn(
        "inline-flex items-center transition-all duration-300",
        onClick && "hover:opacity-80 cursor-pointer",
        className
      )}
    >
      <span
        className={cn("block w-auto", HEIGHT_CLASSES[size])}
        style={{
          aspectRatio,
          backgroundColor: color,
          WebkitMaskImage: `url(${maskUrl})`,
          maskImage: `url(${maskUrl})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </Component>
  );
};

export default Logo;
