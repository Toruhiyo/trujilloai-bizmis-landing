import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import {
  resolveLogoColorOverlay,
  resolveStoreNameTextColor,
} from "@/data/leads/_schema";
import { BIZMIS_PRIMARY_HEX, BIZMIS_WARM_BG_HEX } from "@/lib/bizmisBrandColors";

const WIDTH_PX = 560;
const HEIGHT_PX = 180;
const HORIZONTAL_PADDING_PX = 28;
const LEAD_LOGO_MAX_HEIGHT_PX = 64;
const TAGLINE_TRACKING_EM = 0.18;

type Props = {
  lead: LeadEarlyAccessData;
};

function resolveBannerBg(lead: LeadEarlyAccessData): string {
  const banner = lead.bannerColor?.trim();
  if (banner && /^#[0-9A-Fa-f]{6}$/.test(banner)) return banner;
  return lead.primaryColor;
}

const EmailHeroBanner = ({ lead }: Props) => {
  const leadBannerBg = resolveBannerBg(lead);
  const logoOverlay = resolveLogoColorOverlay(lead);
  const storeNameColor = resolveStoreNameTextColor(lead);

  const backgroundGradient = `linear-gradient(90deg, ${leadBannerBg} 0%, ${leadBannerBg} 48%, ${BIZMIS_WARM_BG_HEX} 52%, ${BIZMIS_WARM_BG_HEX} 100%)`;

  const leadSideStyle: React.CSSProperties = {
    width: `${WIDTH_PX / 2}px`,
    height: `${HEIGHT_PX}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${HORIZONTAL_PADDING_PX}px`,
    boxSizing: "border-box",
  };

  const bizmisSideStyle: React.CSSProperties = {
    width: `${WIDTH_PX / 2}px`,
    height: `${HEIGHT_PX}px`,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: `0 ${HORIZONTAL_PADDING_PX}px`,
    boxSizing: "border-box",
    gap: "8px",
  };

  const logoBoxWidthPx = WIDTH_PX / 2 - HORIZONTAL_PADDING_PX * 2;
  const maskedLogoStyle: React.CSSProperties = {
    display: "block",
    width: `${logoBoxWidthPx}px`,
    height: `${LEAD_LOGO_MAX_HEIGHT_PX}px`,
    WebkitMaskImage: `url('${lead.logoImagePath}')`,
    maskImage: `url('${lead.logoImagePath}')`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    backgroundColor: logoOverlay ?? "transparent",
  };
  const rawLogoStyle: React.CSSProperties = {
    display: "block",
    maxHeight: `${LEAD_LOGO_MAX_HEIGHT_PX}px`,
    maxWidth: `${logoBoxWidthPx}px`,
    width: "auto",
    height: "auto",
    objectFit: "contain",
  };

  const taglineBase: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    letterSpacing: `${TAGLINE_TRACKING_EM}em`,
    textTransform: "uppercase",
    lineHeight: 1.2,
    margin: 0,
  };

  const pretitleStyle: React.CSSProperties = {
    ...taglineBase,
    fontSize: "9px",
    fontWeight: 600,
    color: "#8F7856",
  };

  const wordmarkStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textTransform: "lowercase",
    lineHeight: 1,
    margin: 0,
    color: BIZMIS_PRIMARY_HEX,
  };

  const storeNameStyle: React.CSSProperties = {
    ...taglineBase,
    fontSize: "10px",
    fontWeight: 700,
    color: storeNameColor,
    letterSpacing: `${TAGLINE_TRACKING_EM}em`,
  };

  const frameStyle: React.CSSProperties = {
    width: `${WIDTH_PX}px`,
    height: `${HEIGHT_PX}px`,
    display: "flex",
    flexDirection: "row",
    background: backgroundGradient,
    fontSmooth: "always",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  };

  return (
    <div style={frameStyle}>
      <div style={leadSideStyle}>
        {logoOverlay ? (
          <div aria-label={`${lead.storeName} logo`} style={maskedLogoStyle} />
        ) : (
          <img src={lead.logoImagePath} alt={`${lead.storeName} logo`} style={rawLogoStyle} />
        )}
      </div>

      <div style={bizmisSideStyle}>
        <p style={pretitleStyle}>Early Access Invite</p>
        <p style={wordmarkStyle}>bizmis</p>
        <p style={storeNameStyle}>for {lead.storeName}</p>
      </div>
    </div>
  );
};

export default EmailHeroBanner;
