import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import { BIZMIS_BORDER_HEX, BIZMIS_MUTED_FG_HEX, BIZMIS_SECONDARY_SURFACE_HEX, BIZMIS_WARM_BG_HEX } from "@/lib/bizmisBrandColors";

const WIDTH_PX = 540;
const HEIGHT_PX = 360;
const CHROME_HEIGHT_PX = 30;
const CHROME_DOT_SIZE_PX = 9;
const CHROME_DOT_GAP_PX = 7;
const CHROME_DOT_INSET_PX = 14;
const URL_PILL_HEIGHT_PX = 18;
const URL_PILL_FONT_PX = 10;
const BODY_PADDING_X_PX = 24;
const BODY_PADDING_TOP_PX = 32;
const PRODUCT_CARD_GAP_PX = 14;
const PRODUCT_CARD_BORDER_RADIUS_PX = 10;
const PRODUCT_IMAGE_HEIGHT_PX = 120;
const PRODUCT_CARD_PADDING_PX = 10;
const PRODUCT_TITLE_FONT_PX = 11;
const PRODUCT_PRICE_FONT_PX = 10;
const PRODUCT_TAG_FONT_PX = 8;
const AVATAR_WIDGET_WIDTH_PX = 200;
const AVATAR_WIDGET_BOTTOM_PX = 14;
const AVATAR_WIDGET_RIGHT_PX = 14;
const AVATAR_CIRCLE_DIAMETER_PX = 44;
const CUE_FONT_PX = 10;

type Props = { lead: LeadEarlyAccessData };

function trafficDot(color: string): React.CSSProperties {
  return {
    width: `${CHROME_DOT_SIZE_PX}px`,
    height: `${CHROME_DOT_SIZE_PX}px`,
    borderRadius: "50%",
    backgroundColor: color,
    display: "inline-block",
    marginRight: `${CHROME_DOT_GAP_PX}px`,
  };
}

function highlightProductName(cue: string, productName: string, accentColor: string): React.ReactNode {
  if (!productName) return cue;
  const idx = cue.toLowerCase().indexOf(productName.toLowerCase());
  if (idx < 0) return cue;
  const before = cue.slice(0, idx);
  const mid = cue.slice(idx, idx + productName.length);
  const after = cue.slice(idx + productName.length);
  return (
    <>
      {before}
      <span style={{ color: accentColor, fontWeight: 700 }}>{mid}</span>
      {after}
    </>
  );
}

