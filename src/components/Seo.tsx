import { Helmet } from "react-helmet-async";
import { useLocale } from "@/i18n/LocaleProvider";
import { buildHeadTags, getPageSeo, type PageKey } from "@/seo/site";

export interface SeoProps {
  /** Which page: its title, description, image and structured data come from seo/site.ts. */
  page: PageKey;
  /** The path it's served on, when not the page's own (e.g. the landing at /v2). */
  path?: string;
  noIndex?: boolean;
}

/**
 * Per-route head tags. The build writes the same tags into each route's
 * static HTML (scripts/seo/prerender-plugin.ts); both come from
 * buildHeadTags, so what crawlers read before JavaScript runs and what the
 * app sets afterwards never drift apart.
 */
const Seo = ({ page, path, noIndex }: SeoProps) => {
  const locale = useLocale();
  const tags = buildHeadTags(getPageSeo(page, locale, { path, noIndex }));

  return (
    <Helmet>
      {tags.map((t, i) => {
        switch (t.tag) {
          case "title":
            return <title key={i}>{t.text}</title>;
          case "meta":
            return <meta key={i} {...t.attrs} />;
          case "link": {
            const { hreflang, ...rest } = t.attrs;
            return <link key={i} {...rest} {...(hreflang ? { hrefLang: hreflang } : {})} />;
          }
          case "script":
            return (
              <script key={i} {...t.attrs}>
                {t.text}
              </script>
            );
        }
      })}
    </Helmet>
  );
};

export default Seo;
