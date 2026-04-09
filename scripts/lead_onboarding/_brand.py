"""Extract brand colours and metadata from a store's homepage (HTTP-only, no browser)."""

import logging
import re
from html.parser import HTMLParser
from typing import TypedDict
from urllib.request import Request, urlopen

from ._config import DEFAULT_USER_AGENT

logger = logging.getLogger(__name__)


class BrandData(TypedDict, total=False):
    store_name: str | None
    theme_color: str | None
    navbar_bg_color: str | None
    og_title: str | None
    og_image: str | None
    favicon_url: str | None
    css_color_candidates: list[str]


class _MetaExtractor(HTMLParser):
    """Single-pass HTML parser that extracts brand-relevant meta tags and inline CSS vars."""

    def __init__(self) -> None:
        super().__init__()
        self.theme_color: str | None = None
        self.og_title: str | None = None
        self.og_site_name: str | None = None
        self.og_image: str | None = None
        self.favicon_url: str | None = None
        self.page_title: str | None = None
        self.css_color_candidates: list[str] = []
        self.navbar_bg_color: str | None = None
        self._in_title = False
        self._title_parts: list[str] = []
        self._in_style = False
        self._style_parts: list[str] = []

    # Public:

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {k.lower(): v for k, v in attrs if v is not None}

        if tag == "meta":
            self._handle_meta(attr_map)
        elif tag == "link":
            self._handle_link(attr_map)
        elif tag in ("header", "nav") and not self.navbar_bg_color:
            self._extract_navbar_bg(attr_map)
        elif tag == "title":
            self._in_title = True
            self._title_parts = []
        elif tag == "style":
            self._in_style = True
            self._style_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._in_title:
            self._in_title = False
            self.page_title = "".join(self._title_parts).strip()
        elif tag == "style" and self._in_style:
            self._in_style = False
            self._extract_css_vars("".join(self._style_parts))

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)
        if self._in_style:
            self._style_parts.append(data)

    # Private:

    def _handle_meta(self, attrs: dict[str, str]) -> None:
        name = attrs.get("name", "").lower()
        prop = attrs.get("property", "").lower()
        content = attrs.get("content", "")

        if name == "theme-color" and content:
            self.theme_color = content.strip()
        elif prop == "og:title" and content:
            self.og_title = content.strip()
        elif prop == "og:site_name" and content:
            self.og_site_name = content.strip()
        elif prop == "og:image" and content:
            self.og_image = content.strip()

    def _handle_link(self, attrs: dict[str, str]) -> None:
        rel = attrs.get("rel", "").lower()
        href = attrs.get("href", "")
        if rel in ("icon", "shortcut icon", "apple-touch-icon") and href:
            self.favicon_url = href.strip()

    _BG_COLOR_RE = re.compile(r"background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})")

    def _extract_navbar_bg(self, attrs: dict[str, str]) -> None:
        style = attrs.get("style", "")
        if not style:
            return
        match = self._BG_COLOR_RE.search(style)
        if match:
            self.navbar_bg_color = match.group(1)

    _CSS_VAR_PATTERN = re.compile(
        r"--(primary|brand|accent|theme|main)[a-z0-9-]*\s*:\s*(#[0-9a-fA-F]{3,8})",
    )

    def _extract_css_vars(self, css_text: str) -> None:
        for match in self._CSS_VAR_PATTERN.finditer(css_text):
            self.css_color_candidates.append(match.group(2))


# Public:

def extract_brand(store_url: str) -> BrandData:
    """Fetch *store_url* and return extracted brand signals."""
    url = _normalise_url(store_url)
    logger.info("Fetching %s for brand extraction …", url)

    req = Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    with urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    parser = _MetaExtractor()
    parser.feed(html)

    store_name = parser.og_site_name or parser.og_title or parser.page_title

    return BrandData(
        store_name=store_name,
        theme_color=parser.theme_color,
        navbar_bg_color=parser.navbar_bg_color,
        og_title=parser.og_title,
        og_image=parser.og_image,
        favicon_url=parser.favicon_url,
        css_color_candidates=parser.css_color_candidates,
    )


# Private:

def _normalise_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url