const EmailDesktopMockup = ({ lead }: Props) => {
  const recommendedIndex = lead.salesRecommendedIndex;
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];
  const accent = lead.primaryColor;

  const frameStyle: React.CSSProperties = {
    width: `${WIDTH_PX}px`,
    height: `${HEIGHT_PX}px`,
    background: BIZMIS_WARM_BG_HEX,
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  };

  const browserWindowStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    left: "20px",
    right: "20px",
    bottom: "20px",
    background: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 24px -12px rgba(50,40,27,0.15)",
  };

  const chromeStyle: React.CSSProperties = {
    width: "100%",
    height: `${CHROME_HEIGHT_PX}px`,
    background: BIZMIS_SECONDARY_SURFACE_HEX,
    borderBottom: `1px solid ${BIZMIS_BORDER_HEX}`,
    display: "flex",
    alignItems: "center",
    paddingLeft: `${CHROME_DOT_INSET_PX}px`,
    paddingRight: `${CHROME_DOT_INSET_PX}px`,
    boxSizing: "border-box",
  };

  const urlPillStyle: React.CSSProperties = {
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: "999px",
    padding: "0 12px",
    height: `${URL_PILL_HEIGHT_PX}px`,
    lineHeight: `${URL_PILL_HEIGHT_PX}px`,
    fontSize: `${URL_PILL_FONT_PX}px`,
    color: BIZMIS_MUTED_FG_HEX,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    maxWidth: "240px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    textAlign: "center",
  };

  const bodyStyle: React.CSSProperties = {
    width: "100%",
    height: `calc(100% - ${CHROME_HEIGHT_PX}px)`,
    padding: `${BODY_PADDING_TOP_PX}px ${BODY_PADDING_X_PX}px`,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: `${PRODUCT_CARD_GAP_PX}px`,
  };

  const productCardBase: React.CSSProperties = {
    flex: 1,
    background: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: `${PRODUCT_CARD_BORDER_RADIUS_PX}px`,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };
  const productCardRecommended: React.CSSProperties = {
    ...productCardBase,
    borderColor: accent,
    boxShadow: `0 0 0 1px ${accent}`,
  };

  const productImageStyle: React.CSSProperties = {
    width: "100%",
    height: `${PRODUCT_IMAGE_HEIGHT_PX}px`,
    objectFit: "cover",
    display: "block",
  };

  const productTextBlockStyle: React.CSSProperties = {
    padding: `${PRODUCT_CARD_PADDING_PX}px`,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  };

  const avatarWidgetStyle: React.CSSProperties = {
    position: "absolute",
    right: `${AVATAR_WIDGET_RIGHT_PX + 20}px`,
    bottom: `${AVATAR_WIDGET_BOTTOM_PX + 20}px`,
    width: `${AVATAR_WIDGET_WIDTH_PX}px`,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: "10px",
  };

  const avatarCircleStyle: React.CSSProperties = {
    width: `${AVATAR_CIRCLE_DIAMETER_PX}px`,
    height: `${AVATAR_CIRCLE_DIAMETER_PX}px`,
    borderRadius: "50%",
    backgroundColor: accent,
    border: "2px solid #ffffff",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 4px 10px -4px rgba(50,40,27,0.25)",
  };

  const avatarImgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const cueBubbleStyle: React.CSSProperties = {
    background: "#ffffff",
    border: `1px solid ${BIZMIS_BORDER_HEX}`,
    borderRadius: "10px",
    padding: "8px 10px",
    fontSize: `${CUE_FONT_PX}px`,
    color: "#32281B",
    lineHeight: 1.35,
    fontWeight: 500,
    maxWidth: `${AVATAR_WIDGET_WIDTH_PX - AVATAR_CIRCLE_DIAMETER_PX - 10}px`,
    boxShadow: "0 4px 10px -4px rgba(50,40,27,0.15)",
  };

  const clerkCue = lead.montageClerkCue?.trim() || lead.salesBizmisReply;
  const recommendedProduct = lead.salesProducts[recommendedIndex];

  return (
    <div style={frameStyle}>
      <div style={browserWindowStyle}>
        <div style={chromeStyle}>
          <span style={trafficDot("#FF5F56")} />
          <span style={trafficDot("#FFBD2E")} />
          <span style={trafficDot("#27C93F")} />
          <span style={urlPillStyle}>{lead.storeDomain}</span>
          <span style={{ width: `${CHROME_DOT_INSET_PX}px` }} />
        </div>

        <div style={bodyStyle}>
          {lead.salesProducts.map((product, i) => {
            const isRecommended = i === recommendedIndex;
            const cardStyle = isRecommended ? productCardRecommended : productCardBase;
            const titleColor = isRecommended ? "#32281B" : "#32281B";
            const priceColor = isRecommended ? accent : BIZMIS_MUTED_FG_HEX;
            const tagColor = isRecommended ? accent : BIZMIS_MUTED_FG_HEX;
            return (
              <div key={i} style={cardStyle}>
                <img src={productImages[i]} alt={product.title} style={productImageStyle} />
                <div style={productTextBlockStyle}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${PRODUCT_TITLE_FONT_PX}px`,
                      fontWeight: 700,
                      color: titleColor,
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${PRODUCT_PRICE_FONT_PX}px`,
                      fontWeight: 600,
                      color: priceColor,
                    }}
                  >
                    {product.price}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${PRODUCT_TAG_FONT_PX}px`,
                      fontWeight: 600,
                      color: tagColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {product.tag}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={avatarWidgetStyle}>
        <div style={cueBubbleStyle}>
          {highlightProductName(clerkCue, recommendedProduct.title, accent)}
        </div>
        <div style={avatarCircleStyle}>
          <img src={lead.salesAvatarImagePath} alt="Bizmis clerk avatar" style={avatarImgStyle} />
        </div>
      </div>
    </div>
  );
};

export default EmailDesktopMockup;
