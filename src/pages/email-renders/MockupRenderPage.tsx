import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { getLeadById } from "@/data/leads";
import {
  buildSalesMockupSceneHtml,
  buildSupportMockupSceneHtml,
} from "@/lib/leadEarlyAccessEmailHtml";

const DESKTOP_CSS_WIDTH_PX = 540;
const PHONE_CSS_WIDTH_PX = 216;
const SHADOW_SAFE_PADDING_PX = 48;

const MOCKUP_VARIANTS = {
  desktop: { widthPx: DESKTOP_CSS_WIDTH_PX, build: buildSalesMockupSceneHtml },
  phone: { widthPx: PHONE_CSS_WIDTH_PX, build: buildSupportMockupSceneHtml },
} as const;

type MockupWhich = keyof typeof MOCKUP_VARIANTS;

function isMockupWhich(value: string | undefined): value is MockupWhich {
  return !!value && value in MOCKUP_VARIANTS;
}

const MockupRenderPage = () => {
  const { leadId, which } = useParams<{ leadId: string; which: string }>();
  const lead = leadId ? getLeadById(leadId) : undefined;

  const variant = useMemo(() => {
    if (!isMockupWhich(which)) return null;
    return MOCKUP_VARIANTS[which];
  }, [which]);

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

  if (!lead || !variant || !isMockupWhich(which)) {
    return <NotFound />;
  }

  const html = variant.build(lead);
  const frameStyle: React.CSSProperties = {
    display: "inline-block",
    padding: `${SHADOW_SAFE_PADDING_PX}px`,
    background: "transparent",
    boxSizing: "content-box",
  };
  const innerStyle: React.CSSProperties = {
    width: `${variant.widthPx}px`,
    background: "transparent",
  };

  return (
    <div data-email-mockup-frame={which} data-lead-id={lead.id} style={frameStyle}>
      <div style={innerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default MockupRenderPage;
export { MOCKUP_VARIANTS, DESKTOP_CSS_WIDTH_PX, PHONE_CSS_WIDTH_PX, SHADOW_SAFE_PADDING_PX };
export type { MockupWhich };
