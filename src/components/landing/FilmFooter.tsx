import { getCurrentYear } from "@/lib/utils/time";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_DEMO_STORE_URL,
} from "@/lib/bizmisUrls";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

/** The film landing's footer: the classic footer's links on the film's white. */
const FilmFooter = () => {
  const messages = useMessages();
  const href = useLocaleHref();
  const f = messages.footer;
  const columns = [
    {
      heading: f.columns.product,
      links: [
        { label: f.links.features, href: href("/#benefits") },
        { label: f.links.pricing, href: href("/pricing") },
        { label: f.links.demo, href: BIZMIS_DEMO_STORE_URL, newTab: true },
      ],
    },
    {
      heading: f.columns.support,
      links: [
        { label: f.links.contact, href: href("/contact") },
        {
          label: f.links.bookACall,
          href: BIZMIS_BOOK_A_CALL_GENERAL_URL,
          newTab: true,
        },
        { label: f.links.faqs, href: href("/faqs") },
      ],
    },
    {
      heading: f.columns.legal,
      links: [
        { label: f.links.privacy, href: "/privacy" },
        { label: f.links.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--bzl-border)] bg-white px-4 py-14 sm:px-6">
      <div className="bzl-wrap">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <img
              src="/images/bizmis-logo-full-orange-transparent.png"
              alt="Bizmis"
              className="h-7 w-auto"
            />
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-[var(--bzl-muted)]">
              {f.tagline}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 md:col-span-3">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-sm font-semibold text-[var(--bzl-fg)]">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-2.5 text-[0.9375rem] text-[var(--bzl-muted)]">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.href.startsWith("http") || l.newTab
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="transition-colors hover:text-[var(--bzl-orange-dark)]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-[var(--bzl-border)] pt-8 text-sm text-[var(--bzl-faint)] sm:flex-row sm:justify-between">
          <p>{f.copyright(getCurrentYear())}</p>
        </div>
      </div>
    </footer>
  );
};

export default FilmFooter;
