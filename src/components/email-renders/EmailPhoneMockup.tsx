import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import { BIZMIS_BORDER_HEX, BIZMIS_MUTED_FG_HEX, BIZMIS_WARM_BG_HEX } from "@/lib/bizmisBrandColors";

const WIDTH_PX = 360;
const HEIGHT_PX = 480;
const PHONE_MARGIN_X_PX = 60;
const PHONE_MARGIN_Y_PX = 16;
const PHONE_BORDER_RADIUS_PX = 28;
const PHONE_BORDER_PX = 8;
const STATUS_BAR_HEIGHT_PX = 22;
const CHAT_PADDING_X_PX = 14;
const CHAT_PADDING_Y_PX = 18;
const BUBBLE_RADIUS_PX = 14;
const BUBBLE_FONT_PX = 12;
const BUBBLE_GAP_PX = 12;
const POLICY_CHIP_FONT_PX = 10;
const AVATAR_DIAMETER_PX = 28;

type Props = { lead: LeadEarlyAccessData };

function highlightProductName(cue: string, productName: string | null | undefined, accentColor: string): React.ReactNode {
  if (!productName) return cue;
  const idx = cue.toLowerCase().indexOf(productName.toLowerCase());
  if (idx < 0) return cue;
  return (
    <>
      {cue.slice(0, idx)}
      <span style={{ color: accentColor, fontWeight: 700 }}>{cue.slice(idx, idx + productName.length)}</span>
      {cue.slice(idx + productName.length)}
    </>
  );
}

const EmailPhoneMockup = ({ lead }: Props) => {
  const accent = lead.primaryColor;
  const shopperCue = lead.supportShopperCue ?? "";
  const clerkCue = lead.supportClerkCue ?? "";
  const policyLabel = lead.supportPolicyName ?? "Support Guide";
  const productName = lead.supportProductName ?? null;

  const frameStyle: React.CSSProperties = {
    width: `${WIDTH_PX}px`,
    height: `${HEIGHT_PX}px`,
    background: BIZMIS_WARM_BG_HEX,
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  };

  const phoneStyle: React.CSSProperties = {
    position: "absolute",
    left: `${PHONE_MARGIN_X_PX}px`,
    right: `${PHONE_MARGIN_X_PX}px`,
    top: `${PHONE_MARGIN_Y_PX}px`,
    bottom: `${PHONE_MARGIN_Y_PX}px`,
    background: "#ffffff",
    border: `${PHONE_BORDER_PX}px solid #2A2118`,
    borderRadius: `${PHONE_BORDER_RADIUS_PX}px`,
    overflow: "hidden",
    boxShadow: "0 18px 40px -18px rgba(50,40,27,0.35)",
    display: "flex",
    flexDirection: "column",
  };

  const statusBarStyle: React.CSSProperties = {
    height: `${STATUS_BAR_HEIGHT_PX}px`,
    background: "#ffffff",
    borderBottom: `1px solid ${BIZMIS_BORDER_HEX}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    color: BIZMIS_MUTED_FG_HEX,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  };

  const chatAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: `${CHAT_PADDING_Y_PX}px ${CHAT_PADDING_X_PX}px`,
    display: "flex",
    flexDirection: "column",
    gap: `${BUBBLE_GAP_PX}px`,
    background: BIZMIS_WARM_BG_HEX,
  };

  const shopperRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
  };

  const clerkRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  };

  const shopperBubbleStyle: React.CSSProperties = {
    background: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: `${BUBBLE_RADIUS_PX}px`,
    borderBottomRightRadius: "4px",
    padding: "10px 12px",
    fontSize: `${BUBBLE_FONT_PX}px`,
    color: "#32281B",
    lineHeight: 1.4,
    fontWeight: 500,
    maxWidth: "78%",
  };

  const clerkBubbleStyle: React.CSSProperties = {
    background: accent,
    borderRadius: `${BUBBLE_RADIUS_PX}px`,
    borderBottomLeftRadius: "4px",
    padding: "10px 12px",
    fontSize: `${BUBBLE_FONT_PX}px`,
    color: "#ffffff",
    lineHeight: 1.4,
    fontWeight: 500,
    maxWidth: "78%",
  };

  const avatarCircleStyle: React.CSSProperties = {
    width: `${AVATAR_DIAMETER_PX}px`,
    height: `${AVATAR_DIAMETER_PX}px`,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: accent,
    border: "2px solid #ffffff",
    flexShrink: 0,
    boxShadow: "0 3px 8px -3px rgba(50,40,27,0.35)",
  };

  const avatarImgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const policyChipStyle: React.CSSProperties = {
    alignSelf: "flex-start",
    marginLeft: `${AVATAR_DIAMETER_PX + 8}px`,
    backgroundColor: "rgba(249,163,83,0.08)",
    border: `1px solid rgba(249,163,83,0.4)`,
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: `${POLICY_CHIP_FONT_PX}px`,
    fontWeight: 600,
    color: accent,
    letterSpacing: "-0.01em",
  };

  const clerkInnerText = productName ? highlightProductName(clerkCue, productName, "#ffffff") : clerkCue;
  const shopperInnerText = productName ? highlightProductName(shopperCue, productName, accent) : shopperCue;

  return (
    <div style={frameStyle}>
      <div style={phoneStyle}>
        <div style={statusBarStyle}>{lead.storeName} Support</div>
        <div style={chatAreaStyle}>
          <div style={shopperRowStyle}>
            <div style={shopperBubbleStyle}>{shopperInnerText}</div>
          </div>
          <div style={clerkRowStyle}>
            <div style={avatarCircleStyle}>
              <img src={lead.supportAvatarImagePath} alt="Bizmis support avatar" style={avatarImgStyle} />
            </div>
            <div style={clerkBubbleStyle}>{clerkInnerText}</div>
          </div>
          <div style={policyChipStyle}>Answered via {policyLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default EmailPhoneMockup;
