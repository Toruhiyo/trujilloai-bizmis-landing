import { getCurrentYear } from "../lib/utils/time";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_DEMO_STORE_URL,
} from "@/lib/bizmisUrls";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

type FooterLink = { label: string; href: string; newTab?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };

const Footer = () => {
  const messages = useMessages();
  const href = useLocaleHref();

  const linkColumns: FooterColumn[] = [
    {
      heading: messages.footer.columns.product,
      links: [
        { label: messages.footer.links.features, href: href("/#benefits") },
        { label: messages.footer.links.pricing, href: href("/pricing") },
        { label: messages.footer.links.demo, href: BIZMIS_DEMO_STORE_URL, newTab: true },
      ],
    },
    {
      heading: messages.footer.columns.support,
      links: [
        { label: messages.footer.links.contact, href: href("/contact") },
        { label: messages.footer.links.bookACall, href: BIZMIS_BOOK_A_CALL_GENERAL_URL, newTab: true },
        { label: messages.footer.links.faqs, href: href("/faqs") },
      ],
    },
    {
      heading: messages.footer.columns.legal,
      links: [
        { label: messages.footer.links.privacy, href: "/privacy" },
        { label: messages.footer.links.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-5 gap-8 md:gap-8">
          <div className="md:col-span-2">
            <Logo variant="white" size="md" showText className="mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md">
              {messages.footer.tagline}
            </p>

            {/* Built for Shopify Section */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 bg-gray-800 rounded-lg px-3 py-2.5 sm:p-4 max-w-fit">
              <p className="text-xs sm:text-sm font-medium text-white">
                {messages.footer.builtFor}
              </p>
              <img
                src="/images/shopify-full-logo-white.png"
                alt="Shopify logo"
                className="w-16 h-5 sm:w-20 sm:h-6 object-contain"
              />
            </div>
          </div>

          {/* Link columns — three side-by-side on phones (and beyond) so they
              don't stack into three separate full-height blocks. The wrapper
              spans the rest of the md grid (3 of 5 columns) with each child
              taking one of its inner columns. */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 md:col-span-3">
            {linkColumns.map(({ heading, links }) => (
              <div key={heading} className="min-w-0">
                <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
                  {heading}
                </h4>
                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                  {links.map(({ label, href: linkHref, newTab }) => (
                    <li key={label}>
                      <a
                        href={linkHref}
                        {...(linkHref.startsWith("http") || newTab
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                        className="hover:text-white transition-colors break-words"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 border-t border-gray-800 pt-6 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p className="text-center text-xs text-gray-400 sm:text-sm sm:text-left">
            {messages.footer.copyright(getCurrentYear())}
          </p>
          <LanguageSwitcher theme="dark" />
        </div>
        <p className="mt-3 text-center text-[11px] text-gray-500 sm:text-xs">
          {messages.footer.legalNotice}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
