import { getCurrentYear } from "../lib/utils/time";
import { BIZMIS_DEMO_STORE_URL } from "@/lib/bizmisUrls";
import Logo from "./Logo";

type FooterLink = { label: string; href: string; newTab?: boolean };
type FooterColumn = { heading: string; links: FooterLink[] };

const Footer = () => {
  const linkColumns: FooterColumn[] = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "/#benefits" },
        { label: "Pricing", href: "/pricing" },
        { label: "Demo", href: BIZMIS_DEMO_STORE_URL, newTab: true },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "FAQs", href: "/faqs" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
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
              Your store's best salesperson, working 24/7 to boost sales,
              provide support, and understand your customers.
            </p>

            {/* Built for Shopify Section */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 bg-gray-800 rounded-lg px-3 py-2.5 sm:p-4 max-w-fit">
              <p className="text-xs sm:text-sm font-medium text-white">
                Built for
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
                  {links.map(({ label, href, newTab }) => (
                    <li key={label}>
                      <a
                        href={href}
                        {...(href.startsWith("http") || newTab
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

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; {getCurrentYear()} Bizmis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
