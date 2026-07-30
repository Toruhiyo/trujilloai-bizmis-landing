import { Helmet } from "react-helmet-async";
import { useLocale } from "@/i18n/LocaleProvider";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS } from "@/i18n/locales";
import { localizePath } from "@/i18n/paths";

const SITE_URL = "https://www.bizmis.ai";
const DEFAULT_OG_IMAGE = "https://bizmis.ai/opengraph-image-p98pqg.png";

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route head tags. Overrides defaults in index.html for JS-executing
 * crawlers. Always provide a unique, locale-free `path` per route — the
 * canonical, hreflang alternates, and og:locale are derived from it and the
 * active locale.
 */
const Seo = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
}: SeoProps) => {
  const locale = useLocale();
  const url = `${SITE_URL}${localizePath(path, locale)}`;
  const ogLocale = LOCALE_TAGS[locale].replace("-", "_");
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {LOCALES.map((altLocale) => (
        <link
          key={altLocale}
          rel="alternate"
          hrefLang={LOCALE_TAGS[altLocale]}
          href={`${SITE_URL}${localizePath(path, altLocale)}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}${localizePath(path, DEFAULT_LOCALE)}`}
      />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
