import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

const Logo = ({
  variant = "default",
  showText = false,
  className,
  onClick,
}: LogoProps) => {
  const logoSrc =
    variant === "white"
      ? "/images/bizmis-logo-white-transparent.png"
      : "/images/bizmis-logo-orange-transparent.png";

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
        src={logoSrc}
        alt="Bizmis Logo"
        className="h-8 w-auto sm:h-10 object-contain"
      />

      {showText && (
        <span
          className={cn(
            "font-extrabold text-xl sm:text-2xl tracking-tight select-none",
            // Plus Jakarta Sans with custom styling for modern look
            "font-heading",
            // Clean, soft styling with custom i-dots
            "[&:nth-child(2)]:rounded-full [&:nth-child(5)]:rounded-full",
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
