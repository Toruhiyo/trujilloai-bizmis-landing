import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconType } from "react-icons";

export function buildReactIconSvgDataUri(
  Icon: IconType,
  color: string,
  sizePx: number,
): string {
  const svg = renderToStaticMarkup(
    createElement(Icon, {
      color,
      size: sizePx,
      "aria-hidden": true,
      focusable: false,
    }),
  );

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
