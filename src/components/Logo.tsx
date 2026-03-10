import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "default" | "white";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

const IMAGE_SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "h-6 w-auto sm:h-7",
  md: "h-8 w-auto sm:h-10",
  lg: "h-10 w-auto sm:h-12",
};

const TEXT_SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
};

const LOGO_SRC: Record<LogoVariant, string> = {
  white: "/images/bizmis-logo-white-transparent.png",
  default: "/images/bizmis-logo-orange-transparent.png",
};

const Logo = ({
  variant = "default",
  size = "md",
  showText = false,
  className,
  onClick,
}: LogoProps) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 sm:gap-3 transition-all duration-300",
        onClick && "hover:opacity-80 cursor-pointer",
        className
      )}
    >
      <img
        src={LOGO_SRC[variant]}
        alt="Bizmis Logo"
        className={cn(IMAGE_SIZE_CLASSES[size], "object-contain")}
      />

      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight select-none font-heading",
            TEXT_SIZE_CLASSES[size],
            variant === "white" ? "text-white" : "text-orange-600"
          )}
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          bizmis
        </span>
      )}
    </Component>
  );
};

export default Logo;
