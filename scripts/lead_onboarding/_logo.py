"""Extract store logos from HTML source: inline SVGs, favicon, OG image fallbacks."""

import logging
import re
from html.parser import HTMLParser
from typing import TypedDict
from urllib.request import Request, urlopen

from ._config import DEFAULT_USER_AGENT

logger = logging.getLogger(__name__)


class LogoCandidate(TypedDict):
    source: str
    url: str | None
    svg_source: str | None
    score: int


class _LogoExtractor(HTMLParser):
    """Scans HTML for logo candidates in header/nav, favicons, and OG images."""

    def __init__(self, base_url: str) -> None:
        super().__init__()
        self._base_url = base_url.rstrip("/")
        self.candidates: list[LogoCandidate] = []
        self._in_header = False
        self._in_nav = False
        self._in_svg = False
        self._svg_depth = 0
        self._svg_parts: list[str] = []
        self._current_svg_attrs: str = ""

    # Public:

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {k.lower(): v for k, v in attrs if v is not None}

        if tag == "header":
            self._in_header = True
        elif tag == "nav":
            self._in_nav = True

        if tag == "svg":
            self._in_svg = True
            self._svg_depth = 1
            self._svg_parts = [self._rebuild_tag("svg", attrs)]
            return

        if self._in_svg:
            self._svg_depth += 1
            self._svg_parts.append(self._rebuild_tag(tag, attrs))
            return

        if tag == "link":
            self._handle_link(attr_map)
        elif tag == "meta":
            self._handle_meta(attr_map)
        elif tag == "img" and (self._in_header or self._in_nav):
            self._handle_header_img(attr_map)

    def handle_endtag(self, tag: str) -> None:
        if self._in_svg:
            self._svg_parts.append(f"</{tag}>")
            if tag == "svg":
                self._svg_depth -= 1
                if self._svg_depth <= 0:
                    self._in_svg = False
                    svg_source = "".join(self._svg_parts)
                    score = 80 if (self._in_header or self._in_nav) else 30
                    self.candidates.append(
                        LogoCandidate(source="inline_svg", url=None, svg_source=svg_source, score=score)
                    )
            return

        if tag == "header":
            self._in_header = False
        elif tag == "nav":
            self._in_nav = False

    def handle_data(self, data: str) -> None:
        if self._in_svg:
            self._svg_parts.append(data)

    # Private:

    def _handle_link(self, attrs: dict[str, str]) -> None:
        rel = attrs.get("rel", "").lower()
        href = attrs.get("href", "")
        if not href:
            return
        url = self._abs(href)

        if "icon" in rel:
            sizes = attrs.get("sizes", "")
            size_score = _parse_icon_size(sizes)
            self.candidates.append(
                LogoCandidate(source="favicon", url=url, svg_source=None, score=20 + size_score)
            )

    def _handle_meta(self, attrs: dict[str, str]) -> None:
        prop = attrs.get("property", "").lower()
        content = attrs.get("content", "")
        if prop == "og:image" and content:
            self.candidates.append(
                LogoCandidate(source="og_image", url=self._abs(content), svg_source=None, score=10)
            )

    def _handle_header_img(self, attrs: dict[str, str]) -> None:
        src = attrs.get("src", "")
        if not src:
            return
        alt = attrs.get("alt", "").lower()
        score = 70 if any(kw in alt for kw in ("logo", "brand", "home")) else 50
        self.candidates.append(
            LogoCandidate(source="header_img", url=self._abs(src), svg_source=None, score=score)
        )

    def _abs(self, href: str) -> str:
        if href.startswith(("http://", "https://", "//")):
            if href.startswith("//"):
                return f"https:{href}"
            return href
        return f"{self._base_url}/{href.lstrip('/')}"

    @staticmethod
    def _rebuild_tag(tag: str, attrs: list[tuple[str, str | None]]) -> str:
        parts = [tag]
        for k, v in attrs:
            if v is None:
                parts.append(k)
            else:
                parts.append(f'{k}="{v}"')
        return f"<{' '.join(parts)}>"


# Public:

def extract_logos(store_url: str) -> list[LogoCandidate]:
    """Fetch *store_url* and return logo candidates sorted by score (best first)."""
    url = _normalise_url(store_url)
    logger.info("Fetching %s for logo extraction …", url)

    req = Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    with urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    parser = _LogoExtractor(url)
    parser.feed(html)

    candidates = sorted(parser.candidates, key=lambda c: c["score"], reverse=True)
    logger.info("Found %d logo candidate(s)", len(candidates))
    return candidates


# Private:

_SIZE_RE = re.compile(r"(\d+)x(\d+)")


def _parse_icon_size(sizes_attr: str) -> int:
    match = _SIZE_RE.search(sizes_attr)
    if match:
        return min(int(match.group(1)), 256)
    return 0


def _normalise_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url
