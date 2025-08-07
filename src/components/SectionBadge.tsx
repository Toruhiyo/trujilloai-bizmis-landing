import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

interface SectionBadgeProps {
  icon: LucideIcon | IconType;
  text: string;
  className?: string;
}

const SectionBadge = ({
  icon: Icon,
  text,
  className = "",
}: SectionBadgeProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-amber-100/50 rounded-full px-6 py-3 text-orange-600 font-medium mb-4 ${className}`}
    >
      <Icon className="w-5 h-5" />
      {text}
    </div>
  );
};

export default SectionBadge;
