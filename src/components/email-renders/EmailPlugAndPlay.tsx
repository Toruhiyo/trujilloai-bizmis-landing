import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import { BIZMIS_BORDER_HEX, BIZMIS_MUTED_FG_HEX, BIZMIS_PRIMARY_HEX, BIZMIS_WARM_BG_HEX } from "@/lib/bizmisBrandColors";

const WIDTH_PX = 560;
const HEIGHT_PX = 400;
const CENTER_AVATAR_DIAMETER_PX = 110;
const CHIP_ICON_SIZE_PX = 18;
const CHIP_WIDTH_PX = 128;
const CHIP_HEIGHT_PX = 42;
const CHIP_GAP_PX = 12;
const CHIP_FONT_PX = 11;

type Props = { lead: LeadEarlyAccessData };

type SyncChip = { label: string; icon: string };

const SYNC_CHIPS: SyncChip[] = [
  { label: "Website", icon: "/images/early-access-icon-sync-website.png" },
  { label: "Catalog", icon: "/images/early-access-icon-sync-catalog.png" },
  { label: "Discounts", icon: "/images/early-access-icon-sync-discounts.png" },
  { label: "Customers", icon: "/images/early-access-icon-sync-customers.png" },
  { label: "Orders", icon: "/images/early-access-icon-sync-orders.png" },
];

const EmailPlugAndPlay = ({ lead }: Props) => {
  const accent = lead.primaryColor;

  const frameStyle: React.CSSProperties = {
    width: `${WIDTH_PX}px`,
    height: `${HEIGHT_PX}px`,
    background: BIZMIS_WARM_BG_HEX,
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  };

  const glowStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${accent}22 0%, transparent 65%)`,
    pointerEvents: "none",
  };

  const centerAvatarWrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: `${CENTER_AVATAR_DIAMETER_PX}px`,
    height: `${CENTER_AVATAR_DIAMETER_PX}px`,
    borderRadius: "50%",
    overflow: "hidden",
    background: BIZMIS_PRIMARY_HEX,
    border: "4px solid #ffffff",
    boxShadow: `0 16px 36px -16px rgba(249,163,83,0.6)`,
  };

  const centerAvatarImgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const chipsTopRowStyle: React.CSSProperties = {
    position: "absolute",
    top: "28px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: `${CHIP_GAP_PX}px`,
  };

  const chipsBottomRowStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "28px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: `${CHIP_GAP_PX}px`,
  };

  const chipStyle: React.CSSProperties = {
    width: `${CHIP_WIDTH_PX}px`,
    height: `${CHIP_HEIGHT_PX}px`,
    background: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 16px",
    boxShadow: "0 4px 10px -4px rgba(50,40,27,0.1)",
    fontSize: `${CHIP_FONT_PX}px`,
    fontWeight: 600,
    color: "#32281B",
    letterSpacing: "-0.01em",
    boxSizing: "border-box",
  };

  const iconStyle: React.CSSProperties = {
    width: `${CHIP_ICON_SIZE_PX}px`,
    height: `${CHIP_ICON_SIZE_PX}px`,
    objectFit: "contain",
    display: "block",
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    top: "96px",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 700,
    color: BIZMIS_MUTED_FG_HEX,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "96px",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: "10px",
    fontWeight: 500,
    color: BIZMIS_MUTED_FG_HEX,
    letterSpacing: "0",
    margin: 0,
  };

  const topChips = SYNC_CHIPS.slice(0, 3);
  const bottomChips = SYNC_CHIPS.slice(3);

  const renderChip = (chip: SyncChip) => (
    <div key={chip.label} style={chipStyle}>
      <img src={chip.icon} alt="" style={iconStyle} />
      <span>{chip.label}</span>
    </div>
  );

  return (
    <div style={frameStyle}>
      <div style={glowStyle} />

      <div style={chipsTopRowStyle}>{topChips.map(renderChip)}</div>

      <p style={titleStyle}>One-click Shopify install</p>

      <div style={centerAvatarWrapperStyle}>
        <img src={lead.salesAvatarImagePath} alt="Bizmis" style={centerAvatarImgStyle} />
      </div>

      <p style={subtitleStyle}>{lead.storeName} Shopify &middot; Bizmis voice clerk</p>

      <div style={chipsBottomRowStyle}>{bottomChips.map(renderChip)}</div>
    </div>
  );
};

export default EmailPlugAndPlay;
