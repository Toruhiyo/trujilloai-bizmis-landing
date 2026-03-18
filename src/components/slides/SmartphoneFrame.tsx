import type { ReactNode } from "react";

const NOTCH_HEIGHT = 24;
const BEZEL_PX = 10;

type SmartphoneFrameProps = {
  children: ReactNode;
  className?: string;
};

const PHONE_WIDTH = 268;
const PHONE_HEIGHT = 430;

const SmartphoneFrame = ({ children, className = "" }: SmartphoneFrameProps) => (
  <div
    className={`relative flex flex-col shrink-0 overflow-visible rounded-[2rem] border border-border/40 bg-secondary/40 shadow-[0_4px_24px_-4px_hsl(var(--primary)_/_0.08),0_0_0_1px_hsl(var(--border)_/_0.6)] ${className}`}
    style={{
      padding: BEZEL_PX,
      width: PHONE_WIDTH,
      height: PHONE_HEIGHT,
      minWidth: PHONE_WIDTH,
      minHeight: PHONE_HEIGHT,
      maxWidth: PHONE_WIDTH,
      maxHeight: PHONE_HEIGHT,
    }}
  >
    <div
      className="absolute left-1/2 -translate-x-1/2 top-0 z-10 shrink-0 rounded-b-xl bg-primary/[0.12]"
      style={{
        width: 80,
        height: NOTCH_HEIGHT,
      }}
      aria-hidden
    />
    <div
      className="relative flex-1 min-h-0 flex flex-col overflow-hidden rounded-[1.25rem] border border-border/50 bg-primary/[0.08]"
      style={{ marginTop: NOTCH_HEIGHT / 2 }}
    >
      <div className="absolute inset-0 min-w-0 overflow-hidden">
        {children}
      </div>
      <div
        className="absolute bottom-3 left-0 right-0 z-10 flex justify-center"
        aria-hidden
      >
        <div className="w-24 h-1 rounded-full bg-primary/20" />
      </div>
    </div>
  </div>
);

export default SmartphoneFrame;
