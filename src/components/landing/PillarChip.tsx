import type { AnimatedIcon } from "./AnimatedIcons";
import { cn } from "@/lib/utils";

/** A pillar's name as a small chip in the pillar's accent: the header of its band. */
const PillarChip = ({
  icon: Icon,
  label,
  className,
}: {
  icon: AnimatedIcon;
  label: string;
  className?: string;
}) => (
  <span className={cn("bzl-pillar-chip", className)}>
    <span className="bzl-pillar-chip-icon">
      <Icon />
    </span>
    {label}
  </span>
);

export default PillarChip;
