import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { getLeadById } from "@/data/leads";
import EmailHeroBanner from "@/components/email-renders/EmailHeroBanner";
import EmailDesktopMockup from "@/components/email-renders/EmailDesktopMockup";
import EmailPhoneMockup from "@/components/email-renders/EmailPhoneMockup";
import EmailPlugAndPlay from "@/components/email-renders/EmailPlugAndPlay";

const COMPOSITION_VIEWPORTS = {
  "hero-banner": { cssWidth: 560, cssHeight: 180 },
  "desktop-mockup": { cssWidth: 540, cssHeight: 360 },
  "phone-mockup": { cssWidth: 360, cssHeight: 480 },
  "plug-and-play": { cssWidth: 560, cssHeight: 400 },
} as const;

type CompositionId = keyof typeof COMPOSITION_VIEWPORTS;

function isCompositionId(value: string | undefined): value is CompositionId {
  return !!value && value in COMPOSITION_VIEWPORTS;
}

const EmailCompositionRenderPage = () => {
  const { leadId, composition } = useParams<{ leadId: string; composition: string }>();
  const lead = leadId ? getLeadById(leadId) : undefined;
  const viewport = useMemo(() => {
    if (!isCompositionId(composition)) return null;
    return COMPOSITION_VIEWPORTS[composition];
  }, [composition]);

  useEffect(() => {
    const prevMargin = document.body.style.margin;
    const prevPadding = document.body.style.padding;
    const prevOverflow = document.body.style.overflow;
    const prevBg = document.body.style.background;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.background = "transparent";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.background = "transparent";
    return () => {
      document.body.style.margin = prevMargin;
      document.body.style.padding = prevPadding;
      document.body.style.overflow = prevOverflow;
      document.body.style.background = prevBg;
    };
  }, []);

  if (!lead || !viewport || !isCompositionId(composition)) {
    return <NotFound />;
  }

  const frameStyle: React.CSSProperties = {
    width: `${viewport.cssWidth}px`,
    height: `${viewport.cssHeight}px`,
    overflow: "hidden",
    background: "transparent",
  };

  const compositionNode = (() => {
    switch (composition) {
      case "hero-banner":
        return <EmailHeroBanner lead={lead} />;
      case "desktop-mockup":
        return <EmailDesktopMockup lead={lead} />;
      case "phone-mockup":
        return <EmailPhoneMockup lead={lead} />;
      case "plug-and-play":
        return <EmailPlugAndPlay lead={lead} />;
    }
  })();

  return (
    <div data-email-composition={composition} data-lead-id={lead.id} style={frameStyle}>
      {compositionNode}
    </div>
  );
};

export default EmailCompositionRenderPage;
export { COMPOSITION_VIEWPORTS };
export type { CompositionId };
