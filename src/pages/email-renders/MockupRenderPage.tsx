import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { getLeadById } from "@/data/leads";
import {
  buildEmailInviteBannerHtml,
  buildSalesMockupSceneHtml,
  buildSupportMockupSceneHtml,
} from "@/lib/leadEarlyAccessEmailHtml";

const DESKTOP_CSS_WIDTH_PX = 540;
const PHONE_CSS_WIDTH_PX = 216;
const SHADOW_SAFE_PADDING_PX = 48;

/**
 * Layout knobs for the combined mockup (phone overlaps the desktop's
 * top-right, with a decorative invite banner baked behind both
 * mockups). All values are in CSS px and describe how far each element
 * is offset inside the composition (relative to the inner wrapper's
 * padding box top-left).
 *
 * - COMBINED_BANNER_HEIGHT_PX: height of the backdrop banner strip.
 * - COMBINED_DESKTOP_TOP_OFFSET_PX: absolute top offset of the desktop
 *   mockup; pinned to the banner's bottom edge so the full banner
 *   reads above the desktop frame.
 * - COMBINED_PHONE_STICK_UP_PX: how many CSS px the phone peeks above
 *   the desktop's top edge (phone_top = desktop_top - stick_up).
 * - COMBINED_PHONE_STICK_RIGHT_PX: how many CSS px the phone extends
 *   past the desktop's right edge.
 * - COMBINED_PHONE_STICK_DOWN_PX: padding reserved below the desktop
 *   for drop shadows.
 *
 * The phone uses `buildSupportMockupSceneHtml(lead, { compact: true })`
 * so it renders natively shorter (trimmed avatar + wave-row min heights
 * + caption paddings) without any CSS transform — every element keeps
 * its aspect ratio.
 */
const COMBINED_BANNER_HEIGHT_PX = 150;
const COMBINED_DESKTOP_TOP_OFFSET_PX = COMBINED_BANNER_HEIGHT_PX;
const COMBINED_PHONE_STICK_UP_PX = 14;
const COMBINED_PHONE_TOP_OFFSET_PX =
  COMBINED_DESKTOP_TOP_OFFSET_PX - COMBINED_PHONE_STICK_UP_PX;
const COMBINED_PHONE_STICK_RIGHT_PX = 208;
const COMBINED_PHONE_STICK_DOWN_PX = 8;
/**
 * Defensive stack order for the phone: the desktop mockup contains
 * several absolutely positioned internals with their own z-index values
 * (product cards, avatar, waveforms), so we force the phone layer into
 * its own plane with a near-max z-index and isolate the desktop into a
 * separate stacking context so none of its children can bleed through.
 * The banner sits on a lower z-index so both mockups cover it.
 */
const COMBINED_BANNER_Z_INDEX = 1;
const COMBINED_DESKTOP_Z_INDEX = 2;
const COMBINED_PHONE_Z_INDEX = 2_147_483_000;
/** Rounded corners on the banner top match the rich email card feel. */
const COMBINED_BANNER_BORDER_RADIUS_PX = 16;

type MockupWhich = "desktop" | "phone" | "combined";

const MOCKUP_WHICH_VALUES: readonly MockupWhich[] = ["desktop", "phone", "combined"];

function isMockupWhich(value: string | undefined): value is MockupWhich {
  return !!value && (MOCKUP_WHICH_VALUES as readonly string[]).includes(value);
}

