import ReceiptCheckIcon from "./ReceiptCheckIcon";

const ISSUE_RESOLVED_CARD_ANIMATION_MS = 700;
const ISSUE_RESOLVED_TITLE_DELAY_MS = 850;
const ISSUE_RESOLVED_SUMMARY_DELAY_MS = 1000;
const ISSUE_RESOLVED_ROW_DURATION_MS = 400;

export type IssueResolvedCardProps = {
  /** Past-tense summary of the action that resolved the case (e.g. "Refund issued"). */
  summary: string;
  /** Top-line headline shown on the card. Defaults to "Issue resolved". */
  title?: string;
};

/**
 * Pill-style "Issue resolved" card analogous to the order-confirmed pill in
 * `SpeakDiscoverBuy` (Benefit 1). Used for the Benefit 2 solved phase on both
 * mobile and desktop, replacing the bare circular check.
 */
export default function IssueResolvedCard({
  summary,
  title = "Issue resolved",
}: IssueResolvedCardProps) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-3xl border border-primary/25 bg-white px-3.5 py-2 shadow-md xs:gap-3 xs:px-4 xs:py-2.5"
      style={{
        animation: `order-receipt-in ${ISSUE_RESOLVED_CARD_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
      }}
    >
      <ReceiptCheckIcon size={32} pathSize={20} strokeWidthScale={1.15} />
      <div className="flex min-w-0 flex-col gap-0.5 text-left">
        <span
          className="text-[12px] font-heading font-bold text-foreground leading-tight xs:text-[13px] sm:text-[14px]"
          style={{
            animation: `receipt-row-in ${ISSUE_RESOLVED_ROW_DURATION_MS}ms ease-out ${ISSUE_RESOLVED_TITLE_DELAY_MS}ms both`,
          }}
        >
          {title}
        </span>
        <span
          className="min-w-0 truncate text-[11px] text-primary font-semibold leading-tight xs:text-[12px] sm:text-[13px]"
          style={{
            animation: `receipt-row-in ${ISSUE_RESOLVED_ROW_DURATION_MS}ms ease-out ${ISSUE_RESOLVED_SUMMARY_DELAY_MS}ms both`,
          }}
        >
          {summary}
        </span>
      </div>
    </div>
  );
}
