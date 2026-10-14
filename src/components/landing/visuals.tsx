import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import BizmisWidget, { Captions } from "./BizmisWidget";
import type { WidgetState } from "./BizmisWidget";
import type { AgentName } from "./AgentImage";
import { StoreWindow } from "./clay";
import { TabletFrame } from "./devices";

export const STORE_URL = "yourstore.com";

/**
 * A store page with the real Bizmis widget floating in its corner, as it does
 * on a live storefront: the store keeps its own full-width layout and the
 * widget sits on top of it (its glass card shows the page through). Scaled
 * down the way it would sit on a page; optionally the widget's captions at
 * the page's foot.
 */
export const StoreWithWidget = ({
  children,
  agent,
  state,
  tool,
  above,
  caption,
  device = "desktop",
}: {
  children: ReactNode;
  agent: AgentName;
  state: WidgetState;
  tool?: LucideIcon;
  above?: ReactNode;
  caption?: string;
  /** A desktop browser window, or a tablet (the real widget keeps its desktop card from 768px up). */
  device?: "desktop" | "tablet";
}) => {
  const m = useMessages();
  const Frame = device === "tablet" ? TabletFrame : null;
  const inner = (
    <>
      {children}
      {caption && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 pr-[38%] sm:pr-[34%]">
          <Captions text={caption} className="text-[11px] sm:text-sm" />
        </div>
      )}
      <div
        className={`absolute bottom-3 right-3 z-10 origin-bottom-right ${device === "tablet" ? "" : "scale-[0.5] sm:scale-[0.62]"}`}
      >
        <BizmisWidget
          agent={agent}
          state={state}
          tool={tool}
          above={above}
          placeholder={m.landing.widget.placeholder}
        />
      </div>
    </>
  );
  if (Frame) return <Frame url={STORE_URL}>{inner}</Frame>;
  return <StoreWindow label={m.landing.yourStore}>{inner}</StoreWindow>;
};