const MockupRenderPage = () => {
  const { leadId, which } = useParams<{ leadId: string; which: string }>();
  const lead = leadId ? getLeadById(leadId) : undefined;

  const variant = useMemo<MockupWhich | null>(
    () => (isMockupWhich(which) ? which : null),
    [which],
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlBg: html.style.background,
      htmlMargin: html.style.margin,
      htmlPadding: html.style.padding,
      bodyBg: body.style.background,
      bodyMargin: body.style.margin,
      bodyPadding: body.style.padding,
      bodyOverflow: body.style.overflow,
    };
    html.style.background = "transparent";
    html.style.margin = "0";
    html.style.padding = "0";
    body.style.background = "transparent";
    body.style.margin = "0";
    body.style.padding = "0";
    body.style.overflow = "hidden";
    return () => {
      html.style.background = prev.htmlBg;
      html.style.margin = prev.htmlMargin;
      html.style.padding = prev.htmlPadding;
      body.style.background = prev.bodyBg;
      body.style.margin = prev.bodyMargin;
      body.style.padding = prev.bodyPadding;
      body.style.overflow = prev.bodyOverflow;
    };
  }, []);

  if (!lead || !variant) {
    return <NotFound />;
  }

  const frameStyle: React.CSSProperties = {
    display: "inline-block",
    padding: `${SHADOW_SAFE_PADDING_PX}px`,
    background: "transparent",
    boxSizing: "content-box",
  };

  if (variant === "combined") {
    const desktopHtml = buildSalesMockupSceneHtml(lead);
    const phoneHtml = buildSupportMockupSceneHtml(lead, { compact: true });
    const bannerHtml = buildEmailInviteBannerHtml(lead, {
      heightPx: COMBINED_BANNER_HEIGHT_PX,
    });
    return (
      <div
        data-email-mockup-frame={variant}
        data-lead-id={lead.id}
        style={frameStyle}
      >
        <div
          style={{
            position: "relative",
            isolation: "isolate",
            paddingTop: `${COMBINED_DESKTOP_TOP_OFFSET_PX}px`,
            paddingRight: `${COMBINED_PHONE_STICK_RIGHT_PX}px`,
            paddingBottom: `${COMBINED_PHONE_STICK_DOWN_PX}px`,
            boxSizing: "content-box",
            background: "transparent",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: `${COMBINED_BANNER_HEIGHT_PX}px`,
              borderRadius: `${COMBINED_BANNER_BORDER_RADIUS_PX}px ${COMBINED_BANNER_BORDER_RADIUS_PX}px 0 0`,
              overflow: "hidden",
              zIndex: COMBINED_BANNER_Z_INDEX,
            }}
            dangerouslySetInnerHTML={{ __html: bannerHtml }}
          />
          <div
            style={{
              width: `${DESKTOP_CSS_WIDTH_PX}px`,
              position: "relative",
              isolation: "isolate",
              zIndex: COMBINED_DESKTOP_Z_INDEX,
            }}
            dangerouslySetInnerHTML={{ __html: desktopHtml }}
          />
          <div
            style={{
              position: "absolute",
              top: `${COMBINED_PHONE_TOP_OFFSET_PX}px`,
              right: 0,
              width: `${PHONE_CSS_WIDTH_PX}px`,
              lineHeight: 0,
              zIndex: COMBINED_PHONE_Z_INDEX,
            }}
            dangerouslySetInnerHTML={{ __html: phoneHtml }}
          />
        </div>
      </div>
    );
  }

  const singleHtml =
    variant === "desktop" ? buildSalesMockupSceneHtml(lead) : buildSupportMockupSceneHtml(lead);
  const singleWidth = variant === "desktop" ? DESKTOP_CSS_WIDTH_PX : PHONE_CSS_WIDTH_PX;
  return (
    <div data-email-mockup-frame={variant} data-lead-id={lead.id} style={frameStyle}>
      <div
        style={{ width: `${singleWidth}px`, background: "transparent" }}
        dangerouslySetInnerHTML={{ __html: singleHtml }}
      />
    </div>
  );
};

export default MockupRenderPage;
export {
  DESKTOP_CSS_WIDTH_PX,
  PHONE_CSS_WIDTH_PX,
  SHADOW_SAFE_PADDING_PX,
  COMBINED_BANNER_HEIGHT_PX,
  COMBINED_DESKTOP_TOP_OFFSET_PX,
  COMBINED_PHONE_TOP_OFFSET_PX,
  COMBINED_PHONE_STICK_UP_PX,
  COMBINED_PHONE_STICK_RIGHT_PX,
  COMBINED_PHONE_STICK_DOWN_PX,
  COMBINED_PHONE_Z_INDEX,
  COMBINED_BANNER_Z_INDEX,
  COMBINED_DESKTOP_Z_INDEX,
  COMBINED_BANNER_BORDER_RADIUS_PX,
};
export type { MockupWhich };
