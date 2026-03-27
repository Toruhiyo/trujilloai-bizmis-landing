import { cn } from "@/lib/utils";

export const PricingPlanFeatureSoon = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center rounded-full border border-primary/10 bg-[#FDF7E2] px-1.5 py-[1px] text-[9px] font-medium text-primary/70 uppercase tracking-wider",
        className,
      )}
    >
      Soon
    </span>
  );
};
