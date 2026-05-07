/** Timing shared by Benefit 1 receipt hero check and Benefit 2 solved burst. */
export const RECEIPT_CHECK_HALO_DELAY_MS = 200;
export const RECEIPT_CHECK_HALO_DURATION_MS = 900;
export const RECEIPT_CHECK_POP_DELAY_MS = 250;
export const RECEIPT_CHECK_POP_DURATION_MS = 500;
export const RECEIPT_CHECK_DRAW_DELAY_MS = 600;
export const RECEIPT_CHECK_DRAW_DURATION_MS = 380;

export type ReceiptCheckIconProps = {
  size?: number;
  pathSize?: number;
  /** Multiplier for the white check stroke (default 1). Values above 1 yield a bolder mark at large sizes. */
  strokeWidthScale?: number;
};

/**
 * Primary-filled circular check with expanding halo + dash-draw stroke — Order Confirmed (Benefit 1)
 * and resolved burst (Benefit 2).
 */
export default function ReceiptCheckIcon({
  size = 48,
  pathSize = 22,
  strokeWidthScale = 1,
}: ReceiptCheckIconProps) {
  const innerScale = pathSize / 24;
  const strokeWidth = (3 / innerScale) * strokeWidthScale;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full border-2 border-primary/40"
        style={{
          animation: `receipt-check-halo ${RECEIPT_CHECK_HALO_DURATION_MS}ms ease-out ${RECEIPT_CHECK_HALO_DELAY_MS}ms both`,
        }}
      />
      <div
        className="relative w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md"
        style={{
          animation: `receipt-check-pop ${RECEIPT_CHECK_POP_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${RECEIPT_CHECK_POP_DELAY_MS}ms both`,
        }}
      >
        <svg
          width={pathSize}
          height={pathSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M5 12L10 17L19 7"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: 30,
              animation: `receipt-check-draw ${RECEIPT_CHECK_DRAW_DURATION_MS}ms ease-out ${RECEIPT_CHECK_DRAW_DELAY_MS}ms forwards`,
            }}
          />
        </svg>
      </div>
    </div>
  );
}
